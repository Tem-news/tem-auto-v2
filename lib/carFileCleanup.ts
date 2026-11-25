import { supabase } from './supabase'

// The database atomically queues only photos removed by the listing owner.
// Failed deletion stays in the queue, including after closing the browser.
export async function cleanupCarPhotos(): Promise<boolean> {
  try {
    const { data: pending, error } = await supabase.from('temauto_car_file_cleanup').select('media_path').order('created_at').limit(100)
    if (error) throw error
    for (const item of pending || []) {
      try {
        const { data: used, error: lookupError } = await supabase.rpc('temauto_car_photo_in_use', { file_path: item.media_path })
        if (lookupError) throw lookupError
        if (used) continue
        const bucket = supabase.storage.from('car-images')
        const { data: removed, error: removeError } = await bucket.remove([item.media_path])
        if (removeError) throw removeError
        if (!removed?.length) {
          const slash = item.media_path.lastIndexOf('/')
          const folder = slash < 0 ? '' : item.media_path.slice(0, slash)
          const name = item.media_path.slice(slash + 1)
          const { data: files, error: listError } = await bucket.list(folder, { search: name, limit: 100 })
          if (listError) throw listError
          if (files?.some(file => file.name === name)) throw new Error('Photo still exists')
        }
        const { error: clearError } = await supabase.from('temauto_car_file_cleanup').delete().eq('media_path', item.media_path)
        if (clearError) throw clearError
      } catch {
        // Keep this entry so a later cabinet visit can retry it safely.
      }
    }
    const { count, error: countError } = await supabase.from('temauto_car_file_cleanup').select('media_path', { count: 'exact', head: true })
    if (countError) throw countError
    return count === 0
  } catch { return false }
}
