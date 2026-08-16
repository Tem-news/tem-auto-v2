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
  description?: string
  image?: string
  images?: string[]
  phone?: string
  location?: string
}

export default function AutoDetalizeti() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id

  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (!id) return

    async function fetchCar() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Kļūda ielādējot auto:', error)
      } else {
        setCar(data)
      }
      setLoading(false)
    }

    fetchCar()
  }, [id])

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <p>Ielādē auto datus...</p>
      </div>
    )
  }

  if (!car) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <h2>Sludinājums nav atrasts!</h2>
        <Link href="/" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Atgriezties uz sarakstu
        </Link>
      </div>
    )
  }

  // Apkopojam visus pieejamos attēlus
  const allImages: string[] = []
  if (car.image && car.image.trim() !== '') {
    allImages.push(car.image)
  }
  if (car.images && Array.isArray(car.images)) {
    car.images.forEach((img) => {
      if (img && img.trim() !== '' && !allImages.includes(img)) {
        allImages.push(img)
      }
    })
  }

  // Sagatavojam tīru tālruņa numuru priekš WhatsApp un zvanīšanas saites
  const cleanPhone = car.phone ? car.phone.replace(/[^0-9+]/g, '') : ''
  const formattedPhoneForWa = cleanPhone.startsWith('+') ? cleanPhone.replace('+', '') : cleanPhone.startsWith('371') ? cleanPhone : `371${cleanPhone}`

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Atpakaļ uz sludinājumiem
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>{car.title}</h1>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>{car.price} €</div>
      </div>

      {/* Attēlu galerija */}
      {allImages.length > 0 ? (
        <div style={{ marginBottom: '30px' }}>
          <div style={{ width: '100%', height: '420px', backgroundColor: '#f0f0f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
            <img
              src={allImages[activeImageIndex]}
              alt={car.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#111' }}
            />
          </div>

          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    border: activeImageIndex === idx ? '3px solid #0066cc' : '1px solid #ccc',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    padding: 0,
                    cursor: 'pointer',
                    width: '90px',
                    height: '60px',
                    flexShrink: 0
                  }}
                >
                  <img src={img} alt={`Attēls ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ width: '100%', height: '250px', backgroundColor: '#e0e0e0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', marginBottom: '30px' }}>
          Nav pievienotu attēlu
        </div>
      )}

      {/* Galvenais satura izkārtojums: Tehniskie dati un Kontakti */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
        {/* Tehniskā specifikācija */}
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '20px', backgroundColor: '#fafafa' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
            📋 Tehniskā specifikācija
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '15px' }}>
            <div><strong>Gads:</strong> {car.year}</div>
            <div><strong>Nobraukums:</strong> {car.mileage}</div>
            <div><strong>Dzinējs:</strong> {car.engine}</div>
            {car.location && <div><strong>Atrašanās vieta:</strong> {car.location}</div>}
          </div>
        </div>

        {/* Kontakti un saziņas pogas */}
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
            📞 Pārdevēja kontakti
          </h3>
          {car.phone ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                📱 {car.phone}
              </div>
              <a
                href={`tel:${cleanPhone}`}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: '#0066cc',
                  color: '#fff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                📞 Zvanīt pārdevējam
              </a>
              <a
                href={`https://wa.me/${formattedPhoneForWa}?text=${encodeURIComponent(`Sveiki! Interesē jūsu sludinājums: ${car.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: '#25D366',
                  color: '#fff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                💬 Rakstīt WhatsApp
              </a>
            </div>
          ) : (
            <p style={{ color: '#888', fontStyle: 'italic' }}>Tālruņa numurs nav norādīts.</p>
          )}
        </div>
      </div>

      {/* Apraksts */}
      {car.description && (
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '20px', marginBottom: '30px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Apraksts</h3>
          <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', color: '#333', margin: 0 }}>{car.description}</p>
        </div>
      )}

      {/* Rediģēšanas poga */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <Link
          href={`/auto/${car.id}/edit`}
          style={{
            padding: '10px 20px',
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
    </div>
  )
}
