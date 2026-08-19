'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

// Plašs pasaules valodu saraksts
const LANGUAGES = [
  { code: 'LV', name: 'Latviešu' },
  { code: 'EN', name: 'English' },
  { code: 'RU', name: 'Русский' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'ES', name: 'Español' },
  { code: 'FR', name: 'Français' },
  { code: 'IT', name: 'Italiano' },
  { code: 'PL', name: 'Polski' },
  { code: 'EE', name: 'Eesti' },
  { code: 'LT', name: 'Lietuvių' },
  { code: 'FI', name: 'Suomi' },
  { code: 'SV', name: 'Svenska' },
  { code: 'NO', name: 'Norsk' },
  { code: 'DA', name: 'Dansk' },
  { code: 'NL', name: 'Nederlands' },
  { code: 'PT', name: 'Português' },
  { code: 'CS', name: 'Čeština' },
  { code: 'SK', name: 'Slovenčina' },
  { code: 'HU', name: 'Magyar' },
  { code: 'RO', name: 'Română' },
  { code: 'BG', name: 'Български' },
  { code: 'EL', name: 'Ελληνικά' },
  { code: 'UK', name: 'Українська' },
  { code: 'TR', name: 'Türkçe' },
  { code: 'ZH', name: '中文 (Chinese)' },
  { code: 'JA', name: '日本語 (Japanese)' },
  { code: 'KO', name: '한국어 (Korean)' },
  { code: 'HI', name: 'हिन्दी (Hindi)' },
  { code: 'AR', name: 'العربية (Arabic)' },
  { code: 'HE', name: 'עברית (Hebrew)' }
]

