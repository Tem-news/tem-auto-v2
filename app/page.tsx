'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

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

export default function Home() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCars() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('Kļūda ielādējot sludinājumus:', error)
      } else if (data) {
        setCars(data)
      }
      setLoading(false)
    }

    fetchCars()
  }, [])

  // Palīgfunkcija korektas bildes saites iegūšanai
  const getCarImage = (car: Car) => {
    if (car.images && Array.isArray(car.images) && car.images.length > 0 && car.images[0]) {
      return car.images[0]
    }
    if (car.image && typeof car.image === 'string' && car.image.trim() !== '') {
      return car.image
    }
    return null
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Ielādē sludinājumus...</div>
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Jaunākie sludinājumi</h1>
        <Link 
          href="/pievienot" 
          style={{ 
            backgroundColor: '#22c55e', 
            color: '#ffffff', 
            padding: '0.75rem 1.25rem', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
          }}
        >
          + Pievienot sludinājumu
        </Link>
      </div>

      {cars.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
          Pašlaik nav neviena sludinājuma. Būss pirmais, kas tādu pievieno!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {cars.map((car) => {
            const imageUrl = getCarImage(car)

            return (
              <Link 
                key={car.id} 
                href={`/auto/${car.id}`} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div 
                  style={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 4px -1px rgba(0,0,0,0.06)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ width: '100%', height: '200px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={car.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold' }}>Nav foto</span>
                    )}
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#0f172a' }}>{car.title}</h2>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#22c55e', margin: '0 0 1rem 0' }}>
                      €{car.price ? car.price.toLocaleString() : '0'}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
                      <span>{car.year}. g.</span>
                      <span>•</span>
                      <span>{car.mileage}</span>
                      <span>•</span>
                      <span>{car.engine}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
