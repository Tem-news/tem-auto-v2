'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

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

  const getDisplayImage = (car: Car) => {
    if (car.image && car.image.trim() !== '') {
      return car.image
    }
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
              <Link
                key={car.id}
                href={`/auto/${car.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Attēls */}
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

                {/* Dati */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#111' }}>{car.title}</h3>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745', marginBottom: '12px' }}>
                    {car.price} €
                  </div>

                  <div style={{ fontSize: '14px', color: '#555', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                    <div><strong>Gads:</strong> {car.year}</div>
                    <div><strong>Nobraukums:</strong> {car.mileage}</div>
                    <div><strong>Dzinējs:</strong> {car.engine}</div>
                  </div>

                  {/* Vizuālā poga (tagad visa karte strādā kā saite) */}
                  <div
                    style={{
                      marginTop: 'auto',
                      padding: '10px',
                      backgroundColor: '#0066cc',
                      color: '#fff',
                      textAlign: 'center',
                      borderRadius: '6px',
                      fontWeight: 'bold'
                    }}
                  >
                    Apskatīt
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
