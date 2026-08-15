'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

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

export default function AutoDetalizeti() {
  const params = useParams()
  const router = useRouter()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    async function fetchCar() {
      if (!params?.id) return

      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Kļūda iegūstot auto:', error)
      } else {
        setCar(data)
      }
      setLoading(false)
    }

    fetchCar()
  }, [params?.id])

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Ielādē sludinājumu...</div>
  }

  if (!car) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', textAlign: 'center' }}>
        <h2>Sludinājums nav atrasts!</h2>
        <Link href="/" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Atpakaļ uz sākumu
        </Link>
      </div>
    )
  }

  // Apkopojam visas bildes
  let allImages: string[] = []
  if (car.images && Array.isArray(car.images) && car.images.length > 0) {
    allImages = car.images.filter(img => typeof img === 'string' && img.trim() !== '')
  }
  if (allImages.length === 0 && car.image && typeof car.image === 'string' && car.image.trim() !== '') {
    allImages = [car.image]
  }

  const currentImage = allImages[activeImageIndex] || null

  // Pāreja uz iepriekšējo bildi
  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  // Pāreja uz nākamo bildi
  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Atpakaļ uz sludinājumiem
        </Link>

        {/* Pārvaldības poga īpašniekam / moderatoram */}
        <Link 
          href={`/auto/${car.id}/edit`}
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          ⚙️ Rediģēt sludinājumu / Pārvaldīt
        </Link>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        
        {/* Galvenais lielais attēls ar bultiņām */}
        <div style={{ width: '100%', height: '480px', backgroundColor: '#0f172a', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', position: 'relative' }}>
          
          {currentImage ? (
            <img 
              src={currentImage} 
              alt={car.title} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ color: '#94a3b8', fontWeight: 'bold' }}>Šim sludinājumam nav pievienots neviens attēls</div>
          )}

          {/* Navigācijas Bultiņas uz Pašas Bildes */}
          {allImages.length > 1 && (
            <>
              {/* Bultiņa pa kreisi */}
              <button
                onClick={handlePrevImage}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                  userSelect: 'none',
                }}
                title="Iepriekšējā bilde"
              >
                ‹
              </button>

              {/* Bultiņa pa labi */}
              <button
                onClick={handleNextImage}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                  userSelect: 'none',
                }}
                title="Nākamā bilde"
              >
                ›
              </button>

              {/* Bilžu skaitītājs bildes stūrī (piem. 2/5) */}
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 'bold'
              }}>
                {activeImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}

        </div>

        {/* Mazo attēlu josla (Thumbnails) */}
        {allImages.length > 1 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                style={{
                  border: activeImageIndex === idx ? '3px solid #22c55e' : '2px solid #e2e8f0',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  padding: 0,
                  backgroundColor: '#f8fafc',
                  width: '90px',
                  height: '65px',
                  flexShrink: 0,
                  opacity: activeImageIndex === idx ? 1 : 0.6,
                  transition: 'opacity 0.2s, border 0.2s'
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#0f172a' }}>{car.title}</h1>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#22c55e', margin: 0 }}>
            €{car.price ? car.price.toLocaleString() : '0'}
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.5rem 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b', display: 'block' }}>Izlaiduma gads</span>
            <strong style={{ fontSize: '1.125rem', color: '#0f172a' }}>{car.year}. gads</strong>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b', display: 'block' }}>Nobraukums</span>
            <strong style={{ fontSize: '1.125rem', color: '#0f172a' }}>{car.mileage}</strong>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b', display: 'block' }}>Motors</span>
            <strong style={{ fontSize: '1.125rem', color: '#0f172a' }}>{car.engine}</strong>
          </div>
        </div>

      </div>
    </main>
  )
}
