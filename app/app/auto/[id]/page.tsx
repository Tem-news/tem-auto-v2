'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

export default function AutoLapa() {
  const params = useParams()
  const router = useRouter()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState<string>('')

  useEffect(() => {
    async function fetchCar() {
      if (!params.id) return

      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Kļūda ielādējot auto:', error)
      } else if (data) {
        setCar(data)
        const allImages = data.images && data.images.length > 0 ? data.images : [data.image]
        if (allImages[0]) setActiveImage(allImages[0])
      }
      setLoading(false)
    }

    fetchCar()
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm('Vai tiešām vēlies dzēst šo sludinājumu?')) return

    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', params.id)

    if (error) {
      alert('Kļūda dzēšot: ' + error.message)
    } else {
      alert('Sludinājums izdzēsts!')
      router.push('/')
      router.refresh()
    }
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Ielādē sludinājumu...</div>
  if (!car) return <div style={{ padding: '2rem', textAlign: 'center' }}>Sludinājums netika atrasts.</div>

  const carImages = car.images && car.images.length > 0 ? car.images : (car.image ? [car.image] : [])

  return (
    <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/" style={{ color: '#64748b', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block', fontWeight: 'bold' }}>
        ← Atpakaļ uz sludinājumiem
      </Link>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        
        {/* Lielā bilde */}
        <div style={{ width: '100%', height: '400px', backgroundColor: '#e2e8f0', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          {activeImage ? (
            <img src={activeImage} alt={car.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>Nav foto</span>
          )}
        </div>

        {/* Mazās bildes (Galerija) */}
        {carImages.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
            {carImages.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`${car.title} ${idx}`}
                onClick={() => setActiveImage(img)}
                style={{ 
                  width: '80px', 
                  height: '60px', 
                  objectFit: 'cover', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  border: activeImage === img ? '2px solid #22c55e' : '2px solid transparent'
                }}
              />
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{car.title}</h1>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#22c55e', margin: '0.5rem 0' }}>€{car.price ? car.price.toLocaleString() : '0'}</p>
          </div>

          <button 
            onClick={handleDelete} 
            style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Dzēst sludinājumu
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.5rem 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Izlaiduma gads</span>
            <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{car.year}. gads</strong>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Nobraukums</span>
            <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{car.mileage}</strong>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block' }}>Motors</span>
            <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{car.engine}</strong>
          </div>
        </div>

      </div>
    </main>
  )
}
