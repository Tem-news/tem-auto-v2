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
  { name: 'ASV', code: 'us' }
]

const REGIONS_BY_COUNTRY: { [key: string]: string[] } = {
  'Latvija': ['Rīga', 'Rīgas rajons', 'Jūrmala', 'Pierīga', 'Vidzeme', 'Kurzeme', 'Zemgale', 'Latgale', 'Liepāja', 'Ventspils', 'Jelgava', 'Daugavpils'],
  'Lietuva': ['Viļņa', 'Kauna', 'Klaipēda', 'Šauļi', 'Panevēža'],
  'Igaunija': ['Harju (Tallina)', 'Tartu', 'Ida-Viru', 'Pērnava']
}

const DEFAULT_REGIONS = ['Galvaspilsēta / Centrs', 'Ziemeļu reģions', 'Dienvidu reģions']
const ENGINE_TYPES = ['Dīzelis', 'Benzīns', 'Benzīns / Gāze', 'Hibrīds (Benzīns)', 'Elektriskais']
const GEARBOX_TYPES = ['Mehāniskā', 'Automāts', 'Pusautomāts']
const BODY_TYPES = ['Sedans', 'Universāls', 'Hečbeks', 'Apvidus (SUV)', 'Kupeja', 'Kabriolets', 'Minivens', 'Pikaps']

const COLORS = [
  { name: 'Melna', hex: '#111827', border: '#374151' },
  { name: 'Balta', hex: '#ffffff', border: '#d1d5db' },
  { name: 'Pelēka', hex: '#6b7280', border: '#4b5563' },
  { name: 'Sudraba', hex: '#e5e7eb', border: '#9ca3af' },
  { name: 'Zila', hex: '#2563eb', border: '#1d4ed8' },
  { name: 'Sarkana', hex: '#dc2626', border: '#b91c1c' },
  { name: 'Zaļa', hex: '#16a34a', border: '#15803d' },
  { name: 'Brūna', hex: '#78350f', border: '#451a03' }
]

