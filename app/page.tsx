'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Kļūda ielādējot auto:', error.message)
      } else {
        setCars(data || [])
      }
    } catch (err) {
      console.error('Negaidīta kļūda:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Auto Tirgus</h1>

      {loading ? (
        <p>Ielādē sludinājumus...</p>
      ) : cars.length === 0 ? (
        <p>Nav atrasts neviens sludinājums.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {cars.map((car) => (
            <Link 
              key={car.id} 
              href={`/auto/${car.id}`} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: '#fff', cursor: 'pointer' }}>
                {car.image && (
                  <img 
                    src={car.image} 
                    alt={`${car.make} ${car.model}`} 
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
                  />
                )}
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{car.make} {car.model}</h3>
                  <p style={{ margin: '0 0 5px 0', color: '#666' }}>Gads: {car.year}</p>
                  <p style={{ margin: '0', fontWeight: 'bold', color: '#0070f3' }}>Cena: {car.price} €</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
