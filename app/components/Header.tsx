'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  const pathname = usePathname()
  const isListingDetail = /^\/auto\/[^/]+\/?$/.test(pathname)
  const isAddCar = pathname === '/pievienot' || /^\/auto\/[^/]+\/edit\/?$/.test(pathname)
  const isCabinet = pathname === '/kabinets'
  const [user, setUser] = useState<any>(null)
  const [visitCount, setVisitCount] = useState<number>(0)

  const [currentLang, setCurrentLang] = useState('LV')
  const [currentRegion, setCurrentRegion] = useState('Latvija (EUR)')
  const [mobileTheme, setMobileTheme] = useState<'day' | 'night'>('day')

  const [langOpen, setLangOpen] = useState(false)
  const [regionOpen, setRegionOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileMenuClosing, setMobileMenuClosing] = useState(false)
  const [visitorStatsOpen, setVisitorStatsOpen] = useState(false)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>('Latvija (EUR)')
  
  const [langSearch, setLangSearch] = useState('')
  const [regionSearch, setRegionSearch] = useState('')

  const langRef = useRef<HTMLDivElement>(null)
  const regionRef = useRef<HTMLDivElement>(null)
  const mobileMenuTouchStart = useRef<{ x: number; y: number } | null>(null)
  const mobileMenuScrollY = useRef(0)
  const mobileMenuTouchOpenAt = useRef(0)
  const mobileMenuGestureDismissed = useRef(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('temauto-mobile-theme')
    const initialTheme = savedTheme === 'night' ? 'night' : 'day'
    setMobileTheme(initialTheme)
    document.documentElement.dataset.temautoTheme = initialTheme

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
    const syncHeaderOverlayFromHistory = () => {
      const headerOverlay = window.history.state?.temAutoHeaderOverlay

      if (mobileMenuGestureDismissed.current) {
        if (headerOverlay === 'menu') {
          window.history.back()
          return
        }

        mobileMenuGestureDismissed.current = false
        setMobileMenuClosing(false)
        setMobileMenuOpen(false)
        setVisitorStatsOpen(headerOverlay === 'visitors')
        return
      }

      setMobileMenuClosing(false)
      setMobileMenuOpen(headerOverlay === 'menu')
      setVisitorStatsOpen(headerOverlay === 'visitors')
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('popstate', syncHeaderOverlayFromHistory)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('popstate', syncHeaderOverlayFromHistory)
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen || !window.matchMedia('(max-width: 767px)').matches) return

    const savedScrollY = mobileMenuScrollY.current
    const previousScrollRestoration = window.history.scrollRestoration
    let restoreFrame: number | null = null

    const keepBackgroundInPlace = () => {
      if (Math.abs(window.scrollY - savedScrollY) < 1 || restoreFrame !== null) return
      restoreFrame = window.requestAnimationFrame(() => {
        window.scrollTo(0, savedScrollY)
        restoreFrame = null
      })
    }

    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, savedScrollY)
    window.addEventListener('scroll', keepBackgroundInPlace, { passive: true })

    return () => {
      window.removeEventListener('scroll', keepBackgroundInPlace)
      if (restoreFrame !== null) {
        window.cancelAnimationFrame(restoreFrame)
      }

      const restoreScroll = () => window.scrollTo(0, savedScrollY)
      restoreScroll()
      window.requestAnimationFrame(restoreScroll)
      window.setTimeout(() => {
        restoreScroll()
        window.history.scrollRestoration = previousScrollRestoration
      }, 80)
    }
  }, [mobileMenuOpen])

  const handleAddCarClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      sessionStorage.setItem('redirectAfterLogin', '/pievienot')
      router.push('/login')
    } else {
      router.push('/pievienot')
    }
  }

  const handleHeaderLogout = async () => {
    const shouldLogout = window.confirm('Vai tiešām izlogoties?')
    if (!shouldLogout) return

    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const applyMobileTheme = (theme: 'day' | 'night') => {
    setMobileTheme(theme)
    localStorage.setItem('temauto-mobile-theme', theme)
    document.documentElement.dataset.temautoTheme = theme
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

  const returnToOpenMobileMenu = () => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      setMobileMenuClosing(false)
      setMobileMenuOpen(true)
    }
  }

  const toggleMobileMenu = () => {
    const currentOverlay = window.history.state?.temAutoHeaderOverlay

    if (mobileMenuOpen) {
      if (currentOverlay === 'menu') {
        window.history.back()
      } else {
        setMobileMenuOpen(false)
      }
      return
    }

    const savedScrollY = window.scrollY
    mobileMenuScrollY.current = savedScrollY
    window.scrollTo(0, savedScrollY)

    const baseHistoryState = { ...window.history.state, temAutoHeaderReturn: true }
    delete baseHistoryState.temAutoHeaderOverlay
    window.history.replaceState(baseHistoryState, '', window.location.href)
    window.history.pushState(
      { ...baseHistoryState, temAutoHeaderOverlay: 'menu' },
      '',
      window.location.href
    )
    setMobileMenuClosing(false)
    setMobileMenuOpen(true)
    setVisitorStatsOpen(false)
    setLangOpen(false)
    setRegionOpen(false)
  }

  const handleMobileMenuButtonTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (mobileMenuOpen) return
    event.preventDefault()
    mobileMenuTouchOpenAt.current = Date.now()
    toggleMobileMenu()
  }

  const handleMobileMenuButtonClick = () => {
    if (Date.now() - mobileMenuTouchOpenAt.current < 700) return
    toggleMobileMenu()
  }

  const dismissMobileMenuByGesture = () => {
    if (mobileMenuGestureDismissed.current) return

    mobileMenuGestureDismissed.current = true
    setMobileMenuClosing(true)
    window.setTimeout(() => {
      if (window.history.state?.temAutoHeaderOverlay === 'menu') {
        window.history.back()
      } else {
        mobileMenuGestureDismissed.current = false
        setMobileMenuOpen(false)
        setMobileMenuClosing(false)
      }
    }, 180)
  }

  const handleMobileMenuTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    mobileMenuGestureDismissed.current = false
    mobileMenuTouchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null
  }

  const handleMobileMenuTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = mobileMenuTouchStart.current
    const touch = event.touches[0]
    if (!start || !touch) return

    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y
    const isUpwardDismiss = deltaY < -100 && Math.abs(deltaY) > Math.abs(deltaX)

    if (isUpwardDismiss) {
      mobileMenuTouchStart.current = null
      dismissMobileMenuByGesture()
    }
  }

  const handleMobileMenuTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = mobileMenuTouchStart.current
    const touch = event.changedTouches[0]
    mobileMenuTouchStart.current = null
    if (!start || !touch) return

    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y
    const isUpwardDismiss = deltaY < -100 && Math.abs(deltaY) > Math.abs(deltaX)

    if (isUpwardDismiss) {
      dismissMobileMenuByGesture()
    }
  }

  const toggleVisitorStats = () => {
    const currentOverlay = window.history.state?.temAutoHeaderOverlay

    if (visitorStatsOpen) {
      if (currentOverlay === 'visitors') {
        window.history.back()
      } else {
        setVisitorStatsOpen(false)
      }
      return
    }

    window.history.pushState(
      { ...window.history.state, temAutoHeaderOverlay: 'visitors' },
      '',
      window.location.href
    )
    setVisitorStatsOpen(true)
    setMobileMenuOpen(false)
    setLangOpen(false)
    setRegionOpen(false)
  }

  if (isCabinet) {
    return (
      <>
        <header
          data-temauto-header="true"
          data-cabinet-header="true"
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '3px 14px',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            width: '100%',
            height: '58px',
            boxSizing: 'border-box',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.18)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', width: '100%', height: '100%', minWidth: 0 }}>
            <Link
              href="/"
              aria-label="TemAuto — atgriezties sākumlapā"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0,
                flex: '0 0 auto',
                color: '#22c55e',
                textDecoration: 'none'
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1, fontWeight: 'bold', whiteSpace: 'nowrap' }}>TemAuto</span>
              <span
                aria-hidden="true"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '23px',
                  marginTop: '-6px',
                  transform: 'rotate(-3deg)'
                }}
              >
                <svg viewBox="0 0 64 32" width="44" height="22" role="img" aria-hidden="true">
                  <path d="M5 21.5 C8 20.8 8.8 16.4 11.7 14.3 C14 12.7 18.1 13 21 12.4 C24.4 8.1 27.4 6.7 33.3 6.8 C40.8 6.9 43.3 7.8 47.6 13.2 C52.4 14.2 56.5 15.8 59 18.1 C60.2 19.2 59.8 21 58.7 22" fill="none" stroke="#16a34a" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.8 22.2 C13.5 23.1 20.4 22.7 27.6 22.8 C37.8 23 48.8 22.4 58.2 22.2" fill="none" stroke="#22c55e" strokeWidth="3.2" strokeLinecap="round" />
                  <path d="M6.7 20.5 C10.4 18.9 9.8 15.5 13.1 13.7 M22 11.5 C26.1 7.4 29 7.2 34 7.4 C42 7.5 43.7 9.1 47 13.7" fill="none" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
                  <circle cx="16" cy="23" r="3.6" fill="#0f172a" stroke="#f8fafc" strokeWidth="2.1" />
                  <circle cx="49" cy="23" r="3.6" fill="#0f172a" stroke="#f8fafc" strokeWidth="2.1" />
                  <path d="M25.5 11.8 C29.8 11.1 35.2 11.2 39.7 12 M32.9 11.8 C32.5 15 32.3 18.3 31.8 21.2" fill="none" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" />
                  <path d="M26.2 12.5 C30.3 11.8 35.5 11.9 39 12.5" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
                </svg>
              </span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', minWidth: 0 }}>
              <strong style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', color: '#e2e8f0', fontSize: '16px', whiteSpace: 'nowrap' }}>Mans kabinets</strong>
              <button
                type="button"
                onClick={handleHeaderLogout}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  color: '#fca5a5',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Izlogoties
              </button>
            </div>
          </div>
        </header>
        <div aria-hidden="true" style={{ height: '58px', flex: '0 0 58px' }} />
      </>
    )
  }

  if (isAddCar) {
    return (
      <>
        <header
          data-temauto-header="true"
          data-add-car-header="true"
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '3px 14px',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            width: '100%',
            height: '58px',
            boxSizing: 'border-box',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.18)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', width: '100%', height: '100%', minWidth: 0 }}>
            <Link
              href="/"
              aria-label="TemAuto — atgriezties sākumlapā"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0,
                flex: '0 0 auto',
                color: '#22c55e',
                textDecoration: 'none'
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1, fontWeight: 'bold', whiteSpace: 'nowrap' }}>TemAuto</span>
              <span
                aria-hidden="true"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '23px',
                  marginTop: '-6px',
                  transform: 'rotate(-3deg)'
                }}
              >
                <svg viewBox="0 0 64 32" width="44" height="22" role="img" aria-hidden="true">
                  <path d="M5 21.5 C8 20.8 8.8 16.4 11.7 14.3 C14 12.7 18.1 13 21 12.4 C24.4 8.1 27.4 6.7 33.3 6.8 C40.8 6.9 43.3 7.8 47.6 13.2 C52.4 14.2 56.5 15.8 59 18.1 C60.2 19.2 59.8 21 58.7 22" fill="none" stroke="#16a34a" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.8 22.2 C13.5 23.1 20.4 22.7 27.6 22.8 C37.8 23 48.8 22.4 58.2 22.2" fill="none" stroke="#22c55e" strokeWidth="3.2" strokeLinecap="round" />
                  <path d="M6.7 20.5 C10.4 18.9 9.8 15.5 13.1 13.7 M22 11.5 C26.1 7.4 29 7.2 34 7.4 C42 7.5 43.7 9.1 47 13.7" fill="none" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
                  <circle cx="16" cy="23" r="3.6" fill="#0f172a" stroke="#f8fafc" strokeWidth="2.1" />
                  <circle cx="49" cy="23" r="3.6" fill="#0f172a" stroke="#f8fafc" strokeWidth="2.1" />
                  <path d="M25.5 11.8 C29.8 11.1 35.2 11.2 39.7 12 M32.9 11.8 C32.5 15 32.3 18.3 31.8 21.2" fill="none" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" />
                  <path d="M26.2 12.5 C30.3 11.8 35.5 11.9 39 12.5" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
                </svg>
              </span>
            </Link>

            {user?.email && (
              <Link
                href="/kabinets"
                title={user.email}
                aria-label="Atvērt lietotāja kabinetu"
                style={{
                  minWidth: 0,
                  maxWidth: '58%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#cbd5e1',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'right',
                  marginRight: '12px',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
              >
                {user.email}
              </Link>
            )}
          </div>
        </header>
        <div aria-hidden="true" style={{ height: '58px', flex: '0 0 58px' }} />
      </>
    )
  }

  if (isListingDetail) {
    return (
      <header
        data-temauto-header="true"
        data-listing-detail-header="true"
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#22c55e',
            textDecoration: 'none'
          }}
        >
          TemAuto
        </Link>
      </header>
    )
  }

  return (
    <header
      data-temauto-header="true"
      style={{ 
        backgroundColor: '#0f172a', 
        color: '#ffffff', 
        padding: '12px 20px', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), 0 16px 0 0 #f8fafc'
      }}
    >
      <div data-header-shell="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* KREISĀ PUSE: Logo un Apmeklētāji */}
        <div data-header-brand="true" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link
            href="/"
            data-header-home-link="true"
            aria-label="TemAuto — atgriezties sākumlapā"
            onClick={(e) => {
              e.preventDefault()
              const homeState = {
                ...(window.history.state || {}),
                temAutoScrollGuard: true
              }
              delete homeState.temAutoHeaderOverlay
              delete homeState.temAutoCatalogueOverlay
              window.history.replaceState(homeState, '', '/')
              window.location.reload()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              color: '#22c55e',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            <span data-header-wordmark="true" style={{ fontSize: '20px', fontWeight: 'bold' }}>
              TemAuto
            </span>

            {pathname === '/' && (
              <span
                data-header-home-logo="true"
                aria-hidden="true"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '0 0 52px',
                  width: '52px',
                  height: '30px',
                  marginLeft: 'auto',
                  transform: 'rotate(-3deg)'
                }}
              >
                <svg viewBox="0 0 64 32" width="52" height="28" role="img" aria-hidden="true">
                  <path d="M5 21.5 C8 20.8 8.8 16.4 11.7 14.3 C14 12.7 18.1 13 21 12.4 C24.4 8.1 27.4 6.7 33.3 6.8 C40.8 6.9 43.3 7.8 47.6 13.2 C52.4 14.2 56.5 15.8 59 18.1 C60.2 19.2 59.8 21 58.7 22" fill="none" stroke="#16a34a" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.8 22.2 C13.5 23.1 20.4 22.7 27.6 22.8 C37.8 23 48.8 22.4 58.2 22.2" fill="none" stroke="#22c55e" strokeWidth="3.2" strokeLinecap="round" />
                  <path d="M6.7 20.5 C10.4 18.9 9.8 15.5 13.1 13.7 M22 11.5 C26.1 7.4 29 7.2 34 7.4 C42 7.5 43.7 9.1 47 13.7" fill="none" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
                  <circle cx="16" cy="23" r="3.6" fill="#0f172a" stroke="#f8fafc" strokeWidth="2.1" />
                  <circle cx="49" cy="23" r="3.6" fill="#0f172a" stroke="#f8fafc" strokeWidth="2.1" />
                  <path d="M25.5 11.8 C29.8 11.1 35.2 11.2 39.7 12 M32.9 11.8 C32.5 15 32.3 18.3 31.8 21.2" fill="none" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" />
                  <path d="M26.2 12.5 C30.3 11.8 35.5 11.9 39 12.5" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
                </svg>
              </span>
            )}
          </Link>

          <div data-header-visitor-wrap="true" style={{ position: 'relative' }}>
            <button
              type="button"
              data-header-visitors="true"
              aria-label="Apmeklējumi pēdējās 24 stundās"
              aria-expanded={visitorStatsOpen}
              onClick={toggleVisitorStats}
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
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <span aria-hidden="true">👤</span>
              <span>24h: <strong style={{ color: '#22c55e' }}>{visitCount}</strong></span>
            </button>
            {visitorStatsOpen && (
              <div data-header-visitor-stats="true">
                <strong>Apmeklējumi pa reģioniem</strong>
                <div><span>Kopā 24h</span><b>{visitCount}</b></div>
                <small>Detalizēts sadalījums būs redzams pēc reģionu uzskaites pieslēgšanas.</small>
              </div>
            )}
          </div>
        </div>

        {/* LABĀ PUSE: Valodas, Reģioni un Navigācija */}
        <div data-header-controls="true" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
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
              <div data-header-lang-panel="true" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', width: '230px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', padding: '8px', zIndex: 100 }}>
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
                      onClick={() => {
                        setCurrentLang(l.code)
                        setLangOpen(false)
                        setLangSearch('')
                        returnToOpenMobileMenu()
                      }}
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
              <span data-header-region-label="true">{currentRegion}</span> ▾
            </button>

            {regionOpen && (
              <div data-header-region-flyout="true" style={{ display: 'flex', flexDirection: 'row-reverse', position: 'absolute', top: '100%', right: 0, marginTop: '6px', zIndex: 100 }}>
                
                {/* Galvenais valstu saraksts (atrodas pa labi, tieši zem izvēlnes pogas) */}
                <div data-header-region-panel="true" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0 8px 8px 0', width: '260px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', padding: '8px' }}>
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
                            // TAGAD VAR NOFIKSĒT ARĪ PAŠU VALSTI NEATKARĪGI NO TĀ, VAI TAI IR APAKŠREĢIONI!
                            setCurrentRegion(r.name)
                            setRegionOpen(false)
                            setRegionSearch('')
                            returnToOpenMobileMenu()
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
                  <div data-header-region-subregions="true" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRight: 'none', borderRadius: '8px 0 0 8px', width: '240px', boxShadow: '-10px 10px 15px -3px rgba(0,0,0,0.5)', padding: '12px', maxHeight: '316px', overflowY: 'auto' }}>
                    
                    {/* Ērta opcija izvēlēties TIKAI valsti tieši no reģionu saraksta augšas */}
                    <div
                      onClick={() => {
                        setCurrentRegion(hoveredRegionObj.name)
                        setRegionOpen(false)
                        setRegionSearch('')
                        returnToOpenMobileMenu()
                      }}
                      style={{
                        padding: '8px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: currentRegion === hoveredRegionObj.name ? '#22c55e' : '#22c55e',
                        backgroundColor: currentRegion === hoveredRegionObj.name ? '#334155' : '#0f172a',
                        border: '1px solid #22c55e',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginBottom: '10px',
                        textAlign: 'center'
                      }}
                    >
                      🌐 Visa valsts: {hoveredRegionObj.name.split(' ')[0]}
                    </div>

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
                            returnToOpenMobileMenu()
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
              <Link
                href="/kabinets"
                data-header-account-link="true"
                style={{ fontSize: '12px', color: '#cbd5e1', backgroundColor: '#1e293b', padding: '5px 10px', borderRadius: '12px', border: '1px solid #334155', textDecoration: 'none', cursor: 'pointer' }}
              >
                {user.user_metadata?.nickname || user.email}
              </Link>
            ) : (
              <Link href="/login?mode=register" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                Reģistrēties
              </Link>
            )}
            <button
              type="button"
              data-mobile-menu-toggle="true"
              aria-label="Atvērt izvēlni"
              aria-expanded={mobileMenuOpen}
              onTouchStart={handleMobileMenuButtonTouchStart}
              onClick={handleMobileMenuButtonClick}
            >
              <span aria-hidden="true">☰</span>
            </button>
            <a
              href="/pievienot"
              data-header-add="true"
              onClick={handleAddCarClick}
              style={{ backgroundColor: '#16a34a', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
            >
              + Pievienot auto
            </a>
          </nav>

          {mobileMenuOpen && (
            <div
              data-mobile-menu="true"
              data-closing={mobileMenuClosing ? 'true' : undefined}
              onTouchStart={handleMobileMenuTouchStart}
              onTouchMove={handleMobileMenuTouchMove}
              onTouchEnd={handleMobileMenuTouchEnd}
              onTouchCancel={() => {
                mobileMenuTouchStart.current = null
                if (!mobileMenuGestureDismissed.current) {
                  setMobileMenuClosing(false)
                }
              }}
            >
              <div data-mobile-menu-selectors="true">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setLangOpen(true)
                    setRegionOpen(false)
                  }}
                >
                  <span>Valoda</span>
                  <strong>
                    {currentLangObj && (
                      <img
                        src={`https://flagcdn.com/20x15/${currentLangObj.flagCode}.png`}
                        alt=""
                      />
                    )}
                    <span>{currentLang}</span>
                    <span aria-hidden="true">›</span>
                  </strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setRegionOpen(true)
                    setLangOpen(false)
                  }}
                >
                  <span>Reģions</span>
                  <strong>
                    {currentRegionObj && (
                      <img
                        src={`https://flagcdn.com/20x15/${currentRegionObj.flagCode}.png`}
                        alt=""
                      />
                    )}
                    <span>{currentRegion}</span>
                    <span aria-hidden="true">›</span>
                  </strong>
                </button>
                <div data-mobile-theme-picker="true" role="group" aria-label="Ekrāna režīms">
                  <button
                    type="button"
                    data-mobile-theme-option="day"
                    aria-label="Dienas režīms"
                    aria-pressed={mobileTheme === 'day'}
                    onClick={() => applyMobileTheme('day')}
                  >
                    <span aria-hidden="true">☀️</span>
                    <span>Diena</span>
                  </button>
                  <button
                    type="button"
                    data-mobile-theme-option="night"
                    aria-label="Nakts režīms"
                    aria-pressed={mobileTheme === 'night'}
                    onClick={() => applyMobileTheme('night')}
                  >
                    <span aria-hidden="true">🌙</span>
                    <span>Nakts</span>
                  </button>
                </div>
              </div>
              <nav aria-label="Informācija">
                {['Lietošanas noteikumi', 'Privātuma politika', 'Drošība un krāpniecība', 'Kontakti', 'Ieteikumi'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    disabled
                    title="Sadaļas saturs tiks pievienots"
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          )}

        </div>

      </div>
    </header>
  )
}
