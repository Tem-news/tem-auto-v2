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
    subregions: ['Rīga', 'Jūrmala', 'Pierīga', 'Kurzeme', 'Vidzeme', 'Zemgale', 'Latgale', 'Liepāja', 'Daugavpils', 'Ventspils', 'Jelgava', 'Valmiera', 'Ogre']
  },
  { 
    name: 'ASV & Ziemeļamerika (USD)', 
    flagCode: 'us', 
    group: 'Ziemeļamerika',
    subregions: [
      'Alabama (AL)', 'Aļaska (AK)', 'Arizona (AZ)', 'Arkanzasa (AR)', 'Kalifornija (CA)', 
      'Kolorādo (CO)', 'Konektikuta (CT)', 'Delavēra (DE)', 'Florida (FL)', 'Džordžija (GA)', 
      'Havajas (HI)', 'Aidaho (ID)', 'Ilinoisa (IL)', 'Indianāna (IN)', 'Aiova (IA)', 
      'Kanzasa (KS)', 'Kentuki (KY)', 'Luiziāna (LA)', 'Meina (ME)', 'Merilenda (MD)', 
      ' Masačūsetsa (MA)', 'Mičigana (MI)', 'Minesota (MN)', 'Misisipi (MS)', 'Misūri (MO)', 
      'Montāna (MT)', 'Nebraska (NE)', 'Nevada (NV)', 'Ņūhempšīra (NH)', 'Ņūdžersija (NJ)', 
      'Ņūmexika (NM)', 'Ņujorka (NY)', 'Ziemeļkarolīna (NC)', 'Ziemeļdakota (ND)', 'Ohaio (OH)', 
      'Oklahoma (OK)', 'Oregonas štats (OR)', 'Pensilvānija (PA)', 'Roda Ailenda (RI)', 'Dienvidkarolīna (SC)', 
      'Dienviddakota (SD)', 'Tenesī (TN)', 'Teksasa (TX)', 'Jūta (UT)', 'Vermonta (VT)', 
      'Virdžīnija (VA)', 'Vašingtona (WA)', 'Rietumvirdžīnija (WV)', 'Viskonsina (WI)', 'Vaiominga (WY)'
    ]
  },
  { 
    name: 'Vācija (EUR)', 
    flagCode: 'de', 
    group: 'Centrāleiropa',
    subregions: [
      'Berlīne', 'Minhene', 'Hamburga', 'Ķelne', 'Frankfurte pie Mainas', 
      'Štutgarte', 'Bādene-Virtemberga', 'Bavārija', 'Brandenburga', 'Brēmene', 
      'Hesene', 'Mēklenburga-Priekšpomerānija', 'Lejassaksija', 'Ziemeļreina-Vestfālene', 
      'Reina-Palatināte', 'Sāra', 'Saksija', 'Saksija-Anhalte', 'Šlēsviga-Holšteina', 'Tīringene'
    ]
  },
  { 
    name: 'Apvienotā Karaliste (GBP)', 
    flagCode: 'gb', 
    group: 'Eiropa',
    subregions: ['Londona', 'Mančestra', 'Birmingema', 'Skotija', 'Velsa', 'Ziemeļīrija', 'Liverpūle', 'Līdsā', 'Bristole', 'Glāzgova', 'Edinburga', 'Belfāsta']
  },
  { name: 'Eiropa (EUR)', flagCode: 'eu', group: 'Kontinents', subregions: ['Eirozona', 'Eiropas Savienība', 'Skandināvija', 'Baltija', 'Austrumeiropa'] },
  { name: 'Lietuva (EUR)', flagCode: 'lt', group: 'Baltija', subregions: ['Viļņa', 'Kauņa', 'Klaipēda', 'Šauļi', 'Panevēža', 'Aukštaitija', 'Žemaitija', 'Dzūkija', 'Suvalkija'] },
  { name: 'Igaunija (EUR)', flagCode: 'ee', group: 'Baltija', subregions: ['Tallina', 'Tartu', 'Narva', 'Pērnava', 'Hāpsalu', 'Sāmsala', 'Hījumā', 'Viljandi'] },
  { name: 'Francija (EUR)', flagCode: 'fr', group: 'Eiropa', subregions: ['Parīze', 'Marseļa', 'Liona', 'Tulūza', 'Nica', 'Nante', 'Bordo', 'Provansa', 'Korsika', 'Normandija'] },
  { name: 'Spānija (EUR)', flagCode: 'es', group: 'Eiropa', subregions: ['Madride', 'Barselona', 'Valensija', 'Seviļa', 'Andalūzija', 'Katalonija', 'Malaga', 'Baleāru salas', 'Kanāriju salas'] },
  { name: 'Itālija (EUR)', flagCode: 'it', group: 'Eiropa', subregions: ['Roma', 'Milāna', 'Neapole', 'Turīna', 'Sicīlija', 'Venēcija', 'Florence', 'Toskāna', 'Sardīnija', 'Kalabrija'] },
  { name: 'Polija (PLN)', flagCode: 'pl', group: 'Eiropa', subregions: ['Varšava', 'Krakova', 'Gdaņska', 'Vroclava', 'Poznaņa', 'Lodza', 'Silēzija', 'Mazovija', 'Mazpolija'] },
  { name: 'Zviedrija (SEK)', flagCode: 'se', group: 'Skandināvija', subregions: ['Stokholma', 'Gēteborga', 'Malme', 'Upsala', 'Norlande', 'Svealande', 'Gētalande'] },
  { name: 'Norvēģija (NOK)', flagCode: 'no', group: 'Skandināvija', subregions: ['Oslo', 'Bergena', 'Tronheima', 'Stavangere', 'Ziemeļnorvēģija', 'Austrumorvēģija', 'Rietumorvēģija'] },
  { name: 'Somija (EUR)', flagCode: 'fi', group: 'Skandināvija', subregions: ['Helsinki', 'Espoo', 'Tampere', 'Turku', 'Lapzeme', 'Oulu', 'Ūsimā'] },
  { name: 'Dānija (DKK)', flagCode: 'dk', group: 'Skandināvija', subregions: ['Kopenhāgena', 'Orhusa', 'Odense', 'Olborga', 'Zēlande', 'Jītlande'] },
  { name: 'Nīderlande (EUR)', flagCode: 'nl', group: 'Eiropa', subregions: ['Amsterdama', 'Roterdama', 'Hāga', 'Utrehta', 'Eindhovena', 'Ziemeļholande', 'Dienvidholande'] },
  { name: 'Beļģija (EUR)', flagCode: 'be', group: 'Eiropa', subregions: ['Brusese', 'Antverpene', 'Gente', 'Flandrija', 'Valonija', 'Lježa'] },
  { name: 'Austrija (EUR)', flagCode: 'at', group: 'Eiropa', subregions: ['Vīne', 'Zalcburga', 'Grāca', 'Linca', 'Tiroli', 'Forarlberga', 'Kārtene'] },
  { name: 'Šveice (CHF)', flagCode: 'ch', group: 'Eiropa', subregions: ['Cīrihe', 'Ženēva', 'Bāzeli', 'Berne', 'Lozanna', 'Lucerna'] },
  { name: 'Čehija (CZK)', flagCode: 'cz', group: 'Eiropa', subregions: ['Prāga', 'Brno', 'Ostrava', 'Plzeņa', 'Bohēmija', 'Morāvija'] },
  { name: 'Ukraina (UAH)', flagCode: 'ua', group: 'Austrumeiropa', subregions: ['Kijiva', 'Ļviva', 'Odesa', 'Harkiva', 'Dnipro', 'Zaporižja', 'Krimas Autonomā Republika'] },
  { name: 'Turcija (TRY)', flagCode: 'tr', group: 'Eirāzija', subregions: ['Stambula', 'Ankara', 'Antalja', 'Izmira', 'Bursa', 'Adana', 'Konja'] },
  { name: 'Kanāda (CAD)', flagCode: 'ca', group: 'Ziemeļamerika', subregions: ['Ontārio', 'Kvebeka', 'Britu Kolumbija', 'Alberta', 'Vankūvera', 'Toronto', 'Monreāla', 'Manitoba', 'Saskačevana', 'Jaunskotija'] },
  { name: 'Meksika (MXN)', flagCode: 'mx', group: 'Ziemeļamerika', subregions: ['Mehiko', 'Gvadalahara', 'Monterreja', 'Kankūna', 'Puebla', 'Halisko'] },
  { name: 'Brazīlija (BRL)', flagCode: 'br', group: 'Dienvidamerika', subregions: ['Sanpaulu', 'Rio de Žaneiro', 'Brazīlija', 'Minasa Žeraisa', 'Baija', 'Parana'] },
  { name: 'Argentīna (ARS)', flagCode: 'ar', group: 'Dienvidamerika', subregions: ['Buenosairesa', 'Kordoba', 'Mendosa', 'Rosario', 'Santa Fe'] },
  { name: 'Austrālija (AUD)', flagCode: 'au', group: 'Okeānija', subregions: ['Sidneja', 'Melburna', 'Brisbena', 'Pērta', 'Jaundienvidvelsa', 'Viktorija', 'Kvīnslenda'] },
  { name: 'Jaunzēlande (NZD)', flagCode: 'nz', group: 'Okeānija', subregions: ['Oklanda', 'Velingtona', 'Kraistčērča', 'Hamiltona', 'Tauranga'] },
  { name: 'Japāna (JPY)', flagCode: 'jp', group: 'Āzija', subregions: ['Tokija', 'Osaka', 'Kioto', 'Hokaido', 'Jokohama', 'Nagoja', 'Fukuoka', 'Okinava'] },
  { name: 'Ķīna (CNY)', flagCode: 'cn', group: 'Āzija', subregions: ['Pekina', 'Šanhaja', 'Guandžou', 'Šeņdžeņa', 'Honkonga', 'Maoana', 'Sičuaņa'] },
  { name: 'Dienvidkoreja (KRW)', flagCode: 'kr', group: 'Āzija', subregions: ['Seula', 'Pusana', 'Inčhona', 'Čedžu', 'Tegu', 'Tedžona'] },
  { name: 'Indija (INR)', flagCode: 'in', group: 'Āzija', subregions: ['Mumbaja', 'Deli', 'Bangalora', 'Goa', 'Haidarābāda', 'Čennai', 'Kolkata'] },
  { name: 'Apvienotie Arābu Emirāti (AED)', flagCode: 'ae', group: 'Tuvie Austrumi', subregions: ['Dubaija', 'Abudabi', 'Šārdža', 'Adžmana', 'Raselhaima'] }
]

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [visitCount, setVisitCount] = useState<number>(0)

  const [currentLang, setCurrentLang] = useState('LV')
  const [currentRegion, setCurrentRegion] = useState('Latvija (EUR)')

  const [langOpen, setLangOpen] = useState(false)
  const [regionOpen, setRegionOpen] = useState(false)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>('Latvija (EUR)')
  
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
  const hoveredRegionObj = REGIONS.find(r => r.name === hoveredRegion)

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

          {/* Reģiona izvēlne ar peldošo sānjoslu, kas izbrauc UZ KREISO PUSI */}
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
              <div style={{ display: 'flex', flexDirection: 'row-reverse', position: 'absolute', top: '100%', right: 0, marginTop: '6px', zIndex: 100 }}>
                
                {/* Galvenais valstu saraksts (atrodas pa labi, tieši zem izvēlnes pogas) */}
                <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0 8px 8px 0', width: '260px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', padding: '8px' }}>
                  <input
                    type="text"
                    placeholder="Meklēt valsti..."
                    value={regionSearch}
                    onChange={(e) => setRegionSearch(e.target.value)}
                    autoFocus
                    style={{ width: '100%', padding: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff', fontSize: '12px', boxSizing: 'border-box', marginBottom: '6px' }}
                  />
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {filteredRegions.map((r) => {
                      const isSelected = currentRegion === r.name
                      const isHovered = hoveredRegion === r.name

                      return (
                        <div
                          key={r.name}
                          onMouseEnter={() => setHoveredRegion(r.name)}
                          onClick={() => {
                            if (!r.subregions || r.subregions.length === 0) {
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
                            backgroundColor: isHovered || isSelected ? '#334155' : 'transparent' 
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>◀</span>
                            <span>{r.name}</span>
                          </div>
                          <img src={`https://flagcdn.com/20x15/${r.flagCode}.png`} alt="" style={{ width: '18px', height: '13px', borderRadius: '2px', objectFit: 'cover' }} />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Papildu info logs, kas izpeld BLAKUS PA KREISI */}
                {hoveredRegionObj && hoveredRegionObj.subregions && hoveredRegionObj.subregions.length > 0 && (
                  <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRight: 'none', borderRadius: '8px 0 0 8px', width: '240px', boxShadow: '-10px 10px 15px -3px rgba(0,0,0,0.5)', padding: '12px', maxHeight: '316px', overflowY: 'auto' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>
                      Reģioni / Štati ({hoveredRegionObj.subregions.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {hoveredRegionObj.subregions.map((sub) => (
                        <div
                          key={sub}
                          onClick={() => {
                            setCurrentRegion(sub)
                            setRegionOpen(false)
                            setRegionSearch('')
                          }}
                          style={{
                            padding: '6px 8px',
                            fontSize: '12px',
                            color: currentRegion === sub ? '#22c55e' : '#cbd5e1',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            backgroundColor: currentRegion === sub ? '#334155' : 'transparent'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentRegion === sub ? '#334155' : 'transparent'}
                        >
                          • {sub}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
