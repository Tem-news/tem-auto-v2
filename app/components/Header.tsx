'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const LANGUAGES = [
  { code: 'LV', name: 'Latviešu', flagCode: 'lv' },
  { code: 'EN', name: 'English', flagCode: 'gb' },
  { code: 'RU', name: 'Русский', flagCode: 'ru' },
  { code: 'DE', name: 'Deutsch', flagCode: 'de' },
  { code: 'ES', name: 'Español', flagCode: 'es' },
  { code: 'FR', name: 'Français', flagCode: 'fr' },
  { code: 'IT', name: 'Italiano', flagCode: 'it' },
  { code: 'PL', name: 'Polski', flagCode: 'pl' },
  { code: 'EE', name: 'Eesti', flagCode: 'ee' },
  { code: 'LT', name: 'Lietuvių', flagCode: 'lt' },
  { code: 'FI', name: 'Suomi', flagCode: 'fi' },
  { code: 'SV', name: 'Svenska', flagCode: 'se' },
  { code: 'NO', name: 'Norsk', flagCode: 'no' },
  { code: 'DA', name: 'Dansk', flagCode: 'dk' },
  { code: 'NL', name: 'Nederlands', flagCode: 'nl' },
  { code: 'PT', name: 'Português', flagCode: 'pt' },
  { code: 'CS', name: 'Čeština', flagCode: 'cz' },
  { code: 'SK', name: 'Slovenčina', flagCode: 'sk' },
  { code: 'HU', name: 'Magyar', flagCode: 'hu' },
  { code: 'RO', name: 'Română', flagCode: 'ro' },
  { code: 'BG', name: 'Български', flagCode: 'bg' },
  { code: 'EL', name: 'Ελληνικά', flagCode: 'gr' },
  { code: 'UK', name: 'Українська', flagCode: 'ua' },
  { code: 'TR', name: 'Türkçe', flagCode: 'tr' },
  { code: 'ZH', name: '中文 (Chinese)', flagCode: 'cn' },
  { code: 'JA', name: '日本語 (Japanese)', flagCode: 'jp' },
  { code: 'KO', name: '한국어 (Korean)', flagCode: 'kr' },
  { code: 'HI', name: 'हिन्दी (Hindi)', flagCode: 'in' },
  { code: 'AR', name: 'العربية (Arabic)', flagCode: 'sa' },
  { code: 'HE', name: 'עברית (Hebrew)', flagCode: 'il' }
]

