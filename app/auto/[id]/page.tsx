'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

function formatNumberWithSpace(value: number | string): string {
  if (!value && value !== 0) return ''
  const num = typeof value === 'number' ? value : Number(value.toString().replace(/\s/g, ''))
  if (isNaN(num)) return value.toString()
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function AutoDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id

  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')

  useEffect(() => {
    if (!id) return

    async function fetchCarDetails() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Kļūda ielādējot auto datus:', error)
      } else {
        setCar(data)
        // Ja auto ir vairāki attēli masīvā, iestatām pirmo kā noklusēto
        if (data?.images && data.images.length > 0) {
          setSelectedImage(data.images[0])
        } else if (data?.image_url) {
          setSelectedImage(data.image_url)
        }
      }
      setLoading(false)
    }

    fetchCarDetails()
  }, [id])

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'Arial, sans-serif', color: '#6b7280' }}>
        Ielādē auto informāciju...
      </div>
    )
  }

  if (!car) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h2 style={{ color: '#111827', marginBottom: '16px' }}>Auto nav atrasts</h2>
        <button 
          onClick={() => router.back()}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            backgroundColor: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          ← Atpakaļ
        </button>
      </div>
    )
  }

  // Savācam visus pieejamos attēlus (ja ir masīvs vai atsevišķs image_url)
  const allImages = car.images && car.images.length > 0 
    ? car.images 
    : car.image_url ? [car.image_url] : []

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
      
      {/* ATPAKAĻ POGA */}
      <button 
        onClick={() => router.back()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          marginBottom: '20px',
          cursor: 'pointer',
          backgroundColor: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#1f2937'
        }}
      >
        ← Atpakaļ
      </button>

      {/* Virsraksts un cena */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
            {car.make} {car.model}
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Izlaiduma gads: <strong>{car.year}</strong> | Atrašanās vieta: <strong>{car.country || car.valsts}, {car.region || car.regions}</strong>
          </p>
        </div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0369a1' }}>
          {formatNumberWithSpace(car.price)} €
        </div>
      </div>

      {/* Galvenais saturs: Attēli un Parametri */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', alignItems: 'start' }}>
        
        {/* Kreisā puse: Attēli */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '100%', height: '450px', backgroundColor: '#e5e7eb', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt={`${car.make} ${car.model}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '14px' }}>
                Nav pieejamu attēlu
              </div>
            )}
          </div>

          {/* Sīktēlu galerija, ja ir vairāk par 1 bildi */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {allImages.map((img: string, index: number) => (
                <div 
                  key={index} 
                  onClick={() => setSelectedImage(img)}
                  style={{ 
                    width: '90px', 
                    height: '65px', 
                    flexShrink: 0, 
                    borderRadius: '6px', 
                    overflow: 'hidden', 
                    cursor: 'pointer',
                    border: selectedImage === img ? '2px solid #0284c7' : '1px solid #d1d5db',
                    opacity: selectedImage === img ? 1 : 0.7
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

          {/* Apraksta sadala */}
          {car.description && (
            <div style={{ marginTop: '20px', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#111827' }}>Apraksts</h3>
              <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>
                {car.description}
              </p>
            </div>
          )}
        </div>

        {/* Labā puse: Tehniskie parametri */}
        <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
            Tehniskie dati
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280' }}>Dzinējs:</span>
            <span style={{ fontWeight: '600', color: '#111827' }}>{car.engine || car.dzinejs || 'Nav norādīts'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280' }}>Tilpums:</span>
            <span style={{ fontWeight: '600', color: '#111827' }}>{car.volume ? `${car.volume} L` : 'Nav norādīts'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280' }}>Ātrumkārba:</span>
            <span style={{ fontWeight: '600', color: '#111827' }}>{car.gearbox || car.atrumkarba || 'Nav norādīts'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280' }}>Virsbūves tips:</span>
            <span style={{ fontWeight: '600', color: '#111827' }}>{car.body_type || car.virsbuve || 'Nav norādīts'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280' }}>Krāsa:</span>
            <span style={{ fontWeight: '600', color: '#111827' }}>{car.color || car.krasa || 'Nav norādīts'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>Nobraukums:</span>
            <span style={{ fontWeight: '600', color: '#111827' }}>{car.mileage ? `${formatNumberWithSpace(car.mileage)} km` : 'Nav norādīts'}</span>
          </div>
        </div>

      </div>
    </div>
  )
}
