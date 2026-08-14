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

export default function AutoDetalizeti() {
  const params = useParams()
  const router = useRouter()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
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

  const handleDelete = async () => {
    if (!confirm('Vai tiešām vēlies dzēst šo sludinājumu?')) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      alert('Sludinājums izdzēsts!')
      router.push('/')
      router.refresh()
    } catch (err: any) {
      alert('Kļūda dzēšot: ' + err.message)
      setDeleting(false)
    }
  }

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

  // Savācam visās iespējamās bilžu saites
  let allImages: string[] = []
  if (car.images && Array.isArray(car.images) && car.images.length > 0) {
    allImages = car.images.filter(img => typeof img === 'string' && img.trim() !== '')
  }
  if (allImages.length === 0 && car.image && typeof car.image === 'string' && car.image.trim() !== '') {
    allImages = [car.image]
  }

  const currentImage = allImages[activeImageIndex] || null

  return (
    <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/" style={{ color: '#64748b', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block', fontWeight: 'bold' }}>
        ← Atpakaļ uz sludinājumiem
      </Link>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        
        {/* Attēlu galerija */}
        <div style={{ width: '100%', height: '400px', backgroundColor: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', position: 'relative' }}>
          {currentImage ? (
            <img 
              src={currentImage} 
              alt={car.title} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => {
                // Ja bildes saite nedarbojas, parādām to lietotājam
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  const errorDiv = document.createElement('div')
                  errorDiv.style.padding = '1rem'
                  errorDiv.style.textAlign = 'center'
                  errorDiv.style.color = '#ef4444'
                  errorDiv.innerHTML = `<strong>Neizdevās ielādēt attēlu!</strong><br/><span style="font-size:12px; color:#64748b; word-break:break-all;">Saites URL: ${currentImage}</span>`
                  parent.appendChild(errorDiv)
                }
              }}
            />
          ) : (
            <div style={{ color: '#64748b', fontWeight: 'bold' }}>Šim sludinājumam nav pievienots neviens attēls</div>
          )}
        </div>

        {/* Mazās bildītes ja ir vairākas */}
        {allImages.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                style={{
                  border: activeImageIndex === idx ? '2px solid #22c55e' : '2px solid transparent',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  padding: 0,
                  backgroundColor: 'transparent',
                  width: '80px',
                  height: '60px',
                  flexShrink: 0
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#0f172a' }}>{car.title}</h1>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#22c55e', margin: 0 }}>
              €{car.price ? car.price.toLocaleString() : '0'}
            </p>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              padding: '0.625rem 1rem',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: deleting ? 'not-allowed' : 'pointer',
            }}
          >
            {deleting ? 'Dzēš...' : 'Dzēst sludinājumu'}
          </button>
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