const VOLUMES = ['1.0', '1.2', '1.4', '1.6', '1.8', '2.0', '2.5', '3.0', '3.5', '4.0']

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
    if (!valsts) return REGIONS_BY_COUNTRY['Latvija']
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
    <div ref={dropdownRef} style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '12px', boxSizing: 'border-box' }}>
      
      {/* 3 KOLONNU STRUKTŪRA: Kreisā mala (Markas) | Vidus (Filtri + Saraksts) | Labā mala (Reklāma) */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 220px', gap: '16px', alignItems: 'start', width: '100%' }}>
        
        {/* 1. KREISĀ PUSE: Marku saraksts */}
        <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '8px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ cursor: 'pointer', color: searchMake === '' ? '#0369a1' : '#111827' }} onClick={() => setSearchMake('')}>Visas markas</span>
            <span style={{ color: '#6b7280' }}>({cars.length})</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {makeCounts.map(([make, count]) => {
              const isSelected = searchMake.toLowerCase() === make.toLowerCase()
              return (
                <div
                  key={make}
                  onClick={() => handleMakeSelect(make)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '4px 6px',
                    backgroundColor: isSelected ? '#e0f2fe' : 'transparent',
                    color: isSelected ? '#0369a1' : '#1f2937',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isSelected ? '700' : '500'
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f3f4f6' }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <span>{make}</span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>({count})</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 2. VIDUS PUSE: Filtri un Saraksta skats vertikāli (rindās) */}
        <div style={{ minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Virsraksts un aktīvais filtrs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', color: '#111827', fontWeight: 'bold' }}>
              {searchMake ? `${searchMake} sludinājumi` : 'Visi auto sludinājumi'}
            </h2>
            {searchMake && (
              <span style={{ fontSize: '12px', color: '#0369a1', cursor: 'pointer' }} onClick={() => setSearchMake('')}>
                Filtra: {searchMake} [noņemt]
              </span>
            )}
          </div>

          {/* FILTRI (Horizontāli kompaktā joslā) */}
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '10px', 
            borderRadius: '4px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            border: '1px solid #e5e7eb'
          }}>
            {/* 1. rinda filtr কারও */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              
              {/* Valsts */}
              <div style={{ position: 'relative', flex: '1', minWidth: '100px' }}>
                <input
                  type="text"
                  placeholder="Valsts"
                  value={valsts}
                  onChange={(e) => { setValsts(e.target.value); setActiveDropdown('valsts'); }}
                  onClick={() => toggleDropdown('valsts')}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}
                />
                {activeDropdown === 'valsts' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '4px', zIndex: 50, maxHeight: '180px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div onClick={() => { setValsts(''); setRegions(''); setActiveDropdown(null); }} style={{ padding: '5px 8px', fontSize: '12px', cursor: 'pointer', color: '#6b7280' }}>Visas valstis</div>
                    {COUNTRIES.filter(c => c.name.toLowerCase().includes(valsts.toLowerCase())).map((c) => (
                      <div key={c.name} onClick={() => { setValsts(c.name); setRegions(''); setActiveDropdown(null); }} style={{ padding: '5px 8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src={`https://flagcdn.com/20x15/${c.code}.png`} alt={c.name} style={{ width: '16px', height: '12px' }} />
                        <span>{c.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reģions */}
              <div style={{ position: 'relative', flex: '1', minWidth: '100px' }}>
                <input
                  type="text"
                  placeholder="Reģions"
                  value={regions}
                  onChange={(e) => { setRegions(e.target.value); setActiveDropdown('regions'); }}
                  onClick={() => toggleDropdown('regions')}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}
                />
                {activeDropdown === 'regions' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '4px', zIndex: 50, maxHeight: '180px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div onClick={() => { setRegions(''); setActiveDropdown(null); }} style={{ padding: '5px 8px', fontSize: '12px', cursor: 'pointer', color: '#6b7280' }}>Visi reģioni</div>
                    {availableRegions.filter(r => r.toLowerCase().includes(regions.toLowerCase())).map((r) => (
                      <div key={r} onClick={() => { setRegions(r); setActiveDropdown(null); }} style={{ padding: '5px 8px', fontSize: '12px', cursor: 'pointer' }}>{r}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modelis */}
              <div style={{ flex: '1', minWidth: '100px' }}>
                <input 
                  type="text" 
                  placeholder="Meklēt modeli..." 
                  value={searchModel} 
                  onChange={(e) => setSearchModel(e.target.value)} 
                  style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff', boxSizing: 'border-box' }} 
                />
              </div>

              {/* Cena */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <input type="text" placeholder="Min €" value={displayMinPrice} onChange={(e) => { const f = formatPriceInput(e.target.value); setDisplayMinPrice(f); setMinPrice(f.replace(/\s/g, '')); }} style={{ width: '65px', padding: '5px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} />
                <span style={{ fontSize: '11px', color: '#6b7280' }}>līdz</span>
                <input type="text" placeholder="Maks €" value={displayMaxPrice} onChange={(e) => { const f = formatPriceInput(e.target.value); setDisplayMaxPrice(f); setMaxPrice(f.replace(/\s/g, '')); }} style={{ width: '65px', padding: '5px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} />
              </div>

              {/* Notīrīt */}
              <button 
                onClick={() => { setSearchMake(''); setSearchModel(''); setValsts(''); setRegions(''); setMinPrice(''); setMaxPrice(''); setDisplayMinPrice(''); setDisplayMaxPrice(''); setMinYear(''); setMaxYear(''); setDzinejs(''); setAtrumkarba(''); setVirsbuve(''); setKrasa(''); }}
                style={{ padding: '5px 8px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', color: '#374151' }}
              >
                Notīrīt
              </button>
            </div>

            {/* 2. rinda filtr কারও */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="number" placeholder="Gads no" value={minYear} onChange={(e) => setMinYear(e.target.value)} style={{ width: '65px', padding: '5px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} />
              <input type="number" placeholder="līdz" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} style={{ width: '65px', padding: '5px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} />
              
              <input type="text" placeholder="Dzinējs" value={dzinejs} onChange={(e) => setDzinejs(e.target.value)} style={{ width: '85px', padding: '5px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} />
              <input type="text" placeholder="Ātrumkārba" value={atrumkarba} onChange={(e) => setAtrumkarba(e.target.value)} style={{ width: '85px', padding: '5px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} />
              <input type="text" placeholder="Virsbūve" value={virsbuve} onChange={(e) => setVirsbuve(e.target.value)} style={{ width: '85px', padding: '5px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} />
              <input type="text" placeholder="Krāsa" value={krasa} onChange={(e) => setKrasa(e.target.value)} style={{ width: '75px', padding: '5px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} />
            </div>
          </div>

          {/* TABULAS GALVENĀS GALVIŅAS (Foto | Sludinājums / Apraksts | Gads | Cena) */}
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 80px 90px', backgroundColor: '#15803d', color: '#fff', padding: '6px 8px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', alignItems: 'center' }}>
            <div>Foto</div>
            <div>Sludinājums / Apraksts</div>
            <div>Gads</div>
            <div style={{ textAlign: 'right' }}>Cena</div>
          </div>

          {/* SLUDINĀJUMU SARAKSTS (Rindās uz leju, kā attēlā) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280', backgroundColor: '#fff', borderRadius: '4px' }}>Notiek sludinājumu ielāde...</div>
            ) : filteredCars.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#fff', borderRadius: '4px', color: '#6b7280' }}>
                Netika atrasts neviens auto, kas atbilstu izvēlētajiem kritērijiem.
              </div>
            ) : (
              filteredCars.map((car) => (
                <div 
                  key={car.id} 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '110px 1fr 80px 90px', 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '4px', 
                    overflow: 'hidden',
                    alignItems: 'center',
                    padding: '6px',
                    gap: '8px'
                  }}
                >
                  {/* Foto */}
                  <div style={{ width: '110px', height: '75px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                    {car.image_url || car.photo ? (
                      <img src={car.image_url || car.photo} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '11px' }}>Nav foto</div>
                    )}
                  </div>

                  {/* Apraksts un nosaukums */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0369a1' }}>
                      {car.make} {car.model} {car.volume ? `(${car.volume}L)` : ''}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {car.description || car.apraksts || `${car.engine || ''} ${car.gearbox || ''} ${car.country || ''}`}
                    </div>
                  </div>

                  {/* Gads */}
                  <div style={{ fontSize: '12px', color: '#374151' }}>
                    {car.year ? `${car.year} g.` : ''}
                  </div>

                  {/* Cena */}
                  <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>
                    {car.price ? `${formatPriceInput(String(car.price))} €` : '–'}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* 3. LABĀ PUSE: Reklāmu baneri (kā redzams attēlā) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#f3f4f6', border: '1px dashed #cbd5e1', borderRadius: '4px', padding: '30px 10px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA</div>
            Globālais baneris šeit!
          </div>
          <div style={{ backgroundColor: '#f3f4f6', border: '1px dashed #cbd5e1', borderRadius: '4px', padding: '60px 10px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA</div>
            Globālais baneris šeit!
          </div>
        </div>

      </div>
    </div>
  )
}
