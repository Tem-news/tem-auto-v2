'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Sakumlapa() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState('1500')
  const [maxPrice, setMaxPrice] = useState('3500')

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

  // Aprēķina modeļu skaitu
  const modelCounts = useMemo(() => {
    const counts: { [key: string]: number } = {}
    cars.forEach((car) => {
      if (car.model) {
        const modelName = car.model.trim()
        counts[modelName] = (counts[modelName] || 0) + 1
      }
    })
    return counts
  }, [cars])

  // Ieteikumi meklētājam
  const filteredSuggestions = useMemo(() => {
    if (!search.trim()) return []
    const uniqueModels = Array.from(new Set(cars.map(c => c.model).filter(Boolean)))
    return uniqueModels.filter((model: string) =>
      model.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, cars])

  const filteredCars = cars.filter((car) => {
    const fullTitle = `${car.make || ''} ${car.model || ''}`.toLowerCase()
    const matchesSearch = fullTitle.includes(search.toLowerCase())
    const carPrice = Number(car.price)
    const matchesMinPrice = minPrice ? carPrice >= Number(minPrice) : true
    const matchesMaxPrice = maxPrice ? carPrice <= Number(maxPrice) : true
    return matchesSearch && matchesMinPrice && matchesMaxPrice
  })

  return (
    <div style={{ width: '100%', padding: '40px 20px', fontFamily: 'sans-serif', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1150px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Auto Tirgus</h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '24px', alignItems: 'center' }}>
            
            {/* Meklētājs ar ieteikumiem */}
            <div style={{ flex: '1', minWidth: '180px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Meklēt pēc markas vai modeļa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
              />

              {filteredSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', marginTop: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: '200px', overflowY: 'auto' }}>
                  {filteredSuggestions.map((modelName: string) => (
                    <div
                      key={modelName}
                      onClick={() => setSearch(modelName)}
                      style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                      <span>{modelName}</span>
                      <span style={{ color: '#6b7280', fontWeight: 'bold' }}>({modelCounts[modelName] || 0})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ width: '130px' }}>
              <input
                type="number"
                placeholder="Min. €"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
              />
            </div>
            <span style={{ color: '#4b5563', fontSize: '14px' }}>līdz</span>
            <div style={{ width: '130px' }}>
              <input
                type="number"
                placeholder="Maks. €"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
              />
            </div>
            {(search || minPrice || maxPrice) && (
              <button
                onClick={() => { setSearch(''); setMinPrice(''); setMaxPrice(''); }}
                style={{ padding: '10px 14px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {filteredCars.map((car) => {
                const totalModelCount = car.model ? modelCounts[car.model.trim()] || 0 : 0
                return (
                  <Link key={car.id} href={`/auto/${car.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <div style={{ height: '160px', backgroundColor: '#f3f4f6' }}>
                        {car.image ? <img src={car.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>Nav attēla</div>}
                      </div>
                      <div style={{ padding: '14px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 6px 0' }}>
                          {car.make} {car.model} <span style={{ color: '#6b7280', fontWeight: 'normal', fontSize: '14px' }}>({totalModelCount})</span>
                        </h2>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>{car.year} g. {car.engine ? `• ${car.engine}` : ''}</p>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>€{car.price}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Reklāma */}
        <div style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '20px' }}>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Globālais baneris šeit!<br/><span style={{ fontSize: '12px' }}>(Pielāgots reģionam)</span></p>
          </div>
        </div>

      </div>
    </div>
  )
}
