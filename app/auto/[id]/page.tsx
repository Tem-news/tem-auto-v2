'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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

export default function CarDetails() {
  const params = useParams()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCar() {
      if (!params?.id) return

      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Kļūda iegūstot sludinājumu:', error)
      } else if (data) {
        setCar(data)

        // Apvienojam galveno bildi un papildu bildes vienā sarakstā
        const allImgs: string[] = []
        if (data.image) allImgs.push(data.image)
        if (data.images && Array.isArray(data.images)) {
          data.images.forEach((img: string) => {
            if (img && !allImgs.includes(img)) allImgs.push(img)
          })
        }

        if (allImgs.length > 0) {
          setSelectedImage(allImgs[0])
        }
      }
      setLoading(false)
    }

    fetchCar()
  }, [params])

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <p>Ielādē sludinājumu...</p>
      </div>
    )
  }

  if (!car) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <h2>Sludinājums nav atrasts.</h2>
        <Link href="/" style={{ color: '#0066cc' }}>← Atpakaļ uz sarakstu</Link>
      </div>
    )
  }

  // Apvienojam visas bildes priekšskatīšanai
  const allImages: string[] = []
  if (car.image) allImages.push(car.image)
  if (car.images && Array.isArray(car.images)) {
    car.images.forEach((img: string) => {
      if (img && !allImages.includes(img)) allImages.push(img)
    })
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#0066cc', textDecoration: 'none' }}>
          ← Atpakaļ uz sludinājumiem
        </Link>
        <Link
          href={`/auto/${car.id}/edit`}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffc107',
            color: '#000',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          ✏️ Rediģēt sludinājumu
        </Link>
      </div>

      <h1 style={{ marginBottom: '10px' }}>{car.title}</h1>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745', marginBottom: '20px' }}>
        {car.price} €
      </div>

      {/* Lielais izvēlētais attēls */}
      {selectedImage && (
        <div style={{ width: '100%', height: '420px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f0f0f0', marginBottom: '15px' }}>
          <img
            src={selectedImage}
            alt={car.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Papildu bilžu galerija (thumbnails) */}
      {allImages.length > 1 && (
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '25px' }}>
          {allImages.map((imgUrl, idx) => (
            <img
              key={idx}
              src={imgUrl}
              alt={`Bilde ${idx + 1}`}
              onClick={() => setSelectedImage(imgUrl)}
              style={{
                width: '90px',
                height: '65px',
                objectFit: 'cover',
                borderRadius: '6px',
                cursor: 'pointer',
                border: selectedImage === imgUrl ? '3px solid #0066cc' : '1px solid #ddd'
              }}
            />
          ))}
        </div>
      )}

      {/* Auto parametri */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', border: '1px solid #e9ecef' }}>
        <div><strong>Izlaiduma gads:</strong> {car.year}</div>
        <div><strong>Nobraukums:</strong> {car.mileage}</div>
        <div><strong>Dzinējs:</strong> {car.engine}</div>
      </div>
    </div>
  )
}