const REGIONS = [
  { 
    name: 'Latvija (EUR)', 
    flagCode: 'lv', 
    group: 'Baltija',
    subregions: ['Rīga', 'Jūrmala', 'Pierīga', 'Kurzeme', 'Vidzeme', 'Zemgale', 'Latgale']
  },
  { 
    name: 'ASV & Ziemeļamerika (USD)', 
    flagCode: 'us', 
    group: 'Ziemeļamerika',
    subregions: ['Kalifornija (CA)', 'Ņujorka (NY)', 'Teksasa (TX)', 'Florida (FL)', 'Ilinoisa (IL)']
  },
  { 
    name: 'Vācija (EUR)', 
    flagCode: 'de', 
    group: 'Centrāleiropa',
    subregions: ['Berlīne', 'Minhene', 'Bavārija', 'Ziemeļreina-Vestfālene', 'Frankfurte']
  },
  { 
    name: 'Apvienotā Karaliste (GBP)', 
    flagCode: 'gb', 
    group: 'Eiropa',
    subregions: ['Londona', 'Mančestra', 'Birmingema', 'Skotija', 'Velsa']
  },
  { name: 'Eiropa (EUR)', flagCode: 'eu', group: 'Kontinents', subregions: [] },
  { name: 'Lietuva (EUR)', flagCode: 'lt', group: 'Baltija', subregions: ['Viļņa', 'Kauņa', 'Klaipēda'] },
  { name: 'Igaunija (EUR)', flagCode: 'ee', group: 'Baltija', subregions: ['Tallina', 'Tartu'] },
  { name: 'Francija (EUR)', flagCode: 'fr', group: 'Eiropa', subregions: ['Parīze', 'Marseļa', 'Liona'] },
  { name: 'Spānija (EUR)', flagCode: 'es', group: 'Eiropa', subregions: ['Madride', 'Barselona', 'Valensija'] },
  { name: 'Itālija (EUR)', flagCode: 'it', group: 'Eiropa', subregions: ['Roma', 'Milāna', 'Neapole'] },
  { name: 'Polija (PLN)', flagCode: 'pl', group: 'Eiropa', subregions: ['Varšava', 'Krakova', 'Gdaņska'] },
  { name: 'Zviedrija (SEK)', flagCode: 'se', group: 'Skandināvija', subregions: ['Stokholma', 'Gēteborga'] },
  { name: 'Norvēģija (NOK)', flagCode: 'no', group: 'Skandināvija', subregions: ['Oslo', 'Bergena'] },
  { name: 'Somija (EUR)', flagCode: 'fi', group: 'Skandināvija', subregions: ['Helsinki', 'Espoo'] },
  { name: 'Dānija (DKK)', flagCode: 'dk', group: 'Skandināvija', subregions: ['Kopenhāgena'] },
  { name: 'Nīderlande (EUR)', flagCode: 'nl', group: 'Eiropa', subregions: ['Amsterdama', 'Roterdama'] },
  { name: 'Beļģija (EUR)', flagCode: 'be', group: 'Eiropa', subregions: ['Brusese', 'Antverpene'] },
  { name: 'Austrija (EUR)', flagCode: 'at', group: 'Eiropa', subregions: ['Vīne', 'Zalcburga'] },
  { name: 'Šveice (CHF)', flagCode: 'ch', group: 'Eiropa', subregions: ['Cīrihe', 'Ženēva'] },
  { name: 'Čehija (CZK)', flagCode: 'cz', group: 'Eiropa', subregions: ['Prāga'] },
  { name: 'Ukraina (UAH)', flagCode: 'ua', group: 'Austrumeiropa', subregions: ['Kijiva', 'Ļviva', 'Odesa'] },
  { name: 'Turcija (TRY)', flagCode: 'tr', group: 'Eirāzija', subregions: ['Stambula', 'Ankara', 'Antalja'] },
  { name: 'Kanāda (CAD)', flagCode: 'ca', group: 'Ziemeļamerika', subregions: ['Ontārio', 'Kvebeka', 'Britu Kolumbija'] },
  { name: 'Meksika (MXN)', flagCode: 'mx', group: 'Ziemeļamerika', subregions: ['Mehiko'] },
  { name: 'Brazīlija (BRL)', flagCode: 'br', group: 'Dienvidamerika', subregions: ['Sanpaulu', 'Rio de Žaneiro'] },
  { name: 'Argentīna (ARS)', flagCode: 'ar', group: 'Dienvidamerika', subregions: ['Buenosairesa'] },
  { name: 'Austrālija (AUD)', flagCode: 'au', group: 'Okeānija', subregions: ['Sidneja', 'Melburna'] },
  { name: 'Jaunzēlande (NZD)', flagCode: 'nz', group: 'Okeānija', subregions: ['Oklanda', 'Velingtona'] },
  { name: 'Japāna (JPY)', flagCode: 'jp', group: 'Āzija', subregions: ['Tokija', 'Osaka'] },
  { name: 'Ķīna (CNY)', flagCode: 'cn', group: 'Āzija', subregions: ['Pekina', 'Šanhaja'] },
  { name: 'Dienvidkoreja (KRW)', flagCode: 'kr', group: 'Āzija', subregions: ['Seula'] },
  { name: 'Indija (INR)', flagCode: 'in', group: 'Āzija', subregions: ['Mumbaja', 'Deli'] },
  { name: 'Apvienotie Arābu Emirāti (AED)', flagCode: 'ae', group: 'Tuvie Austrumi', subregions: ['Dubaija', 'Abudabi'] }
]

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [visitCount, setVisitCount] = useState<number>(0)

  const [currentLang, setCurrentLang] = useState('LV')
  const [currentRegion, setCurrentRegion] = useState('Latvija (EUR)')

  const [langOpen, setLangOpen] = useState(false)
  const [regionOpen, setRegionOpen] = useState(false)
  const [expandedRegion, setExpandedRegion] = useState<string | null>('Latvija (EUR)')
  
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

  const handleAddCarClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      sessionStorage.setItem('redirectAfterLogin', '/pievienot')
      router.push('/login')
    } else {
      router.push('/pievienot')
    }
  }

  const filteredLanguages = LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(langSearch.toLowerCase()) || 
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  )

  const filteredRegions = REGIONS.filter(r => 
    r.name.toLowerCase().includes(regionSearch.toLowerCase()) ||
    r.subregions?.some(sub => sub.toLowerCase().includes(regionSearch.toLowerCase()))
  )

  const currentLangObj = LANGUAGES.find(l => l.code === currentLang)
  const currentRegionObj = REGIONS.find(r => r.name === currentRegion || r.subregions?.includes(currentRegion))

  return (
    <header 
      style={{ 
        backgroundColor: '#0f172a', 
        color: '#ffffff', 
        padding: '12px 20px', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* KREISĀ PUSE: Logo un Apmeklētāji */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link 
            href="/" 
            onClick={(e) => {
              e.preventDefault()
              window.location.href = '/'
            }}
            style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e', textDecoration: 'none', cursor: 'pointer' }}
          >
            TemAuto
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '20px',
              fontSize: '13px',
              color: '#e2e8f0',
              fontWeight: '500'
            }}
          >
            <span>👥</span>
            <span>Apmeklētāji 24h: <strong style={{ color: '#22c55e' }}>{visitCount}</strong></span>
          </div>
        </div>

        {/* LABĀ PUSE: Valodas, Reģioni un Navigācija */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Valodas izvēlne */}
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
                gap: '8px'
              }}
            >
              {currentLangObj && (
                <img 
                  src={`https://flagcdn.com/20x15/${currentLangObj.flagCode}.png`} 
                  alt="" 
                  style={{ width: '18px', height: '13px', borderRadius: '2px', objectFit: 'cover' }} 
                />
              )}
              {currentLang} ▾
            </button>

            {langOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', width: '230px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', padding: '8px', zIndex: 100 }}>
                <input
                  type="text"
                  placeholder="Meklēt valodu..."
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
                      style={{ padding: '6px 8px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: currentLang === l.code ? '#22c55e' : '#e2e8f0', backgroundColor: currentLang === l.code ? '#334155' : 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentLang === l.code ? '#334155' : 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={`https://flagcdn.com/20x15/${l.flagCode}.png`} alt="" style={{ width: '18px', height: '13px', borderRadius: '2px', objectFit: 'cover' }} />
                        <span>{l.name}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#94a3b8', backgroundColor: '#0f172a', padding: '2px 5px', borderRadius: '3px' }}>{l.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reģiona izvēlne ar štatiem/pilsētām */}
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
                gap: '8px'
              }}
            >
              {currentRegionObj && (
                <img 
                  src={`https://flagcdn.com/20x15/${currentRegionObj.flagCode}.png`} 
                  alt="" 
                  style={{ width: '18px', height: '13px', borderRadius: '2px', objectFit: 'cover' }} 
                />
              )}
              {currentRegion} ▾
            </button>

            {regionOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', width: '280px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', padding: '8px', zIndex: 100 }}>
                <input
                  type="text"
                  placeholder="Meklēt valsti, reģionu, pilsētu..."
                  value={regionSearch}
                  onChange={(e) => setRegionSearch(e.target.value)}
                  autoFocus
                  style={{ width: '100%', padding: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff', fontSize: '12px', boxSizing: 'border-box', marginBottom: '6px' }}
                />
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {filteredRegions.map((r) => {
                    const isExpanded = expandedRegion === r.name
                    const isSelected = currentRegion === r.name

                    return (
                      <div key={r.name} style={{ marginBottom: '4px' }}>
                        <div
                          onClick={() => {
                            if (r.subregions && r.subregions.length > 0) {
                              setExpandedRegion(isExpanded ? null : r.name)
                            } else {
                              setCurrentRegion(r.name)
                              setRegionOpen(false)
                              setRegionSearch('')
                            }
                          }}
                          style={{ 
                            padding: '6px 8px', 
                            cursor: 'pointer', 
                            borderRadius: '4px', 
                            fontSize: '13px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            color: isSelected ? '#22c55e' : '#e2e8f0', 
                            backgroundColor: isSelected ? '#334155' : 'transparent' 
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected ? '#334155' : 'transparent'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={`https://flagcdn.com/20x15/${r.flagCode}.png`} alt="" style={{ width: '18px', height: '13px', borderRadius: '2px', objectFit: 'cover' }} />
                            <span>{r.name}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {r.subregions && r.subregions.length > 0 && (
                              <span style={{ fontSize: '10px', color: '#94a3b8' }}>{isExpanded ? '▲' : '▼'}</span>
                            )}
                          </div>
                        </div>

                        {/* Apakšreģioni / štati / pilsētas */}
                        {isExpanded && r.subregions && r.subregions.length > 0 && (
                          <div style={{ paddingLeft: '26px', paddingBottom: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {r.subregions.map((sub) => (
                              <div
                                key={sub}
                                onClick={() => {
                                  setCurrentRegion(sub)
                                  setRegionOpen(false)
                                  setRegionSearch('')
                                }}
                                style={{
                                  padding: '4px 6px',
                                  fontSize: '12px',
                                  color: currentRegion === sub ? '#22c55e' : '#cbd5e1',
                                  cursor: 'pointer',
                                  borderRadius: '3px',
                                  backgroundColor: currentRegion === sub ? '#334155' : 'transparent'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentRegion === sub ? '#334155' : 'transparent'}
                              >
                                • {sub}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Autentifikācija un Pievienot poga */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

            <a
              href="/pievienot"
              onClick={handleAddCarClick}
              style={{ backgroundColor: '#16a34a', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
            >
              + Pievienot auto
            </a>
          </nav>

        </div>

      </div>
    </header>
  )
}
