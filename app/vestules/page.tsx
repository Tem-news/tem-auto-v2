'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { isAdvertisingAdmin } from '../../lib/advertising'
import { type MessageCategory, type PlatformMessage } from '../../lib/messages'

const mailboxes: Record<MessageCategory, string> = {
  suggestions:'Ieteikumi', advertising:'Reklāmas un sadarbība',
  legal:'Juridiskie jautājumi', reports:'Ziņojumi par pārkāpumiem un krāpniecību',
}
export default function MessagesPage() {
  const [access,setAccess] = useState<'loading'|'allowed'|'denied'>('loading')
  const [category,setCategory] = useState<MessageCategory>('suggestions')
  const [counts,setCounts] = useState<Record<string,number>>({})
  const [letters,setLetters] = useState<PlatformMessage[]>([])
  const [selected,setSelected] = useState<PlatformMessage|null>(null)
  const [page,setPage] = useState(0)
  const [total,setTotal] = useState(0)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)
  const generation = useRef(0)
  const detail = useRef<HTMLElement>(null)
  useEffect(() => { if(selected) detail.current?.scrollIntoView({block:'start',behavior:'smooth'}) },[selected?.id])
  const refreshCounts = useCallback(async () => {
    const pairs = await Promise.all(Object.keys(mailboxes).map(async key => {
      const {count,error} = await supabase.from('temauto_messages').select('id',{count:'exact',head:true}).eq('category',key).is('read_at',null)
      if(error) throw error
      return [key,count||0] as const
    }))
    setCounts(Object.fromEntries(pairs))
  },[])
  const loadLetters = useCallback(async (background = false) => {
    const version = ++generation.current
    if (!background) setLoading(true)
    try {
      const {data,count,error} = await supabase.from('temauto_messages').select('*',{count:'exact'}).eq('category',category).order('created_at',{ascending:false}).order('id').range(page*25,page*25+24)
      if(error) throw error
      if(version === generation.current){setLetters(data||[]);setTotal(count||0)}
    } finally {if(version === generation.current && !background)setLoading(false)}
  },[category,page])
  useEffect(() => {
    let alive=true
    const verify=async()=>{try{const allowed=await isAdvertisingAdmin();if(alive)setAccess(allowed?'allowed':'denied')}catch{if(alive){setError('Neizdevās pārbaudīt piekļuvi.');setAccess('denied')}}}
    void verify()
    const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>{setSelected(null);setLetters([]);setCounts({});window.setTimeout(()=>void verify(),0)})
    return()=>{alive=false;subscription.unsubscribe()}
  },[])
  useEffect(()=>{
    if(access!=='allowed')return
    const refresh=()=>{void Promise.all([loadLetters(true),refreshCounts()]).catch(()=>setError('Neizdevās atjaunot iesūtni.'))}
    const timer=window.setInterval(refresh,30000)
    return()=>window.clearInterval(timer)
  },[access,refreshCounts,loadLetters])
  useEffect(()=>{
    if(access!=='allowed')return
    setSelected(null);setError('')
    void Promise.all([loadLetters(),refreshCounts()]).catch(()=>setError('Neizdevās ielādēt vēstules. Mēģini vēlreiz.'))
    return()=>{generation.current++}
  },[access,loadLetters,refreshCounts])
  const update = async (letter:PlatformMessage, changes:{read_at?:string|null;status?:PlatformMessage['status']}) => {
    setBusy(true);setError('')
    try {
      const {data,error}=await supabase.from('temauto_messages').update(changes).eq('id',letter.id).select('*').single()
      if(error)throw error
      setSelected(data);setLetters(items=>items.map(item=>item.id===letter.id?data:item))
      await refreshCounts()
    } catch {setError('Neizdevās atjaunināt vēstuli. Mēģini vēlreiz.')}
    finally{setBusy(false)}
  }
  const open = async (letter:PlatformMessage) => {
    setSelected(letter)
    if(!letter.read_at)await update(letter,{read_at:new Date().toISOString()})
  }
  if(access==='loading')return <main style={{padding:24}}>Pārbauda piekļuvi…</main>
  if(access==='denied')return <main style={{padding:24}}><h1>Vēstuļu pārvaldība</h1><p>Šī sadaļa pieejama tikai TemAuto īpašnieka kontam.</p><Link href="/login">Pieslēgties</Link></main>
  return <main data-mail-admin="true" style={{maxWidth:1000,margin:'0 auto',padding:'24px 16px 56px',color:'#1e293b'}}>
    <style>{`
      [data-mail-admin="true"] button,[data-mail-admin="true"] select{font:inherit;cursor:pointer}
      [data-mail-admin="true"] button:disabled{opacity:.5;cursor:wait}
      [data-mail-admin="true"] [data-mail-boxes]{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:20px 0}
      [data-mail-admin="true"] [data-mail-box]{padding:14px;border:1px solid #94a3b8;border-radius:10px;background:#f8fafc;color:inherit;text-align:left}
      [data-mail-admin="true"] [data-mail-box][aria-pressed="true"]{background:#dbeafe;border-color:#2563eb}
      [data-mail-admin="true"] [data-mail-letter]{display:block;width:100%;padding:14px;margin-bottom:8px;border:1px solid #94a3b8;border-radius:8px;background:#fff;color:inherit;text-align:left;overflow-wrap:anywhere}
      [data-mail-admin="true"] [data-mail-letter][data-mail-unread="true"]{border-left:5px solid #2563eb}
      [data-mail-admin="true"] [data-mail-unread-badge]{display:inline-block;margin-right:8px;margin-bottom:4px;padding:2px 8px;border-radius:12px;background:#dc2626;color:#fff;font-size:13px;font-weight:700}
      [data-mail-admin="true"] [data-mail-detail]{padding:18px;margin-top:20px;border:1px solid #94a3b8;border-radius:10px;background:#fff;overflow-wrap:anywhere}
      @media(max-width:767px){[data-mail-admin="true"]>h1,[data-mail-admin="true"]>a{display:none}html[data-temauto-theme="night"] [data-mail-admin="true"]{color:#f1f5f9;background:#020617}html[data-temauto-theme="night"] [data-mail-admin="true"] [data-mail-box],html[data-temauto-theme="night"] [data-mail-admin="true"] [data-mail-letter],html[data-temauto-theme="night"] [data-mail-admin="true"] [data-mail-detail]{background:#0f172a}html[data-temauto-theme="night"] [data-mail-admin="true"] [data-mail-box][aria-pressed="true"]{background:#1e3a8a}}
      @media(min-width:768px){html[data-temauto-desktop-theme="night"] [data-mail-admin="true"]{color:#f1f5f9;background:#020617}html[data-temauto-desktop-theme="night"] [data-mail-admin="true"] [data-mail-box],html[data-temauto-desktop-theme="night"] [data-mail-admin="true"] [data-mail-letter],html[data-temauto-desktop-theme="night"] [data-mail-admin="true"] [data-mail-detail]{background:#0f172a}html[data-temauto-desktop-theme="night"] [data-mail-admin="true"] [data-mail-box][aria-pressed="true"]{background:#1e3a8a}}
    `}</style>
    <Link href="/kabinets" style={{color:'#0284c7'}}>← Mans kabinets</Link>
    <h1>Vēstuļu pārvaldība</h1>
    <p role="status" aria-live="polite">Nelasītas vēstules: <strong>{Object.values(counts).reduce((sum,n)=>sum+n,0)}</strong></p>
    <div data-mail-boxes="true">{Object.entries(mailboxes).map(([key,label])=><button type="button" key={key} data-mail-box="true" aria-pressed={category===key} onClick={()=>{setSelected(null);if(category===key&&page===0)void loadLetters().catch(()=>setError('Neizdevās ielādēt vēstules.'));setPage(0);setCategory(key as MessageCategory)}}>
      <strong>{label}</strong><br/><span style={{display:'inline-block',marginTop:8,padding:'2px 8px',borderRadius:12,background:counts[key]?'#dc2626':'#64748b',color:'#fff'}}>{counts[key]||0} nelasītas</span>
    </button>)}</div>
    <button type="button" disabled={busy||loading} onClick={()=>{setError('');void Promise.all([loadLetters(),refreshCounts()]).catch(()=>setError('Neizdevās atjaunot iesūtni.'))}}>Atjaunot iesūtni</button>
    <p role="status" aria-live="polite">{error}</p>
    <h2>{mailboxes[category]} — kopā: {total}</h2>
    {loading?<p>Ielādē…</p>:letters.length===0?<p>Šajā pastkastītē vēstuļu vēl nav.</p>:letters.map(letter=><button type="button" disabled={busy} data-mail-letter="true" data-mail-unread={!letter.read_at ? "true" : "false"} key={letter.id} onClick={()=>void open(letter)}>
      {!letter.read_at&&<span data-mail-unread-badge="true">Nelasīta</span>}<strong>{letter.email||'Bez e-pasta adreses'}</strong> · {new Date(letter.created_at).toLocaleString('lv-LV')}<br/>
      <span>{letter.body.slice(0,120)}{letter.body.length>120?'…':''}</span>
    </button>)}
    {total>25&&<div style={{display:'flex',gap:12,alignItems:'center'}}>
      <button type="button" disabled={page===0||loading} onClick={()=>setPage(n=>n-1)}>Iepriekšējā</button><span>{page+1} / {Math.ceil(total/25)}</span>
      <button type="button" disabled={(page+1)*25>=total||loading} onClick={()=>setPage(n=>n+1)}>Nākamā</button>
    </div>}
    {selected&&<article ref={detail} data-mail-detail="true" style={{scrollMarginTop:80}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:10}}><h3 style={{margin:0}}>Vēstule</h3><button type="button" onClick={()=>setSelected(null)}>Aizvērt</button></div>
      <p>{selected.email||'Bez e-pasta adreses'} · {new Date(selected.created_at).toLocaleString('lv-LV')}</p>
      {selected.listing_url&&<p>Sludinājums: {selected.listing_url}</p>}
      <p style={{whiteSpace:'pre-wrap',lineHeight:1.6}}>{selected.body}</p>
      <p>Valoda: {selected.language}{selected.country?' · Valsts: '+selected.country:''}</p>
      <label>Statuss: <select disabled={busy} value={selected.status} onChange={event=>void update(selected,{status:event.target.value as PlatformMessage['status']})}>
        <option value="new">Saņemta</option><option value="processing">Risināma</option><option value="done">Pabeigta</option>
      </select></label>
      <button type="button" disabled={busy} style={{marginLeft:12}} onClick={()=>void update(selected,{read_at:selected.read_at?null:new Date().toISOString()})}>{selected.read_at?'Atzīmēt kā nelasītu':'Atzīmēt kā izlasītu'}</button>
    </article>}
  </main>
}
