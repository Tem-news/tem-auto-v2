'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <p>Ielādē sludinājumu...</p>
      </div>
    )
  }

  if (!car) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <p>Sludinājums netika atrasts.</p>
        <Link href="/">← Atpakaļ uz sarakstu</Link>
      </div>
    )
  }

  // Apstrādājam bildes galerijai
  let imagesList: string[] = []
  if (car.images && Array.isArray(car.images) && car.images.length > 0) {
    imagesList = car.images
  } else if (car.image) {
    imagesList = [car.image]
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', color: '#333' }}>
      
      {/* Augšējā navigācija */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Atpakaļ uz sludinājumiem
        </Link>
      </div>

      {/* Virsraksts un Cena */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>{car.title || `${car.make} ${car.model}`}</h1>
        <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#2e7d32' }}>
          {car.price ? `${car.price} €` : 'Cena pēc vienošanās'}
        </span>
      </div>

      {/* Galvenā Bilde un Galerija */}
      {imagesList.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            width: '100%',
            height: '450px',
            backgroundColor: '#000',
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <img
              src={selectedImage || imagesList[0]}
              alt={car.title || 'Auto bildes'}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Maziņie attēli (Thumbnails) */}
          {imagesList.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              {imagesList.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(imgUrl)}
                  style={{
                    border: (selectedImage || imagesList[0]) === imgUrl ? '3px solid #0066cc' : '1px solid #ccc',
                    borderRadius: '6px',
                    padding: 0,
                    cursor: 'pointer',
                    background: 'none',
                    overflow: 'hidden',
                    width: '90px',
                    height: '60px',
                    flexShrink: 0
                  }}
                >
                  <img src={imgUrl} alt={`Foto ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Informācijas bloki */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        
        {/* Tehniskā specifikācija */}
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', border: '1px solid #e9ecef' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📋 Tehniskā specifikācija
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {car.make && <div><strong>Marka:</strong> {car.make}</div>}
            {car.model && <div><strong>Modelis:</strong> {car.model}</div>}
            <div><strong>Gads:</strong> {car.year || '-'}</div>
            <div><strong>Nobraukums:</strong> {car.mileage || '-'}</div>
            <div><strong>Dzinējs:</strong> {car.engine || '-'}</div>
            <div><strong>Degvielas tips:</strong> {car.fuel_type || car.fuelType || '-'}</div>
          </div>
        </div>

        {/* Kontakti */}
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', border: '1px solid #e9ecef' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📞 Pārdevēja kontakti
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ color: '#666', fontSize: '14px', display: 'block' }}>Tālrunis:</span>
              <strong style={{ fontSize: '18px', color: '#0066cc' }}>
                {car.phone ? car.phone : 'Tālruņa numurs nav norādīts'}
              </strong>
            </div>
            {car.location && (
              <div>
                <span style={{ color: '#666', fontSize: '14px', display: 'block' }}>Atrašanās vieta:</span>
                <strong>📍 {car.location}</strong>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Apraksta sekcija */}
      {car.description && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e9ecef', marginBottom: '30px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px' }}>📝 Apraksts</h3>
          <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', margin: 0, color: '#444' }}>
            {car.description}
          </p>
        </div>
      )}

      {/* Rediģēšanas poga */}
      <div style={{ marginTop: '20px' }}>
        <Link
          href={`/auto/${id}/edit`}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#ffc107',
            color: '#212529',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}
        >
          ✏️ Rediģēt sludinājumu
        </Link>
      </div>

    </div>
  )
}
