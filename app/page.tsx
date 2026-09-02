'use client'
import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const OFFICIAL_MAKES: { [key: string]: string } = {
  'bmw': 'BMW',
  'audi': 'Audi',
  'volkswagen': 'Volkswagen',
  'vw': 'Volkswagen',
  'volvo': 'Volvo',
  'toyota': 'Toyota',
  'mercedes': 'Mercedes-Benz',
  'mercedes-benz': 'Mercedes-Benz',
  'mb': 'Mercedes-Benz',
  'alfa romeo': 'Alfa Romeo',
  'alfaromeo': 'Alfa Romeo',
  'chevrolet': 'Chevrolet',
  'chrysler': 'Chrysler',
  'citroen': 'Citroën',
  'cupra': 'Cupra',
  'dacia': 'Dacia',
  'dodge': 'Dodge',
  'ford': 'Ford',
  'honda': 'Honda',
  'hyundai': 'Hyundai',
  'kia': 'Kia',
  'lexus': 'Lexus',
  'mazda': 'Mazda',
  'mitsubishi': 'Mitsubishi',
  'nissan': 'Nissan',
  'opel': 'Opel',
  'peugeot': 'Peugeot',
  'porsche': 'Porsche',
  'renault': 'Renault',
  'skoda': 'Škoda',
  'subaru': 'Subaru',
  'suzuki': 'Suzuki',
  'tesla': 'Tesla'
}

const COUNTRIES = [
  { name: 'Latvija', code: 'lv' },
  { name: 'Lietuva', code: 'lt' },
  { name: 'Igaunija', code: 'ee' },
  { name: 'Vācija', code: 'de' },
  { name: 'Polija', code: 'pl' },
  { name: 'Zviedrija', code: 'se' },
  { name: 'Somija', code: 'fi' },
  { name: 'Dānija', code: 'dk' },
  { name: 'Norvēģija', code: 'no' },
  { name: 'Nīderlande', code: 'nl' },
  { name: 'Beļģija', code: 'be' },
  { name: 'Francija', code: 'fr' },
  { name: 'Itālija', code: 'it' },
  { name: 'Spānija', code: 'es' },
  { name: 'Lielbritānija', code: 'gb' },
  { name: 'ASV', code: 'us' },
  { name: 'Kanāda', code: 'ca' },
  { name: 'Austrija', code: 'at' },
  { name: 'Šveice', code: 'ch' },
  { name: 'Čehija', code: 'cz' },
  { name: 'Islande', code: 'is' },
  { name: 'Īrija', code: 'ie' },
  { name: 'Japāna', code: 'jp' },
  { name: 'Koreja', code: 'kr' },
  { name: 'Portugāle', code: 'pt' },
  { name: 'Rumānija', code: 'ro' },
  { name: 'Turcija', code: 'tr' },
  { name: 'Ukraina', code: 'ua' }
]

