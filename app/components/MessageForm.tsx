'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useI18n } from '../../lib/i18n'
import { supabase } from '../../lib/supabase'
import { MESSAGE_CATEGORIES, type MessageCategory } from '../../lib/messages'

export default function MessageForm({ category = 'suggestions', selectable = false }: { category?: MessageCategory; selectable?: boolean }) {
  const { t, language } = useI18n()
  const [chosen, setChosen] = useState<MessageCategory>(category)
  const [body, setBody] = useState('')
  const [email, setEmail] = useState('')
  const [listing, setListing] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const requestId = useRef<string | null>(null)
  const sending = useRef(false)
  useEffect(() => {
    if (!selectable) return
    const query = new URLSearchParams(window.location.search)
    const topic = query.get('tema')
    if (topic && Object.prototype.hasOwnProperty.call(MESSAGE_CATEGORIES, topic)) setChosen(topic as MessageCategory)
    const id = query.get('sludinajums')
    if (id && /^\d+$/.test(id)) setListing(new URL('/auto/' + id, window.location.origin).href)
  }, [selectable])
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (sending.current) return
    sending.current = true
    setBusy(true); setNotice('')
    try {
      requestId.current ||= crypto.randomUUID()
      const { data, error } = await supabase.functions.invoke('temauto-message', { body: {
        id: requestId.current, category: chosen, body, email, listing_url: listing, website,
        language, country: document.documentElement.dataset.temautoAdCountry || null,
      } })
      if (error || !data?.ok) {
        const status = (error as { context?: Response } | null)?.context?.status
        setNotice(t(status === 429 ? 'Pārāk daudz ziņojumu. Mēģini vēlreiz vēlāk.' : 'Neizdevās nosūtīt ziņojumu. Mēģini vēlreiz.'))
        return
      }
      setBody(''); requestId.current = null
      setNotice(t('Ziņojums nosūtīts.'))
    } catch { setNotice(t('Neizdevās nosūtīt ziņojumu. Mēģini vēlreiz.')) }
    finally { sending.current = false; setBusy(false) }
  }
  return <form data-temauto-message-form="true" onSubmit={submit} style={{ display:'grid',gap:12,marginTop:24 }}>
    <style>{`
      [data-temauto-message-form="true"] input,[data-temauto-message-form="true"] select,[data-temauto-message-form="true"] textarea{width:100%;box-sizing:border-box;padding:12px;border:1px solid #94a3b8;border-radius:8px;background:#fff;color:#1e293b;font:inherit}
      [data-temauto-message-form="true"] label{display:grid;gap:6px;font-weight:600}
      @media(max-width:767px){html[data-temauto-theme="night"] [data-temauto-message-form="true"] input,html[data-temauto-theme="night"] [data-temauto-message-form="true"] select,html[data-temauto-theme="night"] [data-temauto-message-form="true"] textarea{background:#0f172a;color:#f1f5f9}}
      @media(min-width:768px){html[data-temauto-desktop-theme="night"] [data-temauto-message-form="true"] input,html[data-temauto-desktop-theme="night"] [data-temauto-message-form="true"] select,html[data-temauto-desktop-theme="night"] [data-temauto-message-form="true"] textarea{background:#0f172a;color:#f1f5f9}}
    `}</style>
    {selectable ? <label>{t('Tēma')}<select value={chosen} disabled={busy} onChange={event => setChosen(event.target.value as MessageCategory)}>
      {Object.entries(MESSAGE_CATEGORIES).map(([value,label]) => <option key={value} value={value}>{t(label)}</option>)}
    </select></label> : <h2 style={{margin:0,fontSize:20}}>{t(MESSAGE_CATEGORIES[chosen])}</h2>}
    <label>{t('Apraksts')}<textarea required minLength={3} maxLength={10000} rows={6} value={body} disabled={busy} onChange={event => setBody(event.target.value)} /></label>
    <label>{t('E-pasts')}<input type="email" maxLength={254} autoComplete="email" value={email} disabled={busy} onChange={event => setEmail(event.target.value)} /></label>
    {chosen === 'reports' && <label>{t('Sludinājuma saite (nav obligāta)')}<input type="url" maxLength={2048} value={listing} disabled={busy} onChange={event => setListing(event.target.value)} /></label>}
    <div aria-hidden="true" style={{position:'absolute',left:-10000,width:1,height:1,overflow:'hidden'}}>
      <input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} />
    </div>
    <p style={{margin:0,fontSize:14,lineHeight:1.5}}>{t('Tavs ziņojums būs privāts')}</p>
    <button type="submit" disabled={busy} style={{padding:12,border:0,borderRadius:8,background:'#2563eb',color:'#fff',font:'inherit',fontWeight:700,cursor:busy?'wait':'pointer'}}>{t('Nosūtīt ziņojumu')}</button>
    <p role="status" aria-live="polite" style={{margin:0}}>{notice}</p>
  </form>
}
