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

export default function Home() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCars() {
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Kļūda saņemot datus:', error)
        } else if (data) {
          setCars(data)
        }
      } catch (err) {
        console.error('Kļūda:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [])

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
            Atrodi savu nākamo auto
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1.1rem' }}>
            Lielākais lietoto un jauno automašīnu sludinājumu portāls
          </p>
        </div>
        <Link 
          href="/pievienot" 
          style={{ backgroundColor: '#22c55e', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          + Pievienot sludinājumu
        </Link>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem' }}>
        Jaunākie sludinājumi
      </h2>

      {loading ? (
        <p style={{ color: '#64748b' }}>Ielādē sludinājumus...</p>
      ) : cars.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '1rem' }}>Pašlaik nav pievienots neviens sludinājums.</p>
          <Link href="/pievienot" style={{ color: '#22c55e', fontWeight: 'bold', textDecoration: 'none' }}>
            Esi pirmais un pievieno auto!
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {cars.map((car) => {
            const imageUrl = car.images && car.images.length > 0 ? car.images[0] : car.image

            return (
              <Link 
                key={car.id} 
                href={`/auto/${car.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  <div style={{ height: '200px', width: '100%', overflow: 'hidden', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={car.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>Nav foto</span>
                    )}
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                      {car.title}
                    </h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e', margin: '0 0 1rem 0' }}>
                      €{car.price ? car.price.toLocaleString() : '0'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#475569' }}>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{car.year}. g.</span>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{car.mileage}</span>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{car.engine}</span>
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
