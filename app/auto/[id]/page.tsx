'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export default function AutoDetailsPage() {
  const params = useParams()
  const id = params?.id

  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (id) {
      fetchCarDetails()
    }
  }, [id])

  const fetchCarDetails = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Kļūda ielādējot auto datus:', error)
      } else {
        setCar(data)
      }
    } catch (err) {
      console.error('Negaidīta kļūda:', err)
    } finally {
      setLoading(false)
    }
  }

  const cleanPhone = car?.phone ? car.phone.replace(/\D/g, '') : ''
  const cleanParentNumber = (phoneStr: string) => {
    return phoneStr ? phoneStr.replace(/\D/g, '') : ''
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', fontSize: '16px', color: '#6b7280' }}>
        Notiek datu ielāde...
      </div>
    )
  }

  if (!car) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h2 style={{ fontSize: '20px', color: '#111827', marginBottom: '12px' }}>Automašīna netika atrasta</h2>
        <Link href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>Atgriezties sākumlapā</Link>
      </div>
    )
  }

  const engineDisplay = [car.volume, car.engine].filter(Boolean).join(' ') || 'Nav norādīts'

  // Formats skaitļiem ar atstarpi tūkstošiem (piem., 3600 -> 3 600)
  const formatNumberWithSpaces = (value: number) => {
    if (!value && value !== 0) return '-'
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const images = car.images && car.images.length > 0 
    ? car.images 
    : (car.image_url ? [car.image_url] : ['/placeholder.png'])

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', boxSizing: 'border-box' }}>
      
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ fontSize: '14px', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
          ← Atpakaļ uz sludinājumu sarakstu
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            {car.make} {car.model} {car.year}
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            {car.country}{car.region ? `, ${car.region}` : ''}
          </p>
        </div>
        {/* Cena ar atdalītiem tūkstošiem un € zīmi */}
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>
          {car.price ? `${formatNumberWithSpaces(car.price)} €` : 'Cena nav norādīta'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', alignItems: 'start' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '100%', height: '450px', backgroundColor: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <img 
              src={images[activeImageIndex]} 
              alt={`${car.make} ${car.model}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {images.map((imgUrl: string, idx: number) => (
                <div 
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{ 
                    width: '80px', 
                    height: '60px', 
                    borderRadius: '6px', 
                    overflow: 'hidden', 
                    cursor: 'pointer', 
                    border: activeImageIndex === idx ? '2px solid #2563eb' : '1px solid #d1d5db',
                    flexShrink: 0 
                  }}
                >
                  <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
            Galvenie parametri
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Marka:</span>
              <span style={{ fontWeight: '500', color: '#111827' }}>{car.make || '-'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Modelis:</span>
              <span style={{ fontWeight: '500', color: '#111827' }}>{car.model || '-'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Izlaiduma gads:</span>
              <span style={{ fontWeight: '500', color: '#111827' }}>{car.year || '-'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Motors:</span>
              <span style={{ fontWeight: '500', color: '#111827' }}>{engineDisplay}</span>
            </div>

            {/* Nobraukums (km) novietots zem Motors un virs Ātrumkārbas */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Nobraukums:</span>
              <span style={{ fontWeight: '500', color: '#111827' }}>
                {car.mileage ? `${formatNumberWithSpaces(car.mileage)} km` : '-'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Ātrumkārba:</span>
              <span style={{ fontWeight: '500', color: '#111827' }}>{car.gearbox || '-'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Virsbūves tips:</span>
              <span style={{ fontWeight: '500', color: '#111827' }}>{car.body_type || '-'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Krāsa:</span>
              <span style={{ fontWeight: '500', color: '#111827' }}>{car.color || '-'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Tehniskā apskate:</span>
              <span style={{ fontWeight: '500', color: '#111827' }}>{car.tech_inspection || '-'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
              <span style={{ color: '#6b7280' }}>VIN kods:</span>
              <span style={{ fontWeight: '500', color: '#111827', fontSize: '13px' }}>{car.vin || '-'}</span>
            </div>

          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#111827' }}>Kontakti</h4>
            {car.phone && <p style={{ margin: '4px 0', fontSize: '13.5px', color: '#374151' }}>Tālrunis: <strong>{car.phone}</strong></p>}
            {car.email && <p style={{ margin: '4px 0', fontSize: '13.5px', color: '#374151' }}>E-pasts: <strong>{car.email}</strong></p>}

            {car.phone && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                <a href={`viber://chat?number=${cleanParentNumber(cleanPhone)}`} style={{ fontSize: '13px', color: '#7c3aed', textDecoration: 'none', fontWeight: '500' }}>
                  💬 Viber ziņa
                </a>
                <a href={`https://t.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                  ✈️ Telegram ziņa
                </a>
              </div>
            )}
          </div>

        </div>

      </div>

      {car.description && (
        <div style={{ marginTop: '32px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginTop: 0, marginBottom: '12px' }}>
            Apraksts
          </h3>
          <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>
            {car.description}
          </p>
        </div>
      )}

    </div>
  )
}
