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

// Reģioni/štati atkarībā no izvēlētās valsts
const REGIONS_BY_COUNTRY: { [key: string]: string[] } = {
  'Latvija': ['Rīga', 'Rīgas rajons', 'Jūrmala', 'Pierīga', 'Vidzeme', 'Kurzeme', 'Zemgale', 'Latgale', 'Liepāja', 'Ventspils', 'Jelgava', 'Daugavpils', 'Valmiera', 'Jēkabpils', 'Ogre', 'Tukums', 'Cēsis'],
  'Lietuva': ['Viļņa', 'Kaunā', 'Klaipēda', 'Šauļi', 'Panevēža', 'Alitūta', 'Marijampole', 'Mažeiķi', 'Jonava', 'Utenas apskriets'],
  'Igaunija': ['Harju (Tallina)', 'Tartu', 'Ida-Viru', 'Pērnava', 'Lääne-Viru', 'Viljandi', 'Rapla', 'Võru', 'Saare', 'Järva'],
  'Vācija': ['Bavārija (Bayern)', 'Bādene-Virtemberga (Baden-Württemberg)', 'Ziemeļreinas-Vestfālene (Nordrhein-Westfalen)', 'Lejasinsemene (Niedersachsen)', 'Hesene (Hessen)', 'Berlīne', 'Hamburga', 'Saksija (Sachsen)', 'Reinlande-Pfalca (Rheinland-Pfalz)'],
  'Polija': ['Mazovijas vojevodiste (Varšava)', 'Mazpolijas vojevodiste (Krakova)', 'Lielpolijas vojevodiste (Poznaņa)', 'Lejassilēzijas vojevodiste', 'Pomožes vojevodiste (Gdaņska)'],
  'ASV': ['Kalifornija (CA)', 'Teksasa (TX)', 'Ņujorka (NY)', 'Florida (FL)', 'Ilinoisa (IL)', 'Pensilvānija (PA)', 'Ohaio (OH)', 'Vašingtona (WA)', 'Nevada (NV)', 'Ņūdžersija (NJ)', 'Masačūsetsa (MA)', 'Džordžija (GA)', 'Ziemeļkarolīna (NC)', 'Mičigana (MI)']
}

// Noklusējuma reģioni, ja valstij nav specifiska saraksta
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
  'Melna', 'Balta', 'Pelēka', 'Sudraba', 'Zila', 'Sarkana', 'Zaļa', 'Brūna', 'Zelta', 'Oranža', 'Dzeltena', 'Violeta'
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

  // Aprēķina pieejamos reģionus balstoties uz izvēlēto valsti
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
        
        {/* KREISĀ PUSE */}
        <div style={{ position: 'sticky', top: '80px', alignSelf: 'start', minHeight: '500px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px', boxSizing: 'border-box' }}>
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

        {/* VIDUS: Filtri */}
        <div style={{ minWidth: 0, width: '100%', alignSelf: 'start' }}>
          
          <div style={{ backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #e5e7eb' }}>
            
            {/* 1. Rinda */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              
              {/* VALSTS */}
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

              {/* REĢIONS (Dinamiskais) */}
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
              
              {/* Cena */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="number" placeholder="Cena no" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} />
                <span style={{ fontSize: '12px', color: '#4b5563' }}>→</span>
                <input type="number" placeholder="līdz" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} />
              </div>

              {/* Gads */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="number" placeholder="Gads no" value={minYear} onChange={(e) => setMinYear(e.target.value)} style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} />
                <span style={{ fontSize: '12px', color: '#4b5563' }}>→</span>
                <input type="number" placeholder="līdz" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: '#fff' }} />
              </div>
            </div>

            {/* 2. Rinda */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              
              {/* DZINĒJS */}
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

              {/* Tilpums */}
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

              {/* ĀTRUMKĀRBA */}
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

              {/* VIRSBŪVE */}
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

              {/* KRĀSA */}
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
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div onClick={() => { setKrasa(''); setActiveDropdown(null); }} style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>Visas krāsas</div>
                    {COLORS.filter(k => k.toLowerCase().includes(krasa.toLowerCase())).map((k) => (
                      <div key={k} onClick={() => { setKrasa(k); setActiveDropdown(null); }} style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}>{k}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notīrīt */}
              {(valsts || regions || minPrice || maxPrice || minYear || maxYear || dzinejs || minTilpums || maxTilpums || atrumkarba || virsbuve || krasa || searchMake) && (
                <button
                  onClick={() => {
                    setValsts(''); setRegions(''); setMinPrice(''); setMaxPrice('');
                    setMinYear(''); setMaxYear(''); setDzinejs(''); setMinTilpums('');
                    setMaxTilpums(''); setAtrumkarba(''); setVirsbuve(''); setKrasa(''); setSearchMake('');
                  }}
                  style={{ padding: '6px 12px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                >
                  Notīrīt
                </button>
              )}
            </div>

          </div>

          {/* Sludinājumu režģis */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Ielādē sludinājumus...</div>
          ) : filteredCars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Nav atrasts neviens auto.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {filteredCars.map((car) => (
                <Link key={car.id} href={`/auto/${car.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ height: '140px', backgroundColor: '#f3f4f6' }}>
                      {car.image ? <img src={car.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '12px' }}>Nav attēla</div>}
                    </div>
                    <div style={{ padding: '8px' }}>
                      <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#111827', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car.make} {car.model}</h2>
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0' }}>{car.year} g. {car.engine ? `• ${car.engine}` : ''}</p>
                      <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>€{car.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* LABĀ PUSE */}
        <div style={{ position: 'sticky', top: '80px', alignSelf: 'start', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '13.5px', margin: 0 }}>Globālais baneris šeit!</p>
          </div>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '13.5px', margin: 0 }}>Globālais baneris šeit!</p>
          </div>
        </div>

      </div>
    </div>
  )
}
