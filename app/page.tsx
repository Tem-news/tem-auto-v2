'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase' // Ja pamatlapā app/page.tsx, tad parādi '../lib/supabase'

interface Car {
  id: number
  title: string
  price: number
  year: number
  mileage: string
  engine: string
  image?: string
  images?: string[]
}

export default function AutoSaraksts() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCars() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('Kļūda iegūstot sludinājumus:', error)
      } else {
        setCars(data || [])
      }
      setLoading(false)
    }

    fetchCars()
  }, [])

  // Funkcija, kas atrod un atgriež pirmo pieejamo bildi
  const getDisplayImage = (car: Car) => {
    // 1. Pārbaudām pamata `image` lauku
    if (car.image && car.image.trim() !== '') {
      return car.image
    }
    // 2. Ja `image` nav, ņemam pirmo no `images` masīva
    if (car.images && Array.isArray(car.images) && car.images.length > 0) {
      const firstExtra = car.images[0]
      if (firstExtra && firstExtra.trim() !== '') {
        return firstExtra
      }
    }
    return null
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <p>Ielādē sludinājumus...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>TemAuto Sludinājumi</h1>
        <Link
          href="/auto/new"
          style={{
            padding: '10px 18px',
            backgroundColor: '#28a745',
            color: '#fff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          ➕ Pievienot sludinājumu
        </Link>
      </div>

      {cars.length === 0 ? (
        <p>Pagaidām nav pievienots neviens sludinājums.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {cars.map((car) => {
            const displayImg = getDisplayImage(car)

            return (
              <div
                key={car.id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ height: '180px', width: '100%', backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
                  {displayImg ? (
                    <img
                      src={displayImg}
                      alt={car.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                      Nav attēla
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{car.title}</h3>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745', marginBottom: '12px' }}>
                    {car.price} €
                  </div>

                  <div style={{ fontSize: '14px', color: '#555', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                    <div><strong>Gads:</strong> {car.year}</div>
                    <div><strong>Nobraukums:</strong> {car.mileage}</div>
                    <div><strong>Dzinējs:</strong> {car.engine}</div>
                  </div>

                  <Link
                    href={`/auto/${car.id}`}
                    style={{
                      marginTop: 'auto',
                      padding: '10px',
                      backgroundColor: '#0066cc',
                      color: '#fff',
                      textAlign: 'center',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    Apskatīt
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
