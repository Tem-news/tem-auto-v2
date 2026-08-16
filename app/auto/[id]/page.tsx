'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default function AutoLapa() {
  const params = useParams()
  const id = params?.id

  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')

  useEffect(() => {
    if (!id) return

    async function fetchCar() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Kļūda ielādējot datus:', error)
      } else if (data) {
        setCar(data)
        const mainImg = data.image || (data.images && data.images[0]) || ''
        setSelectedImage(mainImg)
      }
      setLoading(false)
    }

    fetchCar()
  }, [id])

  if (loading) {
    return <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Ielādē datus...</div>
  }

  if (!car) {
    return <div style={{ padding: '32px', textAlign: 'center', color: '#ef4444' }}>Auto netika atrasts!</div>
  }

  const allImages: string[] = []
  if (car.image) allImages.push(car.image)
  if (Array.isArray(car.images)) {
    car.images.forEach((img: string) => {
      if (img && !allImages.includes(img)) {
        allImages.push(img)
      }
    })
  }

  const currentIndex = allImages.indexOf(selectedImage)

  const handlePrev = () => {
    if (allImages.length === 0) return
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length
    setSelectedImage(allImages[prevIndex])
  }

  const handleNext = () => {
    if (allImages.length === 0) return
    const nextIndex = (currentIndex + 1) % allImages.length
    setSelectedImage(allImages[nextIndex])
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
        ← Atpakaļ uz sarakstu
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: 0, color: '#111827' }}>
            {car.make} {car.model} ({car.year})
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{car.location || 'Latvija'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>€ {car.price}</div>
          <Link
            href={`/auto/${id}/edit`}
            style={{ display: 'inline-block', marginTop: '8px', padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '6px', textDecoration: 'none', fontSize: '14px' }}
          >
            Rediģēt sludinājumu
          </Link>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: '100%', height: '450px', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {selectedImage ? (
            <img
              src={selectedImage}
              alt={`${car.make} ${car.model}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ color: '#9ca3af', width: '100%', textAlign: 'center' }}>Nav attēla</div>
          )}

          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '18px' }}
              >
                ❮
              </button>
              <button
                onClick={handleNext}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '18px' }}
              >
                ❯
              </button>
            </>
          )}
        </div>

        {allImages.length > 1 && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                style={{
                  border: selectedImage === img ? '3px solid #2563eb' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: 0,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  width: '90px',
                  height: '65px',
                  flexShrink: 0,
                  backgroundColor: '#fff'
                }}
              >
                <img src={img} alt="Sīktēls" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', paddingTop: '16px' }}>
        <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', marginTop: 0, color: '#1f2937' }}>Apraksts</h2>
          <p style={{ color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>
            {car.description || 'Apraksts nav pievienots.'}
          </p>
        </div>

        <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', marginTop: 0, borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', color: '#1f2937' }}>Specifikācija</h3>
          <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Nobraukums:</span> <strong>{car.mileage ? `${car.mileage} km` : '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Dzinējs:</span> <strong>{car.engine || '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Degviela:</span> <strong>{car.fuelType || '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tālrunis:</span> <strong>{car.phone || '-'}</strong></div>
          </div>
        </div>
      </div>
    </div>
  )
}
