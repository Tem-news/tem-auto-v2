'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { COUNTRIES } from '../../lib/countries'
import { supabase } from '../../lib/supabase'
import { AD_BUCKET, AD_SLOTS, invalidateAds, isAdvertisingAdmin, mediaUrl, safeAdLink, type Advertisement, type AdSlot } from '../../lib/advertising'

const empty = { title: '', slot: 'desktop_1' as AdSlot, target_url: '', active: false, starts_at: '', ends_at: '', country_codes: [] as string[] | null }
const types: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'video/mp4': 'mp4', 'video/webm': 'webm' }
const localDate = (value: string | null) => value ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''

function MobileAdvertisingCountries({ codes, onChange }: { codes: string[] | null; onChange: (codes: string[] | null) => void }) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0)
  const [search, setSearch] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (phase !== 2) return
    const keepVisible = () => input.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    window.visualViewport?.addEventListener('resize', keepVisible)
    return () => window.visualViewport?.removeEventListener('resize', keepVisible)
  }, [phase])
  const tap = () => {
    if (phase === 0) {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
      setPhase(1)
    } else if (phase === 1) {
      if (input.current) {
        input.current.readOnly = false
        input.current.focus({ preventScroll: true })
      }
      setPhase(2)
    } else {
      if (input.current) { input.current.readOnly = true; input.current.blur() }
      setSearch('')
      setPhase(0)
    }
  }
  return <fieldset data-ad-countries="true" data-mobile-ad-countries="true">
    <legend>Valstis, kurās rādīt reklāmu</legend>
    <div style={{ position: 'relative' }}>
      <label>Meklēt valsti<input ref={input} type="search" value={search} readOnly={phase !== 2} aria-expanded={phase > 0} aria-controls="mobile-ad-country-options"
        placeholder="Valsts nosaukums…" style={{ scrollMarginTop: 70 }}
        onPointerDown={event => { event.preventDefault(); event.stopPropagation() }}
        onClick={event => { event.preventDefault(); event.stopPropagation(); tap() }}
        onChange={event => setSearch(event.target.value)} /></label>
      {phase > 0 && <div id="mobile-ad-country-options" data-ad-country-options="true">
        <label data-ad-country="true"><input type="checkbox" checked={codes === null} onChange={event => onChange(event.target.checked ? null : [])} /><span>Visas valstis</span></label>
        {COUNTRIES.filter(country => country.name.toLocaleLowerCase('lv').includes(search.trim().toLocaleLowerCase('lv'))).map(country => <label key={country.code} data-ad-country="true">
          <input type="checkbox" checked={codes === null || codes.includes(country.code)} onChange={event => {
            const current = codes === null ? COUNTRIES.map(item => item.code) : codes
            const next = event.target.checked ? [...current, country.code] : current.filter(code => code !== country.code)
            onChange(next.length === COUNTRIES.length ? null : next)
          }} />
          <img src={country.flagUrl} alt="" width={20} height={15} style={{ objectFit: 'cover' }} /><span>{country.name}</span>
        </label>)}
      </div>}
    </div>
  </fieldset>
}

function DesktopAdvertisingCountries({ codes, onChange }: { codes: string[] | null; onChange: (codes: string[] | null) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const container = useRef<HTMLFieldSetElement>(null)
  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])
  return <fieldset ref={container} data-ad-countries="true" data-ad-desktop-countries="true">
    <legend>Valstis, kurās rādīt reklāmu</legend>
    <div style={{ position: 'relative' }}>
      <label>Meklēt valsti<input type="search" value={search} aria-expanded={open} aria-controls="desktop-ad-country-options" placeholder="Valsts nosaukums…"
        onFocus={() => setOpen(true)} onClick={() => setOpen(true)} onChange={event => { setSearch(event.target.value); setOpen(true) }}
        onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); event.currentTarget.blur() } }} /></label>
      {open && <div id="desktop-ad-country-options" data-ad-country-options="true">
        <label data-ad-country="true"><input type="checkbox" checked={codes === null} onChange={event => onChange(event.target.checked ? null : [])} /><span>Visas valstis</span></label>
        {COUNTRIES.filter(country => country.name.toLocaleLowerCase('lv').includes(search.trim().toLocaleLowerCase('lv'))).map(country => <label key={country.code} data-ad-country="true">
          <input type="checkbox" checked={codes === null || codes.includes(country.code)} onChange={event => {
            const current = codes === null ? COUNTRIES.map(item => item.code) : codes
            const next = event.target.checked ? [...current, country.code] : current.filter(code => code !== country.code)
            onChange(next.length === COUNTRIES.length ? null : next)
          }} />
          <img src={country.flagUrl} alt="" width={20} height={15} style={{ objectFit: 'cover' }} /><span>{country.name}</span>
        </label>)}
      </div>}
    </div>
  </fieldset>
}

