'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Sakumlapa() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filtri
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    async function fetchCars() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Kļūda ielādējot auto:', error)
      } else {
        setCars(data || [])
      }
      setLoading(false)
    }

    fetchCars()
  }, [])

  // Filtrēšanas loģika
  const filteredCars = cars.filter((car) => {
    const fullTitle = `${car.make || ''} ${car.model || ''}`.toLowerCase()
    const matchesSearch = fullTitle.includes(search.toLowerCase())
    const matchesPrice = maxPrice ? Number(car.price) <= Number(maxPrice) : true

    return matchesSearch && matchesPrice
  })

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Augšējā josla */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Auto Tirgus</h1>
        <Link
          href="/pievienot"
          style={{
            padding: '10px 18px',
            backgroundColor: '#16a34a',
            color: '#fff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          + Pievienot auto
        </Link>
      </div>

      {/* Meklēšanas un Filtru josla */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Meklēt pēc markas vai modeļa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ width: '160px' }}>
          <input
            type="number"
            placeholder="Maks. cena (€)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
        </div>
        {(search || maxPrice) && (
          <button
            onClick={() => { setSearch(''); setMaxPrice(''); }}
            style={{ padding: '10px 14px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Notīrīt
          </button>
        )}
      </div>

      {/* Sludinājumu Saraksts */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Ielādē sludinājumus...</div>
      ) : filteredCars.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Nav atrasts neviens auto.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredCars.map((car) => (
            <Link
              key={car.id}
              href={`/auto/${car.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
              >
                <div style={{ height: '180px', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
                  {car.image ? (
                    <img src={car.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>Nav attēla</div>
                  )}
                </div>
                <div style={{ padding: '14px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#111827' }}>
                    {car.make} {car.model}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 10px 0' }}>
                    {car.year} g. {car.engine ? `• ${car.engine}` : ''}
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>
                    €{car.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