const REGIONS_BY_COUNTRY: { [key: string]: string[] } = {
  'Latvija': ['Rīga', 'Rīgas rajons', 'Jūrmala', 'Pierīga', 'Vidzeme', 'Kurzeme', 'Zemgale', 'Latgale', 'Liepāja', 'Ventspils', 'Jelgava', 'Daugavpils', 'Valmiera', 'Jēkabpils', 'Ogre', 'Tukums', 'Cēsis'],
  'Lietuva': ['Viļņa', 'Kauna', 'Klaipēda', 'Šauļi', 'Panevēža', 'Alīta', 'Marijampole', 'Mažeiķi', 'Jonava', 'Utenas apriņķis'],
  'Igaunija': ['Harju (Tallina)', 'Tartu', 'Ida-Viru', 'Pērnava', 'Lääne-Viru', 'Viljandi', 'Rapla', 'Võru', 'Saare', 'Järva'],
  'Vācija': [
    'Bāden-Virtemberga (Baden-Württemberg)', 'Bavārija (Bayern)', 'Berlīne (Berlin)', 'Brandenburga (Brandenburg)', 
    'Brēmene (Bremen)', 'Hamburga (Hamburg)', 'Hesene (Hessen)', 'Mērklenburga-Priekšpomerānija (Mecklenburg-Vorpommern)', 
    'Lejassaksija (Niedersachsen)', 'Ziemeļreina-Vestfālene (Nordrhein-Westfalen)', 'Reinlande-Pfalca (Rheinland-Pfalz)', 
    'Sāra (Saarland)', 'Saksija (Sachsen)', 'Saksija-Anhalte (Saksija-Anhalt)', 'Šlēsviga-Holšteina (Schleswig-Holstein)', 'Tīringene (Thüringen)'
  ],
  'Polija': [
    'Apakšsilēzijas vojevodiste (Dolnośląskie)', 'Kujāvijas-Pomožes vojevodiste (Kujawsko-pomorskie)', 'Lodzas vojevodiste (Łódzkie)', 
    'Mazpolijas vojevodiste (Małopolskie)', 'Mazovijas vojevodiste (Mazowieckie)', 'Opoles vojevodiste (Opolskie)', 
    'Piekarpatu vojevodiste (Podkarpackie)', 'Podlases vojevodiste (Podlaskie)', 'Pomožes vojevodiste (Pomorskie)', 
    'Saksijas/Silēzijas vojevodiste (Śląskie)', 'Svētkrusta vojevodiste (Świętokrzyskie)', 'Varmijas-Mazūrijas vojevodiste (Warmińsko-mazurskie)', 
    'Lielpolijas vojevodiste (Wielkopolskie)', 'Rietumpomožes vojevodiste (Zachodniopomorskie)', 'Lubļinas vojevodiste (Lubelskie)', 'Lubušas vojevodiste (Lubuskie)'
  ],
  'ASV': [
    'Alabama (AL)', 'Alaska (AK)', 'Arizona (AZ)', 'Arkansas (AR)', 'California (CA)', 
    'Colorado (CO)', 'Connecticut (CT)', 'Delaware (DE)', 'Florida (FL)', 'Georgia (GA)', 
    'Hawaii (HI)', 'Idaho (ID)', 'Illinois (IL)', 'Indiana (IN)', 'Iowa (IA)', 
    'Kansas (KS)', 'Kentucky (KY)', 'Louisiana (LA)', 'Maine (ME)', 'Maryland (MD)', 
    'Massachusetts (MA)', 'Michigan (MI)', 'Minnesota (MN)', 'Mississippi (MS)', 'Missouri (MO)', 
    'Montana (MT)', 'Nebraska (NE)', 'Nevada (NV)', 'New Hampshire (NH)', 'New Jersey (NJ)', 
    'New Mexico (NM)', 'New York (NY)', 'North Carolina (NC)', 'North Dakota (ND)', 'Ohio (OH)', 
    'Oklahoma (OK)', 'Oregon (OR)', 'Pennsylvania (PA)', 'Rhode Island (RI)', 'South Carolina (SC)', 
    'South Dakota (SD)', 'Tennessee (TN)', 'Texas (TX)', 'Utah (UT)', 'Vermont (VT)', 
    'Virginia (VA)', 'Washington (WA)', 'West Virginia (WV)', 'Wisconsin (WI)', 'Wyoming (WY)'
  ]
}

const DEFAULT_REGIONS = ['Galvaspilsēta / Centrs', 'Ziemeļu reģions', 'Dienvidu reģions', 'Austrumu reģions', 'Rietumu reģions']

const ENGINE_TYPES = [
  'Dīzelis', 'Benzīns', 'Benzīns / Gāze', 'Hibrīds (Benzīns)', 'Hibrīds (Dīzelis)', 'Elektriskais'
]

const GEARBOX_TYPES = [
  'Mehāniskā', 'Automāts', 'Pusautomāts'
]

const BODY_TYPES = [
  'Sedans', 'Universāls', 'Hečbeks', 'Apvidus (SUV)', 'Kupeja', 'Kabriolets', 'Minivens', 'Kompaktvens', 'Pikaps', 'Furgons'
]

