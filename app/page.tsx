'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Sakumlapa() {
  const router = useRouter()
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [searchMake, setSearchMake] = useState('')
  const [searchModel, setSearchModel] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false })

      if (carsError) {
        console.error('Kļūda ielādējot auto:', carsError)
      } else {
        setCars(carsData || [])
      }
      setLoading(true ? false : false)
    }
    fetchData()
  }, [])

  // Aprēķinām marku skaitu un sarakstu kreisajai kolonnai
  const makeCounts = useMemo(() => {
    const counts: { [key: string]: number } = {}
    cars.forEach(car => {
      if (car.make) {
        const makeTrimmed = car.make.trim()
        if (makeTrimmed) {
          counts[makeTrimmed] = (counts[makeTrimmed] || 0) + 1
        }
      }
    })
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))
  }, [cars])

  // Ieteikumi markām meklētājā
  const filteredMakeSuggestions = useMemo(() => {
    if (!searchMake.trim()) return []
    const query = searchMake.toLowerCase()
    const matches = new Set<string>()
    cars.forEach(car => {
      if (car.make && car.make.toLowerCase().includes(query)) matches.add(car.make)
    })
    return Array.from(matches).slice(0, 5)
  }, [searchMake, cars])

  // Ieteikumi modeļiem
  const filteredModelSuggestions = useMemo(() => {
    if (!searchModel.trim()) return []
    const query = searchModel.toLowerCase()
    const matches = new Set<string>()
    cars.forEach(car => {
      if (searchMake.trim() && car.make && car.make.toLowerCase() !== searchMake.toLowerCase()) {
        return
      }
      if (car.model && car.model.toLowerCase().includes(query)) matches.add(car.model)
    })
    return Array.from(matches).slice(0, 5)
  }, [searchModel, searchMake, cars])

  const filteredCars = cars.filter((car) => {
    const matchesMake = searchMake ? (car.make || '').toLowerCase().includes(searchMake.toLowerCase()) : true
    const matchesModel = searchModel ? (car.model || '').toLowerCase().includes(searchModel.toLowerCase()) : true
    
    const carPrice = Number(car.price)
    const matchesMinPrice = minPrice ? carPrice >= Number(minPrice) : true
    const matchesMaxPrice = maxPrice ? carPrice <= Number(maxPrice) : true

    return matchesMake && matchesModel && matchesMinPrice && matchesMaxPrice
  })

  const handleMakeSelect = (make: string) => {
    if (searchMake.toLowerCase() === make.toLowerCase()) {
      setSearchMake('')
    } else {
      setSearchMake(make)
    }
  }

  const handleModelSelect = (model: string) => {
    setSearchModel(model)
    const foundCar = cars.find(c => 
      (!searchMake || c.make?.toLowerCase() === searchMake.toLowerCase()) && 
      c.model?.toLowerCase() === model.toLowerCase()
    )
    if (foundCar) {
      router.push(`/auto/${foundCar.id}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredCars.length > 0) {
      router.push(`/auto/${filteredCars[0].id}`)
    }
  }

  return (
    <div style={{ width: '100%', padding: '30px 20px', fontFamily: 'sans-serif', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}>
      {/* Palielināts kopējais platums uz 1550px, lai viss būtu plaši un pārskatāmi */}
      <div style={{ width: '100%', maxWidth: '1550px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* KREISĀ PUSE: Marku saraksts (fiksēts, nebrauc prom skrullējot) */}
        <div style={{ width: '220px', flexShrink: 0, position: 'sticky', top: '20px', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px' }}>
          {loading ? (
            <div style={{ fontSize: '13px', color: '#6b7280', padding: '10px' }}>Ielādē...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {/* Poga "Visas markas" */}
              <button
                onClick={() => setSearchMake('')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: '6px 8px',
                  backgroundColor: searchMake === '' ? '#e0f2fe' : 'transparent',
                  color: searchMake === '' ? '#0369a1' : '#374151',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: searchMake === '' ? 'bold' : 'normal',
                  textAlign: 'left'
                }}
              >
                <span>Visas markas</span>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>({cars.length})</span>
              </button>

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
                      padding: '6px 8px',
                      backgroundColor: isSelected ? '#e0f2fe' : 'transparent',
                      color: isSelected ? '#0369a1' : '#374151',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f3f4f6'
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{make}</span>
                    <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '6px' }}>({count})</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* VIDUS UN LABĀ PUSE: Katalogš un Reklāma */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Auto Tirgus</h1>
              {searchMake && (
                <div style={{ fontSize: '14px', color: '#4b5563' }}>
                  Filtrs: <strong style={{ color: '#0369a1' }}>{searchMake}</strong> 
                  <button 
                    onClick={() => setSearchMake('')} 
                    style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}
                  >
                    [noņemt]
                  </button>
                </div>
              )}
            </div>

            {/* Meklēšanas un filtru panelis */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', backgroundColor: '#f3f4f6', padding: '14px', borderRadius: '8px', marginBottom: '20px', alignItems: 'center' }}>
              
              <div style={{ flex: '1', minWidth: '140px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Meklēt marku..."
                  value={searchMake}
                  onChange={(e) => setSearchMake(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />

                {filteredMakeSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', marginTop: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 50, overflowY: 'auto' }}>
                    {filteredMakeSuggestions.map((item: string) => (
                      <div
                        key={item}
                        onClick={() => handleMakeSelect(item)}
                        style={{ padding: '8px 10px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ flex: '1', minWidth: '140px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Meklēt modeli..."
                  value={searchModel}
                  onChange={(e) => setSearchModel(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />

                {filteredModelSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', marginTop: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 50, overflowY: 'auto' }}>
                    {filteredModelSuggestions.map((item: string) => (
                      <div
                        key={item}
                        onClick={() => handleModelSelect(item)}
                        style={{ padding: '8px 10px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ width: '90px' }}>
                <input
                  type="number"
                  placeholder="Min €"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
              </div>
              <span style={{ color: '#4b5563', fontSize: '13px' }}>līdz</span>
              <div style={{ width: '90px' }}>
                <input
                  type="number"
                  placeholder="Maks €"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
              </div>

              {(searchMake || searchModel || minPrice || maxPrice) && (
                <button
                  onClick={() => { setSearchMake(''); setSearchModel(''); setMinPrice(''); setMaxPrice(''); }}
                  style={{ padding: '9px 12px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  Notīrīt
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Ielādē sludinājumus...</div>
            ) : filteredCars.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Nav atrasts neviens auto.</div>
            ) : (
              /* Stingri uzstādītas 3 kolonnas (repeat(3, 1fr)) */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {filteredCars.map((car) => (
                  <Link key={car.id} href={`/auto/${car.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <div style={{ height: '160px', backgroundColor: '#f3f4f6' }}>
                        {car.image ? <img src={car.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>Nav attēla</div>}
                      </div>
                      <div style={{ padding: '14px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 6px 0' }}>{car.make} {car.model}</h2>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>{car.year} g. {car.engine ? `• ${car.engine}` : ''}</p>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>€{car.price}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Reklāmas laukums labajā malā (arī fiksēts) */}
          <div style={{ width: '220px', flexShrink: 0, position: 'sticky', top: '20px' }}>
            <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Reklāma</span>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Globālais baneris šeit!</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