// Izvērsts pasaules reģionu un valstu saraksts
const REGIONS = [
  { name: 'Eiropa (EUR)', group: 'Kontinents' },
  { name: 'Latvija (EUR)', group: 'Baltija' },
  { name: 'Lietuva (EUR)', group: 'Baltija' },
  { name: 'Igaunija (EUR)', group: 'Baltija' },
  { name: 'Vācija (EUR)', group: 'Centrāleiropa' },
  { name: 'Apvienotā Karaliste (GBP)', group: 'Eiropa' },
  { name: 'Francija (EUR)', group: 'Eiropa' },
  { name: 'Spānija (EUR)', group: 'Eiropa' },
  { name: 'Itālija (EUR)', group: 'Eiropa' },
  { name: 'Polija (PLN)', group: 'Eiropa' },
  { name: 'Zviedrija (SEK)', group: 'Skandināvija' },
  { name: 'Norvēģija (NOK)', group: 'Skandināvija' },
  { name: 'Somija (EUR)', group: 'Skandināvija' },
  { name: 'Dānija (DKK)', group: 'Skandināvija' },
  { name: 'Nīderlande (EUR)', group: 'Eiropa' },
  { name: 'Beļģija (EUR)', group: 'Eiropa' },
  { name: 'Austrija (EUR)', group: 'Eiropa' },
  { name: 'Šveice (CHF)', group: 'Eiropa' },
  { name: 'Čehija (CZK)', group: 'Eiropa' },
  { name: 'Ukraina (UAH)', group: 'Austrumeiropa' },
  { name: 'Turcija (TRY)', group: 'Eirāzija' },
  { name: 'ASV & Ziemeļamerika (USD)', group: 'Ziemeļamerika' },
  { name: 'Kanāda (CAD)', group: 'Ziemeļamerika' },
  { name: 'Meksika (MXN)', group: 'Ziemeļamerika' },
  { name: 'Brazīlija (BRL)', group: 'Dienvidamerika' },
  { name: 'Argentīna (ARS)', group: 'Dienvidamerika' },
  { name: 'Austrālija (AUD)', group: 'Okeānija' },
  { name: 'Jaunzēlande (NZD)', group: 'Okeānija' },
  { name: 'Japāna (JPY)', group: 'Āzija' },
  { name: 'Ķīna (CNY)', group: 'Āzija' },
  { name: 'Dienvidkoreja (KRW)', group: 'Āzija' },
  { name: 'Indija (INR)', group: 'Āzija' },
  { name: 'Apvienotie Arābu Emirāti (AED)', group: 'Tuvie Austrumi' }
]

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [visitCount, setVisitCount] = useState<number>(0)

  // Stāvokļi valodai un reģionam
  const [currentLang, setCurrentLang] = useState('LV')
  const [currentRegion, setCurrentRegion] = useState('Eiropa (EUR)')

  // Izlecošo logu un meklēšanas stāvokļi
  const [langOpen, setLangOpen] = useState(false)
  const [regionOpen, setRegionOpen] = useState(false)
  const [langSearch, setLangSearch] = useState('')
  const [regionSearch, setRegionSearch] = useState('')

  const langRef = useRef<HTMLDivElement>(null)
  const regionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    async function fetchVisits() {
      const twentyFourHoursAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString()
      const { count, error } = await supabase
        .from('site_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo)

      if (!error && count !== null) {
        setVisitCount(count)
      }
    }
    fetchVisits()

    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false)
      }
      if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
        setRegionOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  // Filtrētie saraksti meklēšanai
  const filteredLanguages = LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(langSearch.toLowerCase()) || 
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  )

  const filteredRegions = REGIONS.filter(r => 
    r.name.toLowerCase().includes(regionSearch.toLowerCase())
  )

  return (
    <header style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', position: 'relative', zIndex: 50 }}>
      
      {/* Kreisā puse: Logo un Skaitītājs vienā rindā */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link href="/" style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e', textDecoration: 'none' }}>
          TemAuto
        </Link>

        {/* Apmeklētāju skaitītājs */}
        <button
          onClick={() => alert(`Kopējie unikālie apmeklējumi pēdējajās 24h: ${visitCount}`)}
          title="Apmeklētāju skaits pēdējo 24 stundu laikā"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#e2e8f0',
            fontWeight: '500'
          }}
        >
          <span style={{ fontSize: '14px' }}>👥</span>
          <span>Apmeklētāji 24h: <strong style={{ color: '#22c55e' }}>{visitCount}</strong></span>
        </button>
      </div>

      {/* Vidus/Labā puse: Valoda, Reģions un Navigācija vienā rindā */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        
        {/* 1. VALODAS IZVĒLNE AR MEKLĒŠANU */}
        <div style={{ position: 'relative' }} ref={langRef}>
          <button
            onClick={() => { setLangOpen(!langOpen); setRegionOpen(false); }}
            style={{
              padding: '6px 12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🌐</span> Valoda: {currentLang} ▾
          </button>

          {langOpen && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', width: '220px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', padding: '8px', zIndex: 100 }}>
              <input
                type="text"
                placeholder="Sāc rakstīt valodu..."
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                autoFocus
                style={{ width: '100%', padding: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff', fontSize: '12px', boxSizing: 'border-box', marginBottom: '6px' }}
              />
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {filteredLanguages.map((l) => (
                  <div
                    key={l.code}
                    onClick={() => { setCurrentLang(l.code); setLangOpen(false); setLangSearch(''); }}
                    style={{ padding: '6px 8px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: currentLang === l.code ? '#22c55e' : '#e2e8f0', backgroundColor: currentLang === l.code ? '#334155' : 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentLang === l.code ? '#334155' : 'transparent'}
                  >
                    <span>{l.name}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', backgroundColor: '#0f172a', padding: '2px 6px', borderRadius: '4px' }}>{l.code}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. REĢIONA IZVĒLNE AR MEKLĒŠANU */}
        <div style={{ position: 'relative' }} ref={regionRef}>
          <button
            onClick={() => { setRegionOpen(!regionOpen); setLangOpen(false); }}
            style={{
              padding: '6px 12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🌍</span> Reģions: {currentRegion} ▾
          </button>

          {regionOpen && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', width: '260px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', padding: '8px', zIndex: 100 }}>
              <input
                type="text"
                placeholder="Meklēt reģionu / valsti..."
                value={regionSearch}
                onChange={(e) => setRegionSearch(e.target.value)}
                autoFocus
                style={{ width: '100%', padding: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff', fontSize: '12px', boxSizing: 'border-box', marginBottom: '6px' }}
              />
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {filteredRegions.map((r) => (
                  <div
                    key={r.name}
                    onClick={() => { setCurrentRegion(r.name); setRegionOpen(false); setRegionSearch(''); }}
                    style={{ padding: '6px 8px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: currentRegion === r.name ? '#22c55e' : '#e2e8f0', backgroundColor: currentRegion === r.name ? '#334155' : 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentRegion === r.name ? '#334155' : 'transparent'}
                  >
                    <span>{r.name}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{r.group}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Standarta navigācija */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px' }}>
            Sākums
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: '#cbd5e1', backgroundColor: '#1e293b', padding: '3px 10px', borderRadius: '12px', border: '1px solid #334155' }}>
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px' }}
              >
                Izlogoties
              </button>
            </div>
          ) : (
            <Link href="/login" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px' }}>
              Ielogoties
            </Link>
          )}

          <Link
            href={user ? "/pievienot" : "/login"}
            style={{ backgroundColor: '#16a34a', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}
          >
            + Pievienot auto
          </Link>
        </nav>
      </div>
    </header>
  )
}
