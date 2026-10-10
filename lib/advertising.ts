import { supabase } from './supabase'

export const AD_SLOTS = {
  desktop_1: 'Monitors — labā mala, augšējais baneris',
  desktop_2: 'Monitors — labā mala, apakšējais baneris',
  desktop_form_1: 'Monitors — pievienošana/rediģēšana, augšējais baneris',
  desktop_form_2: 'Monitors — pievienošana/rediģēšana, apakšējais baneris',
  desktop_form_left_1: 'Monitors — pievienošana, kreisā mala augšā',
  desktop_form_left_2: 'Monitors — pievienošana, kreisā mala apakšā',
  desktop_login: 'Monitors — pieslēgšanās',
  mobile_menu: 'Mobilā versija — Menu',
  mobile_list: 'Mobilā versija — sludinājumu saraksts',
  mobile_brands: 'Mobilā versija — marku izvēle',
} as const
export type AdSlot = keyof typeof AD_SLOTS
export type Advertisement = {
  id: string; title: string; slot: AdSlot; media_path: string; media_type: 'image' | 'video';
  target_url: string; active: boolean; starts_at: string | null; ends_at: string | null; created_at: string;
}
export const AD_BUCKET = 'temauto-ads'
export const mediaUrl = (path: string) => supabase.storage.from(AD_BUCKET).getPublicUrl(path).data.publicUrl
export function safeAdLink(value: string): string | null {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  } catch { return null }
}
export async function isAdvertisingAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data, error } = await supabase.from('temauto_ad_admins').select('user_id').eq('user_id', user.id).maybeSingle()
  return !error && !!data
}
let pending: Promise<Advertisement[]> | null = null
let cached: Advertisement[] = []
let expires = 0
export function invalidateAds() { expires = 0; window.dispatchEvent(new Event('temauto-ads-updated')) }
export async function publishedAds(): Promise<Advertisement[]> {
  if (Date.now() < expires) return cached
  if (pending) return pending
  pending = (async () => {
    const now = new Date().toISOString()
    const { data, error } = await supabase.from('temauto_ads').select('*').eq('active', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`).or(`ends_at.is.null,ends_at.gt.${now}`).order('created_at', { ascending: false })
    cached = error ? [] : (data || []) as Advertisement[]
    expires = Date.now() + 30000
    return cached
  })()
  try { return await pending } finally { pending = null }
}