const COLORS = [
  { name: 'Melna', hex: '#111827', border: '#374151' },
  { name: 'Balta', hex: '#ffffff', border: '#d1d5db' },
  { name: 'Pelēka', hex: '#6b7280', border: '#4b5563' },
  { name: 'Sudraba', hex: '#e5e7eb', border: '#9ca3af' },
  { name: 'Zila', hex: '#2563eb', border: '#1d4ed8' },
  { name: 'Sarkana', hex: '#dc2626', border: '#b91c1c' },
  { name: 'Zaļa', hex: '#16a34a', border: '#15803d' },
  { name: 'Brūna', hex: '#78350f', border: '#451a03' },
  { name: 'Zelta', hex: '#d97706', border: '#b45309' },
  { name: 'Oranža', hex: '#ea580c', border: '#c2410c' },
  { name: 'Dzeltena', hex: '#eab308', border: '#ca8a04' },
  { name: 'Violeta', hex: '#7c3aed', border: '#6d28d9' }
]

const VOLUMES = [
  '1.0', '1.2', '1.4', '1.6', '1.8', '2.0', '2.2', '2.5', '3.0', '3.5', '4.0', '5.0'
]

function normalizeMake(makeStr: string): string {
  if (!makeStr) return ''
  const trimmed = makeStr.trim()
  const lower = trimmed.toLowerCase()
  if (OFFICIAL_MAKES[lower]) {
    return OFFICIAL_MAKES[lower]
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function formatPriceInput(value: string): string {
  const cleanNums = value.replace(/\D/g, '')
  if (!cleanNums) return ''
  return cleanNums.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function Sakumlapa() {
  const router = useRouter()
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchMake, setSearchMake] = useState('')
  const [searchModel, setSearchModel] = useState('')
  
  const [valsts, setValsts] = useState('')
  const [regions, setRegions] = useState('')
  
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [displayMinPrice, setDisplayMinPrice] = useState('')
  const [displayMaxPrice, setDisplayMaxPrice] = useState('')
  const [minYear, setMinYear] = useState('')
  const [maxYear, setMaxYear] = useState('')
  const [dzinejs, setDzinejs] = useState('')
  const [minTilpums, setMinTilpums] = useState('')
  const [maxTilpums, setMaxTilpums] = useState('')
  const [atrumkarba, setAtrumkarba] = useState('')
  const [virsbuve, setVirsbuve] = useState('')
  const [krasa, setKrasa] = useState('')

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = (name: string) => {
    setActiveDropdown(prev => prev === name ? null : name)
  }

  const hasActiveFilters = searchMake 
    ? Boolean(searchModel || valsts || regions || minPrice || maxPrice || minYear || maxYear || dzinejs || minTilpums || maxTilpums || atrumkarba || virsbuve || krasa)
    : Boolean(searchMake || searchModel || valsts || regions || minPrice || maxPrice || minYear || maxYear || dzinejs || minTilpums || maxTilpums || atrumkarba || virsbuve || krasa)

  const clearAllFilters = () => {
    setSearchModel('')
    setValsts('')
    setRegions('')
    setMinPrice('')
    setMaxPrice('')
    setDisplayMinPrice('')
    setDisplayMaxPrice('')
    setMinYear('')
    setMaxYear('')
    setDzinejs('')
    setMinTilpums('')
    setMaxTilpums('')
    setAtrumkarba('')
    setVirsbuve('')
    setKrasa('')
    setActiveDropdown(null)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchData() {
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false })

      if (carsError) {
        console.error('Kļūda ielādējot auto:', carsError)
      } else {
        const normalizedCars = (carsData || []).map(car => ({
          ...car,
          make: normalizeMake(car.make)
        }))
        setCars(normalizedCars)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const availableRegions = useMemo(() => {
    if (!valsts) {
      return REGIONS_BY_COUNTRY['Latvija']
    }
    const foundKey = Object.keys(REGIONS_BY_COUNTRY).find(
      key => key.toLowerCase() === valsts.toLowerCase()
    )
    return foundKey ? REGIONS_BY_COUNTRY[foundKey] : DEFAULT_REGIONS
  }, [valsts])

  const makeCounts = useMemo(() => {
    const counts: { [key: string]: number } = {}
    cars.forEach(car => {
      if (car.make) {
        const cleanMake = car.make.trim()
        if (cleanMake) {
          counts[cleanMake] = (counts[cleanMake] || 0) + 1
        }
      }
    })
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))
  }, [cars])

  const filteredCars = cars.filter((car) => {
    const matchesMake = searchMake ? (car.make || '').toLowerCase().includes(searchMake.toLowerCase()) : true
    const matchesModel = searchModel ? (car.model || '').toLowerCase().includes(searchModel.toLowerCase()) : true
    
    const carPrice = Number(car.price)
    const matchesMinPrice = minPrice ? carPrice >= Number(minPrice) : true
    const matchesMaxPrice = maxPrice ? carPrice <= Number(maxPrice) : true

    const carYear = Number(car.year)
    const matchesMinYear = minYear ? carYear >= Number(minYear) : true
    const matchesMaxYear = maxYear ? carYear <= Number(maxYear) : true

    const carVolume = Number(car.volume || car.engine_volume || 0)
    const matchesMinTilpums = minTilpums ? carVolume >= Number(minTilpums) : true
    const matchesMaxTilpums = maxTilpums ? carVolume <= Number(maxTilpums) : true

    const matchesValsts = valsts ? (car.country || car.valsts || '').toLowerCase().includes(valsts.toLowerCase()) : true
    const matchesRegions = regions ? (car.region || car.regions || '').toLowerCase().includes(regions.toLowerCase()) : true
    const matchesDzinejs = dzinejs ? (car.engine || car.dzinejs || '').toLowerCase().includes(dzinejs.toLowerCase()) : true
    const matchesAtrumkarba = atrumkarba ? (car.gearbox || car.atrumkarba || '').toLowerCase().includes(atrumkarba.toLowerCase()) : true
    const matchesVirsbuve = virsbuve ? (car.body_type || car.virsbuve || '').toLowerCase().includes(virsbuve.toLowerCase()) : true
    const matchesKrasa = krasa ? (car.color || car.krasa || '').toLowerCase().includes(krasa.toLowerCase()) : true

    return matchesMake && matchesModel && matchesMinPrice && matchesMaxPrice && 
           matchesMinYear && matchesMaxYear && matchesMinTilpums && matchesMaxTilpums &&
           matchesValsts && matchesRegions && matchesDzinejs && matchesAtrumkarba && matchesVirsbuve && matchesKrasa
  })

  const handleMakeSelect = (make: string) => {
    if (searchMake.toLowerCase() === make.toLowerCase()) {
      setSearchMake('')
    } else {
      setSearchMake(make)
    }
  }

  return (
    <div ref={dropdownRef} style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '16px 12px', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr 240px', gap: '16px', alignItems: 'start', width: '100%' }}>
        
        {/* KREISĀ PUSE - Marku saraksts divās kolonnās */}
        <div style={{ position: 'sticky', top: '72px', alignSelf: 'start', minHeight: '500px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px', boxSizing: 'border-box' }}>
          {loading ? (
            <div style={{ fontSize: '13px', color: '#6b7280', padding: '8px' }}>Ielādē...</div>
          ) : (
            <div>
              <button
                onClick={() => setSearchMake('')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: '5px 6px',
                  backgroundColor: searchMake === '' ? '#e0f2fe' : 'transparent',
                  color: searchMake === '' ? '#0369a1' : '#1f2937',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  textAlign: 'left',
                  marginBottom: '4px'
                }}
              >
                <span>Visas markas</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>({cars.length})</span>
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
                {makeCounts.map(([make, count]) => {
                  const isSelected = searchMake.toLowerCase() === make.toLowerCase()
                  return (
                    <button
                      key={make}
                      onClick={() => handleMakeSelect(make)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        padding: '3px 4px',
                        backgroundColor: isSelected ? '#bae6fd' : 'transparent',
                        color: isSelected ? '#0369a1' : '#1f2937',
                        border: isSelected ? '1px solid #0284c7' : 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: '600',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{make}</span>
                      <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '2px', flexShrink: 0 }}>({count})</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* VIDUS: Filtri un Sludinājumu saraksts */}
        <div style={{ minWidth: 0, width: '100%', alignSelf: 'start' }}>
          
          {/* FILTRI */}
          <div style={{ 
            position: 'sticky', 
            top: '72px', 
            zIndex: 30, 
            backgroundColor: '#f3f4f6', 
            padding: '12px', 
            paddingTop: '20px', 
            marginTop: '-12px', 
            borderRadius: '8px', 
            marginBottom: '16px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                {searchMake ? `${searchMake} sludinājumi` : 'Visi auto sludinājumi'}
              </h2>
              
              {hasActiveFilters && (
                <button 
                  onClick={clearAllFilters} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    backgroundColor: '#fee2e2', 
                    color: '#991b1b', 
                    border: '1px solid #fecaca', 
                    borderRadius: '6px', 
                    padding: '4px 10px', 
                    cursor: 'pointer', 
                    fontSize: '12px', 
                    fontWeight: '600',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                >
                  <span>✕ Notīrīt filtrus</span>
                </button>
              )}
            </div>

            {/* 1. Rinda */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '110px' }}>
                <input
                  type="text"
                  placeholder="Valsts"
                  value={valsts}
                  onChange={(e) => { setValsts(e.target.value); setActiveDropdown('valsts'); }}
                  onClick={() => toggleDropdown('valsts')}
                  style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}
                />
                {activeDropdown === 'valsts' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div onClick={() => { setValsts(''); setRegions(''); setActiveDropdown(null); }} style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>Visas valstis</div>
                    {COUNTRIES.filter(c => c.name.toLowerCase().includes(valsts.toLowerCase())).map((c) => (
                      <div
                        key={c.name}
                        onClick={() => { 
                          setValsts(c.name); 
                          setRegions(''); 
                          setActiveDropdown(null); 
                        }}
                        style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        <img 
                          src={`https://flagcdn.com/20x15/${c.code}.png`} 
                          alt={c.name} 
                          style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #e5e7eb' }} 
                        />
                        <span>{c.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ position: 'relative', flex: '1', minWidth: '110px' }}>
                <input
                  type="text"
                  placeholder={valsts ? `Reģions (${valsts})` : "Reģions"}
                  value={regions}
                  onChange={(e) => { setRegions(e.target.value); setActiveDropdown('regions'); }}
                  onClick={() => toggleDropdown('regions')}
                  style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}
                />
                {activeDropdown === 'regions' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div onClick={() => { setRegions(''); setActiveDropdown(null); }} style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>Visi reģioni</div>
                    {availableRegions.filter(r => r.toLowerCase().includes(regions.toLowerCase())).map((r) => (
                      <div
                        key={r}
                        onClick={() => { setRegions(r); setActiveDropdown(null); }}
                        style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {r}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input 
                  type="text" 
                  placeholder="Cena no" 
                  value={displayMinPrice} 
                  onChange={(e) => {
                    const formatted = formatPriceInput(e.target.value)
                    setDisplayMinPrice(formatted)
                    setMinPrice(formatted.replace(/\s/g, ''))
                  }} 
                  style={{ width: '80px', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} 
                />
                <span style={{ fontSize: '12px', color: '#4b5563' }}>→</span>
                <input 
                  type="text" 
                  placeholder="līdz" 
                  value={displayMaxPrice} 
                  onChange={(e) => {
                    const formatted = formatPriceInput(e.target.value)
                    setDisplayMaxPrice(formatted)
                    setMaxPrice(formatted.replace(/\s/g, ''))
                  }} 
                  style={{ width: '80px', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="number" placeholder="Gads no" value={minYear} onChange={(e) => setMinYear(e.target.value)} style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} />
                <span style={{ fontSize: '12px', color: '#4b5563' }}>→</span>
                <input type="number" placeholder="līdz" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} />
              </div>
            </div>

            {/* 2. Rinda */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '110px' }}>
                <input
                  type="text"
                  placeholder="Dzinējs"
                  value={dzinejs}
                  onChange={(e) => { setDzinejs(e.target.value); setActiveDropdown('dzinejs'); }}
                  onClick={() => toggleDropdown('dzinejs')}
                  style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}
                />
                {activeDropdown === 'dzinejs' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div onClick={() => { setDzinejs(''); setActiveDropdown(null); }} style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>Visi dzinēji</div>
                    {ENGINE_TYPES.filter(d => d.toLowerCase().includes(dzinejs.toLowerCase())).map((d) => (
                      <div
                        key={d}
                        onClick={() => { setDzinejs(d); setActiveDropdown(null); }}
                        style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ position: 'relative', width: '70px' }}>
                  <input 
                    type="text" 
                    placeholder="Tilp. no" 
                    value={minTilpums} 
                    onChange={(e) => { setMinTilpums(e.target.value); setActiveDropdown('minTilpums'); }} 
                    onClick={() => toggleDropdown('minTilpums')}
                    style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff', boxSizing: 'border-box', cursor: 'pointer' }} 
                  />
                  {activeDropdown === 'minTilpums' && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, width: '100px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      {VOLUMES.map((v) => (
                        <div key={v} onClick={() => { setMinTilpums(v); setActiveDropdown(null); }} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}>{v}</div>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: '#4b5563' }}>→</span>
                <div style={{ position: 'relative', width: '70px' }}>
                  <input 
                    type="text" 
                    placeholder="līdz" 
                    value={maxTilpums} 
                    onChange={(e) => { setMaxTilpums(e.target.value); setActiveDropdown('maxTilpums'); }} 
                    onClick={() => toggleDropdown('maxTilpums')}
                    style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff', boxSizing: 'border-box', cursor: 'pointer' }} 
                  />
                  {activeDropdown === 'maxTilpums' && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, width: '100px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      {VOLUMES.map((v) => (
                        <div key={v} onClick={() => { setMaxTilpums(v); setActiveDropdown(null); }} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}>{v}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ position: 'relative', flex: '1', minWidth: '90px' }}>
                <input
                  type="text"
                  placeholder="Ātrumkārba"
                  value={atrumkarba}
                  onChange={(e) => { setAtrumkarba(e.target.value); setActiveDropdown('atrumkarba'); }}
                  onClick={() => toggleDropdown('atrumkarba')}
                  style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}
                />
                {activeDropdown === 'atrumkarba' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div onClick={() => { setAtrumkarba(''); setActiveDropdown(null); }} style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>Visas kārbas</div>
                    {GEARBOX_TYPES.filter(g => g.toLowerCase().includes(atrumkarba.toLowerCase())).map((g) => (
                      <div key={g} onClick={() => { setAtrumkarba(g); setActiveDropdown(null); }} style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}>{g}</div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ position: 'relative', flex: '1', minWidth: '90px' }}>
                <input
                  type="text"
                  placeholder="Virsbūve"
                  value={virsbuve}
                  onChange={(e) => { setVirsbuve(e.target.value); setActiveDropdown('virsbuve'); }}
                  onClick={() => toggleDropdown('virsbuve')}
                  style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}
                />
                {activeDropdown === 'virsbuve' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div onClick={() => { setVirsbuve(''); setActiveDropdown(null); }} style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>Visas virsbūves</div>
                    {BODY_TYPES.filter(b => b.toLowerCase().includes(virsbuve.toLowerCase())).map((b) => (
                      <div key={b} onClick={() => { setVirsbuve(b); setActiveDropdown(null); }} style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}>{b}</div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ position: 'relative', flex: '1', minWidth: '90px' }}>
                <input
                  type="text"
                  placeholder="Krāsa"
                  value={krasa}
                  onChange={(e) => { setKrasa(e.target.value); setActiveDropdown('krasa'); }}
                  onClick={() => toggleDropdown('krasa')}
                  style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}
                />
                {activeDropdown === 'krasa' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '220px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div onClick={() => { setKrasa(''); setActiveDropdown(null); }} style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>Visas krāsas</div>
                    {COLORS.filter(k => k.name.toLowerCase().includes(krasa.toLowerCase())).map((k) => (
                      <div 
                        key={k.name} 
                        onClick={() => { setKrasa(k.name); setActiveDropdown(null); }} 
                        style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} 
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} 
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: k.hex, border: `1px solid ${k.border}` }}></span>
                        <span>{k.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SKATS: Grid (ja nav izvēlēta marka) vai Tabulas rindas (ja marka izvēlēta) */}
          <div>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Notiek sludinājumu ielāde...</div>
            ) : filteredCars.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}>Nav atrasts neviens sludinājums ar šādiem kritērijiem.</div>
            ) : searchMake === '' ? (
              /* PARASTAIS GRID SKATS TITULLAPĀ */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {filteredCars.map((car, index) => {
                  const imageUrl = car.image_url || (car.images && car.images[0]) || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80'
                  return (
                    <Link 
                      key={car.id || index} 
                      href={`/auto/${car.id}`} 
                      style={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px', 
                        overflow: 'hidden', 
                        textDecoration: 'none', 
                        color: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ width: '100%', height: '160px', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
                        <img 
                          src={imageUrl} 
                          alt={car.make} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1d4ed8' }}>
                          {car.make} {car.model}
                        </div>
                        <div style={{ fontSize: '13px', color: '#4b5563', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{car.year ? `${car.year} g.` : ''}</span>
                          <span>{car.volume ? `${car.volume}L` : ''}</span>
                        </div>
                        <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#111827' }}>
                            {car.price ? `€${Number(car.price).toLocaleString('lv-LV')}` : ''}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              /* TABULAS RINDU SKATS, KAD IZVĒLĒTA MARKA (Secība: Foto | Marka Modelis | Gads | Virsbūve | Krāsa | Nobraukums | Cena) */
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 75px 110px 90px 100px 90px', backgroundColor: '#15803d', color: '#ffffff', padding: '10px 12px', fontSize: '12.5px', fontWeight: 'bold', alignItems: 'center' }}>
                  <div>Foto</div>
                  <div>Marka Modelis</div>
                  <div style={{ textAlign: 'center' }}>Gads</div>
                  <div>Virsbūve</div>
                  <div>Krāsa</div>
                  <div style={{ textAlign: 'right' }}>Nobraukums</div>
                  <div style={{ textAlign: 'right' }}>Cena</div>
                </div>

                {filteredCars.map((car, index) => {
                  const imageUrl = car.image_url || (car.images && car.images[0]) || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=300&q=80'
                  
                  // Nobraukuma formatējums (ja datubāzē ir skaitlis, pievienojam "km")
                  const rawMileage = car.mileage || car.noobraukums || car.nobraukums
                  const formattedMileage = rawMileage ? `${Number(rawMileage).toLocaleString('lv-LV')} km` : ''

                  return (
                    <Link 
                      key={car.id || index} 
                      href={`/auto/${car.id}`} 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '110px 1fr 75px 110px 90px 100px 90px', 
                        alignItems: 'center', 
                        padding: '10px 12px', 
                        borderBottom: '1px solid #e5e7eb', 
                        textDecoration: 'none', 
                        color: 'inherit',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        fontSize: '13px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9fafb'}
                    >
                      {/* 1. Foto */}
                      <div>
                        <img 
                          src={imageUrl} 
                          alt={car.make} 
                          style={{ width: '95px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #d1d5db' }} 
                        />
                      </div>

                      {/* 2. Marka Modelis */}
                      <div style={{ fontWeight: 'bold', color: '#1d4ed8', paddingRight: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {car.make} {car.model}
                      </div>

                      {/* 3. Izlaiduma gads */}
                      <div style={{ textAlign: 'center', color: '#374151' }}>
                        {car.year || ''}
                      </div>

                      {/* 4. Virsbūves tips */}
                      <div style={{ color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {car.body_type || car.virsbuve || ''}
                      </div>

                      {/* 5. Krāsa */}
                      <div style={{ color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {car.color || car.krasa || ''}
                      </div>

                      {/* 6. Nobraukums */}
                      <div style={{ textAlign: 'right', color: '#374151' }}>
                        {formattedMileage}
                      </div>

                      {/* 7. Cena */}
                      <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#111827' }}>
                        {car.price ? `€${Number(car.price).toLocaleString('lv-LV')}` : ''}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* LABĀ PUSE - Reklāmas vieta */}
        <div style={{ position: 'sticky', top: '72px', alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#6b7280', fontSize: '13px' }}>
            <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA</span>
            <span>Globālais baneris šeit!</span>
          </div>
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#6b7280', fontSize: '13px' }}>
            <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA</span>
            <span>Globālais baneris šeit!</span>
          </div>
        </div>

      </div>
    </div>
  )
}
