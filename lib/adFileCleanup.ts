import { supabase } from './supabase'
import { AD_BUCKET } from './advertising'

// Only obsolete advertising files are queued. The database queues replacements
// and deletions in the same transaction as the advertising record change.
export async function queueFailedAdUpload(path: string) {
  const { error } = await supabase.from('temauto_ad_file_cleanup').upsert({ media_path: path }, { onConflict: 'media_path', ignoreDuplicates: true })
  if (error) throw error
}

export async function cleanupAdFiles(): Promise<number> {
  const { data: pending, error } = await supabase.from('temauto_ad_file_cleanup').select('media_path').order('created_at').limit(100)
  if (error) throw error
  for (const item of pending || []) {
    try {
      const { data: used, error: lookupError } = await supabase.from('temauto_ads').select('id').eq('media_path', item.media_path).limit(1)
      if (lookupError) throw lookupError
      if (!used?.length) {
        const { data: removed, error: removeError } = await supabase.storage.from(AD_BUCKET).remove([item.media_path])
        if (removeError) throw removeError
        // An empty response may mean the object was already deleted, or that
        // a policy prevented deletion. Verify absence before clearing the queue.
        if (!removed?.length) {
          const { data: existing, error: listError } = await supabase.storage.from(AD_BUCKET).list('', { search: item.media_path, limit: 100 })
          if (listError) throw listError
          if (existing?.some(file => file.name === item.media_path)) throw new Error('Fails vēl atrodas glabātuvē.')
        }
      }
      const { error: clearError } = await supabase.from('temauto_ad_file_cleanup').delete().eq('media_path', item.media_path)
      if (clearError) throw clearError
    } catch {
      // Keep the durable entry for the next attempt, without stopping other files.
    }
  }
  const { count, error: countError } = await supabase.from('temauto_ad_file_cleanup').select('media_path', { count: 'exact', head: true })
  if (countError) throw countError
  return count || 0
}
