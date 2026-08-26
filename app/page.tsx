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
      setLoading(false)
    }
    fetchData()
  }, [])

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

  const filteredMakeSuggestions = useMemo(() => {
    if (!searchMake.trim()) return []
    const query = searchMake.toLowerCase()
    const matches = new Set<string>()
    cars.forEach(car => {
      if (car.make && car.make.toLowerCase().includes(query)) matches.add(car.make)
    })
    return Array.from(matches).slice(0, 5)
  }, [searchMake, cars])

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
    <div style={{ width: '100%', minHeight: '100vh', padding: '16px 12px', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr 240px', gap: '16px', alignItems: 'start', width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* KREISĀ PUSE: Fiksēta */}
        <div style={{ position: 'sticky', top: '80px', alignSelf: 'start', height: 'fit-content', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px', boxSizing: 'border-box' }}>
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
                  padding: '6px 8px',
                  backgroundColor: searchMake === '' ? '#e0f2fe' : 'transparent',
                  color: searchMake === '' ? '#0369a1' : '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: searchMake === '' ? 'bold' : 'normal',
                  textAlign: 'left',
                  marginBottom: '6px'
                }}
              >
                <span>Visas markas</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>({cars.length})</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
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
                        padding: '5px 6px',
                        backgroundColor: isSelected ? '#bae6fd' : 'transparent',
                        color: isSelected ? '#0369a1' : '#374151',
                        border: isSelected ? '1px solid #0284c7' : 'none',
                        borderRadius: '4px',
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
                      <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '4px', flexShrink: 0 }}>({count})</span>
                    </button>
                  )
                })}
              </div>

              <div style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#4b5563', padding: '2px 4px', marginBottom: '4px' }}>CITS</div>
                <Link href="/cits" style={{ textDecoration: 'none' }}>
                  <div 
                    style={{ 
                      padding: '7px 8px', 
                      backgroundColor: '#fff', 
                      border: '1px dashed #cbd5e1', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      color: '#0369a1', 
                      textAlign: 'center',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    Nestandarta pakalpojumi, maiņa, remonts u.c.
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* VIDUS: Sludinājumi un filtri */}
        <div style={{ minWidth: 0, width: '100%', alignSelf: 'start' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              {searchMake ? `${searchMake} sludinājumi` : 'Auto Tirgus'}
            </h1>
            {searchMake && (
              <div style={{ fontSize: '13px', color: '#4b5563' }}>
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

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '8px', marginBottom: '16px', alignItems: 'center' }}>
            <div style={{ flex: '1', minWidth: '120px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Meklēt marku..."
                value={searchMake}
                onChange={(e) => setSearchMake(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '12px' }}
              />

              {filteredMakeSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', marginTop: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 999, overflowY: 'auto' }}>
                  {filteredMakeSuggestions.map((item: string) => (
                    <div
                      key={item}
                      onClick={() => handleMakeSelect(item)}
                      style={{ padding: '7px 10px', cursor: 'pointer', fontSize: '12px', borderBottom: '1px solid #f3f4f6' }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: '1', minWidth: '120px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Meklēt modeli..."
                value={searchModel}
                onChange={(e) => setSearchModel(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '12px' }}
              />

              {filteredModelSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', marginTop: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 999, overflowY: 'auto' }}>
                  {filteredModelSuggestions.map((item: string) => (
                    <div
                      key={item}
                      onClick={() => handleModelSelect(item)}
                      style={{ padding: '7px 10px', cursor: 'pointer', fontSize: '12px', borderBottom: '1px solid #f3f4f6' }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ width: '75px' }}>
              <input
                type="number"
                placeholder="Min €"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '12px' }}
              />
            </div>
            <span style={{ color: '#4b5563', fontSize: '12px' }}>līdz</span>
            <div style={{ width: '75px' }}>
              <input
                type="number"
                placeholder="Maks €"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '12px' }}
              />
            </div>

            {(searchMake || searchModel || minPrice || maxPrice) && (
              <button
                onClick={() => { setSearchMake(''); setSearchModel(''); setMinPrice(''); setMaxPrice(''); }}
                style={{ padding: '7px 10px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                Notīrīt
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Ielādē sludinājumus...</div>
          ) : filteredCars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Nav atrasts neviens auto.</div>
          ) : searchMake ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 70px 90px', backgroundColor: '#15803d', color: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                <div>Foto</div>
                <div>Sludinājums / Apraksts</div>
                <div>Gads</div>
                <div style={{ textAlign: 'right' }}>Cena</div>
              </div>

              {filteredCars.map((car) => (
                <Link key={car.id} href={`/auto/${car.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 70px 90px', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px 10px', gap: '10px', boxSizing: 'border-box', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                       onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                       onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <div style={{ width: '110px', height: '65px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                      {car.image ? (
                        <img src={car.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '10px' }}>Nav attēla</div>
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0369a1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {car.make} {car.model} {car.engine ? `(${car.engine})` : ''}
                      </div>
                      <div style={{ fontSize: '12px', color: '#374151', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {car.description ? car.description : 'Pārdodu labu auto...'}
                      </div>
                    </div>

                    <div style={{ fontSize: '13px', color: '#374151' }}>
                      {car.year ? `${car.year} g.` : '-'}
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#15803d', textAlign: 'right' }}>
                      €{car.price}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {filteredCars.map((car) => (
                <Link key={car.id} href={`/auto/${car.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ height: '140px', backgroundColor: '#f3f4f6' }}>
                      {car.image ? <img src={car.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '12px' }}>Nav attēla</div>}
                    </div>
                    <div style={{ padding: '8px' }}>
                      <h2 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car.make} {car.model}</h2>
                      <p style={{ fontSize: '10px', color: '#6b7280', margin: '0 0 4px 0' }}>{car.year} g. {car.engine ? `• ${car.engine}` : ''}</p>
                      <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>€{car.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* LABĀ PUSE: Fiksēta */}
        <div style={{ position: 'sticky', top: '80px', alignSelf: 'start', height: 'fit-content', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Globālais baneris šeit!</p>
          </div>
          
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Globālais baneris šeit!</p>
          </div>
        </div>

      </div>
    </div>
  )
}
