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
  }, [params])

  const handleDelete = async () => {
    if (!confirm('Vai tiešām vēlies dzēst šo sludinājumu?')) return

    setDeleting(true)
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', params.id)

    if (error) {
      alert('Kļūda dzēšot sludinājumu: ' + error.message)
      setDeleting(false)
    } else {
      router.push('/auto')
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', textFont: 'sans-serif' }}>
        <p>Lādējas sludinājuma dati...</p>
      </div>
    )
  }

  if (!car) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <h2>Sludinājums nav atrasts!</h2>
        <Link href="/auto" style={{ color: '#0066cc', textDecoration: 'none' }}>
          ← Atpakaļ uz sludinājumiem
        </Link>
      </div>
    )
  }

  // Apvienojam galveno attēlu ar papildu attēlu masīvu (ja tādi ir)
  const allImages: string[] = []
  if (car.image) allImages.push(car.image)
  if (car.images && Array.isArray(car.images)) {
    car.images.forEach((img) => {
      if (img && !allImages.includes(img)) {
        allImages.push(img)
      }
    })
  }

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <Link href="/auto" style={{ color: '#0066cc', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
        ← Atpakaļ uz sludinājumiem
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>{car.title}</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            href={`/auto/${car.id}/edit`}
            style={{
              padding: '10px 18px',
              backgroundColor: '#28a745',
              color: '#fff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            ✏️ Rediģēt
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: '10px 18px',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: deleting ? 'not-allowed' : 'pointer'
            }}
          >
            {deleting ? 'Dzēš...' : '🗑️ Dzēst'}
          </button>
        </div>
      </div>

      {/* FOTO GALERIJA AR BULTIŅĀM */}
      {allImages.length > 0 ? (
        <div style={{ marginBottom: '30px' }}>
          <div style={{ position: 'relative', width: '100%', height: '480px', backgroundColor: '#f0f0f0', borderRadius: '10px', overflow: 'hidden' }}>
            <img
              src={allImages[activeImageIndex]}
              alt={`${car.title} - attēls ${activeImageIndex + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '15px',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  title="Iepriekšējais attēls"
                >
                  ❮
                </button>
                <button
                  onClick={handleNextImage}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '15px',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  title="Nākamais attēls"
                >
                  ❯
                </button>
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '15px',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '13px'
                }}>
                  {activeImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>

          {/* SĪKATTIĒLI (THUMBNAILS) */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', paddingBottom: '5px' }}>
              {allImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Sīkattēls ${idx + 1}`}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: '80px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: activeImageIndex === idx ? '3px solid #0066cc' : '2px solid transparent',
                    opacity: activeImageIndex === idx ? 1 : 0.7
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          width: '100%',
          height: '250px',
          backgroundColor: '#e9ecef',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6c757d',
          marginBottom: '30px'
        }}>
          Nav attēlu
        </div>
      )}

      {/* SLUDINĀJUMA INFORMĀCIJA */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '25px',
        borderRadius: '10px',
        border: '1px solid #e9ecef'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #dee2e6', paddingBottom: '10px' }}>
          Tehniskā informācija
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <span style={{ color: '#6c757d', fontSize: '14px', display: 'block' }}>Cena:</span>
            <strong style={{ fontSize: '22px', color: '#28a745' }}>{car.price} €</strong>
          </div>
          <div>
            <span style={{ color: '#6c757d', fontSize: '14px', display: 'block' }}>Izlaiduma gads:</span>
            <strong style={{ fontSize: '18px' }}>{car.year}</strong>
          </div>
          <div>
            <span style={{ color: '#6c757d', fontSize: '14px', display: 'block' }}>Nobraukums:</span>
            <strong style={{ fontSize: '18px' }}>{car.mileage}</strong>
          </div>
          <div>
            <span style={{ color: '#6c757d', fontSize: '14px', display: 'block' }}>Dzinējs:</span>
            <strong style={{ fontSize: '18px' }}>{car.engine}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
