'use client'

import { useEffect, useState } from 'react'
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

  const filteredCars = cars.filter((car) => {
    const fullTitle = `${car.make || ''} ${car.model || ''}`.toLowerCase()
    const matchesSearch = fullTitle.includes(search.toLowerCase())
    const carPrice = Number(car.price)
    const matchesMinPrice = minPrice ? carPrice >= Number(minPrice) : true
    const matchesMaxPrice = maxPrice ? carPrice <= Number(maxPrice) : true
    return matchesSearch && matchesMinPrice && matchesMaxPrice
  })

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '40px 20px', boxSizing: 'border-box' }}>
      
      {/* Centrālais bloks, kurš satur sarakstu un reklāmu un turas strikti vidū */}
      <div style={{ width: '100%', maxWidth: '1150px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        
        {/* Kreisā puse: Saraksts */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Auto Tirgus</h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '24px', alignItems: 'center' }}>
            <div style={{ flex: '1', minWidth: '180px' }}>
              <input
                type="text"
                placeholder="Meklēt pēc markas vai modeļa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
              />
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

        {/* Labā puse: Reklāma */}
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
