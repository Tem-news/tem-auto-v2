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
  const [activeImage, setActiveImage] = useState<string>('')

  useEffect(() => {
    if (!id) return

    async function fetchCarData() {
      // 1. Palielinām skatījumu skaitu
      await supabase.rpc('increment_view', { car_id: id })

      // 2. Ielādējam konkrēto auto
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single()

      if (carError) {
        console.error('Kļūda ielādējot auto:', carError)
      } else if (carData) {
        setCar(carData)
        const mainImg = carData.image || (carData.images && carData.images[0]) || ''
        setActiveImage(mainImg)
      }
      setLoading(false)
    }

    fetchCarData()
  }, [id])

  const allImages: string[] = []
  if (car?.image) allImages.push(car.image)
  if (Array.isArray(car?.images)) {
    car.images.forEach((img: string) => {
      if (img && !allImages.includes(img)) allImages.push(img)
    })
  }

  const handlePrevImage = () => {
    if (allImages.length <= 1) return
    const currentIndex = allImages.indexOf(activeImage)
    const newIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1
    setActiveImage(allImages[newIndex])
  }

  const handleNextImage = () => {
    if (allImages.length <= 1) return
    const currentIndex = allImages.indexOf(activeImage)
    const newIndex = currentIndex === allImages.length - 1 ? 0 : currentIndex + 1
    setActiveImage(allImages[newIndex])
  }

  if (loading) {
    return <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Ielādē datus...</div>
  }

  if (!car) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <h2>Sludinājums netika atrasts!</h2>
        <Link href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>Atpakaļ uz sarakstu</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1250px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      
      {/* Galvenais konteiners ar 3 kolonnām: Kreisais stabiņš (dati/kontakti), Vidus (bilde/apraksts), Labā mala (reklāma) */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', justifyContent: 'center' }}>
        
        {/* KREISAIS STABIŅŠ: Cena, Dati un Izcelti kontakti */}
        <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Cena */}
          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>
              {car.price ? `€${car.price}` : 'Cena nav norādīta'}
            </span>
          </div>

          {/* Datu stabiņš */}
          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ fontWeight: 'bold', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px', marginBottom: '4px' }}>Galvenie dati</div>
            {car.year && <div><strong>Izlaiduma gads:</strong> {car.year}</div>}
            {car.engine && <div><strong>Motors:</strong> {car.engine}</div>}
            {car.gearbox && <div><strong>Ātrumkārba:</strong> {car.gearbox}</div>}
            {car.color && <div><strong>Krāsa:</strong> {car.color}</div>}
            {car.body_type && <div><strong>Virsbūves tips:</strong> {car.body_type}</div>}
            {car.mileage && <div><strong>Nobraukums:</strong> {car.mileage} km</div>}
            {car.tech_inspection && <div><strong>Tehniskā apskate:</strong> {car.tech_inspection}</div>}
            {car.vin && <div><strong>VIN kods:</strong> {car.vin}</div>}
          </div>

          {/* Izcelti kontakti */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {car.phone && (
              <a href={`tel:${car.phone}`} style={{ padding: '12px 16px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                📞 {car.phone}
              </a>
            )}
            {car.email && (
              <a href={`mailto:${car.email}`} style={{ padding: '12px 16px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', textAlign: 'center', wordBreak: 'break-all', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                ✉️ {car.email}
              </a>
            )}
          </div>

        </div>

        {/* VIDĒJĀ DAĻA: Atpakaļ, Virsraksts, Bildes un Apraksts */}
        <div style={{ flex: 1, maxWidth: '750px', minWidth: 0 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
              ← Atpakaļ uz sarakstu
            </Link>
            <div>
              <Link href={`/auto/${id}/edit`} style={{ padding: '8px 14px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
                ✏️ Rediģēt
              </Link>
            </div>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#111827' }}>
            {car.make} {car.model}
          </h1>

          <div style={{ display: 'flex', gap: '16px', color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
            {car.created_at && (
              <span>📅 Publicēts: {new Date(car.created_at).toLocaleDateString('lv-LV')}</span>
            )}
            <span>👁️ Skatījumi: <strong>{car.views ?? 0}</strong></span>
          </div>

          {activeImage && (
            <div style={{ position: 'relative', width: '100%', height: '380px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f3f4f6', marginBottom: '12px' }}>
              <img src={activeImage} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {allImages.length > 1 && (
                <>
                  <button onClick={handlePrevImage} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ❮
                  </button>
                  <button onClick={handleNextImage} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ❯
                  </button>
                </>
              )}
            </div>
          )}

          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
              {allImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
                  onClick={() => setActiveImage(img)}
                  style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: activeImage === img ? '3px solid #2563eb' : '1px solid #d1d5db', opacity: activeImage === img ? 1 : 0.7 }}
                />
              ))}
            </div>
          )}

          {car.description && (
            <div style={{ marginTop: '20px', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>Apraksts</h3>
              <p style={{ color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>{car.description}</p>
            </div>
          )}

        </div>

        {/* LABĀ MALA: Reklāma */}
        <div style={{ width: '240px', flexShrink: 0, position: 'sticky', top: '20px' }}>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Ekskluzīvs baneris šeit!<br/><span style={{ fontSize: '12px' }}>(Maksimāla uzmanība)</span></p>
          </div>
        </div>

      </div>
    </div>
  )
}
