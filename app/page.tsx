'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

// Oficiālo marku standarts bez dublējošām rindām
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
  'mini': 'Mini',
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
  { name: 'Latvija', code: 'lv', regions: ['Rīga', 'Pierīga', 'Jūrmala', 'Vidzeme', 'Kurzeme', 'Zemgale', 'Latgale'] },
  { name: 'Igaunija', code: 'ee', regions: ['Tallina', 'Tartu', 'Narva', 'Pērnava', 'Ziemeļigaunija', 'Dienvidigaunija'] },
  { name: 'Lietuva', code: 'lt', regions: ['Viļņa', 'Kauņa', 'Klaipēda', 'Šauļi', 'Panevēža'] },
  { name: 'Vācija', code: 'de', regions: ['Berlīne', 'Minhene', 'Frankfurte', 'Hamburga', 'Ķelne'] }
];

const ENGINE_TYPES = ['Dīzelis', 'Benzīns', 'Hibrīds', 'Elektrība', 'Gāze / Benzīns'];

export default function Home() {
  const router = useRouter()
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filtru stāvokļi
  const [searchMake, setSearchMake] = useState('')
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

  // Dropdown kontrole
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    fetchCars()
  }, [])

  async function fetchCars() {
    try {
      const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setCars(data || [])
    } catch (error) {
      console.error('Kļūda ielādējot auto:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPriceInput = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return ''
    return Number(numbers).toLocaleString('lv-LV')
  }

  const normalizedMakes = useMemo(() => {
    const counts: { [key: string]: { originalName: string, count: number } } = {}
    cars.forEach(car => {
      if (!car.make) return
      const raw = car.make.trim()
      const lower = raw.toLowerCase()
      const standard = OFFICIAL_MAKES[lower] || (raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase())
      const key = standard.toLowerCase()

      if (!counts[key]) {
        counts[key] = { originalName: standard, count: 0 }
      }
      counts[key].count += 1
    })

    return Object.values(counts).sort((a, b) => b.count - a.count)
  }, [cars])

  const availableRegions = useMemo(() => {
    const found = COUNTRIES.find(c => c.name.toLowerCase() === valsts.toLowerCase())
    return found ? found.regions : []
  }, [valsts])

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      if (searchMake) {
        const carMakeLower = (car.make || '').toLowerCase()
        const targetLower = searchMake.toLowerCase()
        const standardCarMake = OFFICIAL_MAKES[carMakeLower] || carMakeLower
        const standardTarget = OFFICIAL_MAKES[targetLower] || targetLower
        if (standardCarMake.toLowerCase() !== standardTarget.toLowerCase()) return false
      }
      if (valsts && !(car.valsts || '').toLowerCase().includes(valsts.toLowerCase())) return false
      if (regions && !(car.regions || '').toLowerCase().includes(regions.toLowerCase())) return false
      
      const p = Number(car.price || 0)
      if (minPrice && p < Number(minPrice)) return false
      if (maxPrice && p > Number(maxPrice)) return false

      const y = Number(car.year || 0)
      if (minYear && y < Number(minYear)) return false
      if (maxYear && y > Number(maxYear)) return false

      if (dzinejs && !(car.dzinejs || '').toLowerCase().includes(dzinejs.toLowerCase())) return false
      if (atrumkarba && !(car.atrumkarba || '').toLowerCase().includes(atrumkarba.toLowerCase())) return false
      if (virsbuve && !(car.virsbuve || '').toLowerCase().includes(virsbuve.toLowerCase())) return false
      if (krasa && !(car.krasa || '').toLowerCase().includes(krasa.toLowerCase())) return false

      return true
    })
  }, [cars, searchMake, valsts, regions, minPrice, maxPrice, minYear, maxYear, dzinejs, atrumkarba, virsbuve, krasa])

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name)
  }

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 10px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Auto Sludinājumi</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/pievienot" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
            Pievienot sludinājumu
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 220px', gap: '20px', alignItems: 'start' }}>
        
        {/* KRESAIS SĀNS */}
        <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', position: 'sticky', top: '80px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#374151' }}>Auto markas</h3>
          <div 
            onClick={() => setSearchMake('')} 
            style={{ padding: '6px 8px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', backgroundColor: searchMake === '' ? '#eff6ff' : 'transparent', color: searchMake === '' ? '#1d4ed8' : '#374151', fontWeight: searchMake === '' ? 'bold' : 'normal' }}
          >
            Visas markas ({cars.length})
          </div>
          <div style={{ maxHeight: '70vh', overflowY: 'auto', marginTop: '6px' }}>
            {normalizedMakes.map(m => (
              <div 
                key={m.originalName}
                onClick={() => setSearchMake(m.originalName)}
                style={{ 
                  padding: '5px 8px', 
                  fontSize: '13px', 
                  cursor: 'pointer', 
                  borderRadius: '4px', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  backgroundColor: searchMake.toLowerCase() === m.originalName.toLowerCase() ? '#eff6ff' : 'transparent',
                  color: searchMake.toLowerCase() === m.originalName.toLowerCase() ? '#1d4ed8' : '#4b5563',
                  fontWeight: searchMake.toLowerCase() === m.originalName.toLowerCase() ? 'bold' : 'normal'
                }}
              >
                <span>{m.originalName}</span>
                <span style={{ color: '#9ca3af', fontSize: '11px' }}>{m.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* VIDUS: Filtri un Saraksts */}
        <div style={{ minWidth: 0, width: '100%', alignSelf: 'start' }}>
          
          <div style={{ 
            position: 'sticky', 
            top: '20px', 
            zIndex: 40, 
            backgroundColor: '#f9fafb', 
            paddingBottom: '10px',
            paddingTop: '5px'
          }}>
            <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              
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
                          style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}
                        >
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
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                  )}
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
                </div>

                {(valsts || regions || minPrice || maxPrice || minYear || maxYear || dzinejs || minTilpums || maxTilpums || atrumkarba || virsbuve || krasa || searchMake) && (
                  <button
                    onClick={() => {
                      setValsts(''); setRegions(''); setMinPrice(''); setMaxPrice('');
                      setDisplayMinPrice(''); setDisplayMaxPrice('');
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
          </div>

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

        {/* LABAIS SĀNS */}
        <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', position: 'sticky', top: '80px', textAlign: 'center', color: '#9ca3af', fontSize: '12px', minHeight: '300px' }}>
          Reklāma / Baneris
        </div>

      </div>
    </div>
  )
}
