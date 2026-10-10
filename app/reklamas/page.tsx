'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { AD_BUCKET, AD_SLOTS, invalidateAds, isAdvertisingAdmin, mediaUrl, safeAdLink, type Advertisement, type AdSlot } from '../../lib/advertising'

const empty = { title: '', slot: 'desktop_1' as AdSlot, target_url: '', active: false, starts_at: '', ends_at: '' }
const types: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'video/mp4': 'mp4', 'video/webm': 'webm' }
const localDate = (value: string | null) => value ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''

export default function AdvertisingAdmin() {
  const [access, setAccess] = useState<'loading' | 'allowed' | 'denied'>('loading')
  const [ads, setAds] = useState<Advertisement[]>([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<Advertisement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const refresh = async () => {
    const { data, error } = await supabase.from('temauto_ads').select('*').order('created_at', { ascending: false })
    if (error) throw error
    setAds(data || [])
  }
  useEffect(() => {
    let alive = true
    const verify = async () => {
      const allowed = await isAdvertisingAdmin()
      if (!alive) return
      setAccess(allowed ? 'allowed' : 'denied')
      if (allowed) { try { await refresh() } catch { setMessage('Neizdevās ielādēt reklāmas. Mēģini vēlreiz.') } }
    }
    void verify()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { window.setTimeout(() => { void verify() }, 0) })
    return () => { alive = false; subscription.unsubscribe() }
  }, [])
  useEffect(() => {
    if (!file) { setPreview(editing ? mediaUrl(editing.media_path) : ''); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file, editing])
  const reset = () => { setForm(empty); setEditing(null); setFile(null); if (fileInput.current) fileInput.current.value = '' }
  const edit = (ad: Advertisement) => {
    setEditing(ad); setFile(null); setMessage('')
    if (fileInput.current) fileInput.current.value = ''
    setForm({ title: ad.title, slot: ad.slot, target_url: ad.target_url, active: ad.active, starts_at: localDate(ad.starts_at), ends_at: localDate(ad.ends_at) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    setMessage('')
    const link = safeAdLink(form.target_url.trim())
    if (!link) { setMessage('Ievadi pilnu https:// reklāmdevēja adresi bez lietotājvārda vai paroles.'); return }
    if (!file && !editing) { setMessage('Pievieno reklāmas failu.'); return }
    if (file && (!types[file.type] || file.size > 20 * 1024 * 1024)) { setMessage('Atļauts JPG, PNG, GIF, WebP, MP4 vai WebM līdz 20 MB.'); return }
    const start = form.starts_at ? new Date(form.starts_at).toISOString() : null
    const end = form.ends_at ? new Date(form.ends_at).toISOString() : null
    if (start && end && end <= start) { setMessage('Beigu laikam jābūt pēc sākuma laika.'); return }
    setBusy(true)
    let uploaded: string | null = null
    try {
      if (!await isAdvertisingAdmin()) throw new Error('Nav pārvaldīšanas tiesību. Pieslēdzies savam kontam.')
      let path = editing?.media_path || ''
      let kind = editing?.media_type || 'image'
      if (file) {
        path = `${crypto.randomUUID()}.${types[file.type]}`
        const { error } = await supabase.storage.from(AD_BUCKET).upload(path, file, { contentType: file.type, upsert: false })
        if (error) throw error
        uploaded = path
        kind = file.type.startsWith('video/') ? 'video' : 'image'
      }
      const record = { ...form, title: form.title.trim(), target_url: link, starts_at: start, ends_at: end, media_path: path, media_type: kind }
      const result = editing
        ? await supabase.from('temauto_ads').update(record).eq('id', editing.id).select('id').single()
        : await supabase.from('temauto_ads').insert(record).select('id').single()
      if (result.error) throw result.error
      uploaded = null
      if (editing && file) await supabase.storage.from(AD_BUCKET).remove([editing.media_path])
      invalidateAds(); reset(); await refresh(); setMessage('Reklāma saglabāta.')
    } catch (error) {
      if (uploaded) await supabase.storage.from(AD_BUCKET).remove([uploaded])
      setMessage(error instanceof Error ? error.message : 'Neizdevās saglabāt reklāmu. Pārbaudi pieslēgšanos un mēģini vēlreiz.')
    } finally { setBusy(false) }
  }
  const change = async (ad: Advertisement, remove = false) => {
    if (busy || (remove && !window.confirm(`Dzēst reklāmu “${ad.title}”?`))) return
    setBusy(true); setMessage('')
    try {
      const result = remove ? await supabase.from('temauto_ads').delete().eq('id', ad.id).select('id').single()
        : await supabase.from('temauto_ads').update({ active: !ad.active }).eq('id', ad.id).select('id').single()
      if (result.error) throw result.error
      if (remove) { await supabase.storage.from(AD_BUCKET).remove([ad.media_path]); if (editing?.id === ad.id) reset() }
      invalidateAds(); await refresh(); setMessage(remove ? 'Reklāma dzēsta.' : 'Reklāmas statuss mainīts.')
    } catch { setMessage('Darbība neizdevās. Pārbaudi pieslēgšanos un mēģini vēlreiz.') }
    finally { setBusy(false) }
  }
  if (access === 'loading') return <main style={{ padding: 24 }}>Pārbauda piekļuvi…</main>
  if (access === 'denied') return <main style={{ padding: 24 }}><h1>Reklāmu pārvaldība</h1><p>Šī sadaļa pieejama tikai TemAuto īpašnieka kontam.</p><Link href="/login">Pieslēgties</Link></main>
  const video = file ? file.type.startsWith('video/') : editing?.media_type === 'video'
  return <main data-ad-admin="true" style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 56px' }}>
    <style>{`
      @media(max-width:767px){[data-ad-admin] > h1,[data-ad-admin] > a[href="/kabinets"]{display:none}}
      [data-ad-admin] {color:#0f172a;background:#f8fafc}
      [data-ad-admin] form,[data-ad-admin] article {background:white;border:1px solid #cbd5e1;border-radius:10px;padding:18px;margin:16px 0}
      [data-ad-admin] label {display:block;margin:12px 0}
      [data-ad-admin] input:not([type=checkbox]),[data-ad-admin] select {display:block;width:100%;box-sizing:border-box;padding:10px;border:1px solid #94a3b8;border-radius:6px;margin-top:5px;font:inherit}
      [data-ad-admin] button {padding:10px 14px;border:1px solid #64748b;border-radius:6px;margin:4px;cursor:pointer;font:inherit}
      [data-ad-admin] button:disabled {opacity:.5;cursor:wait}
      html[data-temauto-theme=night] [data-ad-admin] {color:#f1f5f9;background:#020617}
      html[data-temauto-theme=night] [data-ad-admin] form,html[data-temauto-theme=night] [data-ad-admin] article {background:#0f172a}
      @media(min-width:768px){html[data-temauto-desktop-theme=night] [data-ad-admin]{color:#f1f5f9;background:#020617}html[data-temauto-desktop-theme=night] [data-ad-admin] form,html[data-temauto-desktop-theme=night] [data-ad-admin] article{background:#0f172a}}
    `}</style>
    <Link href="/kabinets">← Mans kabinets</Link>
    <h1>Reklāmu pārvaldība</h1>
    <p>Pieeja tikai Tavam kontam. Pievieno reklāmu un izvēlies esošo banera vietu.</p>
    <p role="status" aria-live="polite">{message}</p>
    <form onSubmit={save}>
      <h2>{editing ? 'Rediģēt reklāmu' : 'Pievienot reklāmu'}</h2>
      <label>Reklāmas nosaukums<input required maxLength={120} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
      <label>Reklāmas vieta<select value={form.slot} onChange={e => setForm({ ...form, slot: e.target.value as AdSlot })}>{Object.entries(AD_SLOTS).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
      <label>Reklāmdevēja vietne<input type="url" required placeholder="https://…" value={form.target_url} onChange={e => setForm({ ...form, target_url: e.target.value })} /></label>
      <label>Attēls, GIF vai video<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm" onChange={e => setFile(e.target.files?.[0] || null)} /></label>
      <p>JPG, PNG, GIF, WebP, MP4 vai WebM, līdz 20 MB. Video tiek atskaņots bez skaņas. Faili tiek glabāti publiskā reklāmu glabātuvē — neaugšupielādē konfidenciālus materiālus.</p>
      {preview && <div style={{ height: 220, background: '#1e293b', borderRadius: 8 }}>{video ? <video src={preview} controls muted playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <img src={preview} alt="Reklāmas priekšskatījums" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}</div>}
      <label>Sākums (Tavas ierīces vietējais laiks)<input type="datetime-local" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} /></label>
      <label>Beigas (Tavas ierīces vietējais laiks)<input type="datetime-local" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} /></label>
      <p>Tukšs lauks nozīmē, ka attiecīgā laika ierobežojuma nav. Vienā vietā rāda jaunāko aktīvo reklāmu, kuras publicēšanas laiks ir spēkā.</p>
      <label><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Publicēt reklāmu</label>
      <button type="submit" disabled={busy}>{busy ? 'Saglabā…' : 'Saglabāt'}</button>
      {editing && <button type="button" disabled={busy} onClick={reset}>Atcelt rediģēšanu</button>}
    </form>
    <h2>Tavas reklāmas ({ads.length})</h2>
    {ads.map(ad => <article key={ad.id}>
      <h3>{ad.title}</h3><p>{AD_SLOTS[ad.slot]} · {ad.active ? 'Ieslēgta' : 'Apturēta'}</p>
      <p>{ad.starts_at ? new Date(ad.starts_at).toLocaleString('lv-LV') : 'Bez sākuma ierobežojuma'} → {ad.ends_at ? new Date(ad.ends_at).toLocaleString('lv-LV') : 'Bez beigu ierobežojuma'}</p>
      <a href={safeAdLink(ad.target_url) || undefined} target="_blank" rel="noopener noreferrer">{ad.target_url}</a>
      <div><button disabled={busy} onClick={() => edit(ad)}>Rediģēt</button><button disabled={busy} onClick={() => change(ad)}>{ad.active ? 'Apturēt' : 'Aktivizēt'}</button><button disabled={busy} onClick={() => change(ad, true)}>Dzēst</button></div>
    </article>)}
  </main>
}