export default function AdvertisingAdmin() {
  const [access, setAccess] = useState<'loading' | 'allowed' | 'denied'>('loading')
  const [ads, setAds] = useState<Advertisement[]>([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<Advertisement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [message, setMessage] = useState('')
  const [countrySearch, setCountrySearch] = useState('')
  const [busy, setBusy] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const [mobileCountries, setMobileCountries] = useState(false)
  const [countryPickerVersion, setCountryPickerVersion] = useState(0)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const sync = () => setMobileCountries(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])
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
  const reset = () => { setCountryPickerVersion(value => value + 1); setForm(empty); setCountrySearch(''); setEditing(null); setFile(null); if (fileInput.current) fileInput.current.value = '' }
  const edit = (ad: Advertisement) => {
    setCountryPickerVersion(value => value + 1); setEditing(ad); setCountrySearch(''); setFile(null); setMessage('')
    if (fileInput.current) fileInput.current.value = ''
    setForm({ title: ad.title, slot: ad.slot, target_url: ad.target_url, active: ad.active, starts_at: localDate(ad.starts_at), ends_at: localDate(ad.ends_at), country_codes: ad.country_codes ?? null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    setMessage('')
    if (form.country_codes !== null && form.country_codes.length === 0) { setMessage('Izvēlies vismaz vienu valsti vai atzīmē “Visas valstis”.'); return }
    const address = form.target_url.trim()
    const link = address ? safeAdLink(address) : ''
    if (address && !link) { setMessage('Ievadi pilnu https:// reklāmdevēja adresi bez lietotājvārda vai paroles.'); return }
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
      [data-ad-admin] [data-ad-country-list] {max-height:260px;overflow-y:auto;overscroll-behavior:contain;display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:4px}
      [data-ad-admin] label[data-ad-country] {display:flex;align-items:center;gap:8px;margin:0;padding:8px;cursor:pointer}
      [data-ad-admin] [data-ad-countries] {min-width:0;margin:16px 0;padding:12px;border:1px solid #94a3b8;border-radius:6px}
      [data-ad-admin] [data-ad-country-options] {position:absolute;top:100%;left:0;right:0;z-index:20;max-height:260px;overflow-y:auto;overscroll-behavior:contain;background:#fff;color:#0f172a;border:1px solid #94a3b8;border-radius:6px;box-shadow:0 6px 16px #0003;touch-action:pan-y}
      @media(max-width:767px){[data-ad-admin] [data-ad-desktop-countries]{display:none}html[data-temauto-theme=night] [data-ad-admin] [data-ad-country-options]{background:#0f172a;color:#f1f5f9}}
      [data-ad-admin] button:disabled {opacity:.5;cursor:wait}
      html[data-temauto-theme=night] [data-ad-admin] {color:#f1f5f9;background:#020617}
      html[data-temauto-theme=night] [data-ad-admin] form,html[data-temauto-theme=night] [data-ad-admin] article {background:#0f172a}
      @media(min-width:768px){html[data-temauto-desktop-theme=night] [data-ad-admin] [data-ad-country-options]{background:#0f172a;color:#f1f5f9}}
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
      {mobileCountries ? <MobileAdvertisingCountries key={`${editing?.id || 'new'}-${countryPickerVersion}`} codes={form.country_codes} onChange={codes => setForm(previous => ({ ...previous, country_codes: codes }))} /> : <DesktopAdvertisingCountries key={`${editing?.id || 'new'}-${countryPickerVersion}`} codes={form.country_codes} onChange={codes => setForm(previous => ({ ...previous, country_codes: codes }))} />}
      <label>Reklāmdevēja vietne<input type="url" placeholder="https://… (nav obligāti)" value={form.target_url} onChange={e => setForm({ ...form, target_url: e.target.value })} /></label>
      <label>Attēls, GIF vai video<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm" onChange={e => setFile(e.target.files?.[0] || null)} /></label>
      <p>JPG, PNG, GIF, WebP, MP4 vai WebM, līdz 20 MB. Video tiek atskaņots bez skaņas. Faili tiek glabāti publiskā reklāmu glabātuvē — neaugšupielādē konfidenciālus materiālus.</p>
      {preview && <div style={{ height: 220, background: '#1e293b', borderRadius: 8 }}>{video ? <video src={preview} controls muted playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <img src={preview} alt="Reklāmas priekšskatījums" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}</div>}
      <label>Sākums (Tavas ierīces vietējais laiks)<input type="datetime-local" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} /></label>
      <label>Beigas (Tavas ierīces vietējais laiks)<input type="datetime-local" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} /></label>
      <p>Tukšs lauks nozīmē, ka attiecīgā laika ierobežojuma nav. Vienā vietā rāda jaunāko aktīvo reklāmu, kas atbilst izvēlētajai valstij un kuras publicēšanas laiks ir spēkā.</p>
      <label><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Publicēt reklāmu</label>
      <button type="submit" disabled={busy}>{busy ? 'Saglabā…' : 'Saglabāt'}</button>
      {editing && <button type="button" disabled={busy} onClick={reset}>Atcelt rediģēšanu</button>}
    </form>
    <h2>Tavas reklāmas ({ads.length})</h2>
    {ads.map(ad => <article key={ad.id}>
      <h3>{ad.title}</h3><p>{AD_SLOTS[ad.slot]} · {ad.active ? 'Ieslēgta' : 'Apturēta'}</p>
      <p>{ad.starts_at ? new Date(ad.starts_at).toLocaleString('lv-LV') : 'Bez sākuma ierobežojuma'} → {ad.ends_at ? new Date(ad.ends_at).toLocaleString('lv-LV') : 'Bez beigu ierobežojuma'}</p>
      <p>Valstis: {ad.country_codes == null ? 'Visas valstis' : COUNTRIES.filter(country => ad.country_codes?.includes(country.code)).map(country => country.name).join(', ')}</p>
      <a href={safeAdLink(ad.target_url) || undefined} target="_blank" rel="noopener noreferrer">{ad.target_url}</a>
      <div><button disabled={busy} onClick={() => edit(ad)}>Rediģēt</button><button disabled={busy} onClick={() => change(ad)}>{ad.active ? 'Apturēt' : 'Aktivizēt'}</button><button disabled={busy} onClick={() => change(ad, true)}>Dzēst</button></div>
    </article>)}
  </main>
}
