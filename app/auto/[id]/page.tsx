'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import Header from '../../components/Header'

export default function AutoLapa() {
  const params = useParams()
  const id = params?.id

  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState<string>('')

  useEffect(() => {
    if (!id) return

    async function fetchCarData() {
      await supabase.rpc('increment_view', { car_id: id })

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
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: '#fff' }}>
        <Header />
        <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>Ielādē datus...</div>
      </div>
    )
  }

  if (!car) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: '#fff' }}>
        <Header />
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <h2>Sludinājums netika atrasts!</h2>
          <Link href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>Atpakaļ uz sarakstu</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: '#fff', paddingBottom: '40px' }}>
      <Header />

      <div style={{ maxWidth: '1250px', margin: '30px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        
        {/* Atpakaļ poga */}
        <div style={{ marginBottom: '16px' }}>
          <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>
            ← Atpakaļ uz sarakstu
          </Link>
        </div>

        {/* GALVENAIS DIVU KOLONNU IZKĀRTOJUMS */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* KREISAIS STABIŅŠ: Visi dati un izceltie kontakti */}
          <div style={{ width: '320px', flexShrink: 0, backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '20px' }}>
            
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4ade80', marginBottom: '20px', borderBottom: '1px solid #374151', paddingBottom: '12px' }}>
              {car.price ? `€${car.price}` : 'Cena nav norādīta'}
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Galvenie dati
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Izlaiduma gads:</span>
                <span style={{ fontWeight: '600', color: '#fff' }}>{car.year || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Motors:</span>
                <span style={{ fontWeight: '600', color: '#fff' }}>{car.engine || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Ātrumkārba:</span>
                <span style={{ fontWeight: '600', color: '#fff' }}>{car.transmission || car.gearbox || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Krāsa:</span>
                <span style={{ fontWeight: '600', color: '#fff' }}>{car.color || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Virsbūves tips:</span>
                <span style={{ fontWeight: '600', color: '#fff' }}>{car.body_type || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Nobraukums:</span>
                <span style={{ fontWeight: '600', color: '#fff' }}>{car.mileage ? `${car.mileage} km` : 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Tehniskā apskate:</span>
                <span style={{ fontWeight: '600', color: '#fff' }}>{car.tech_inspection || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                <span style={{ color: '#9ca3af' }}>VIN kods:</span>
                <span style={{ fontWeight: '600', color: '#fff', fontSize: '12px', background: '#111827', padding: '2px 6px', borderRadius: '4px' }}>{car.vin || 'N/A'}</span>
              </div>
            </div>

            {/* Kontakti izcelti stabiņā */}
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Kontaktinformācija
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {car.phone && (
                <a href={`tel:${car.phone}`} style={{ padding: '12px', backgroundColor: '#065f46', border: '1px solid #10b981', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', textAlign: 'center', display: 'block', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  📞 {car.phone}
                </a>
              )}
              {car.email && (
                <a href={`mailto:${car.email}`} style={{ padding: '12px', backgroundColor: '#1e40af', border: '1px solid #3b82f6', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', textAlign: 'center', display: 'block', wordBreak: 'break-all', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  ✉️ {car.email}
                </a>
              )}
            </div>

          </div>

          {/* LABETAIS STABIŅŠ: Nosaukums, dati virs bildes, bilde, mazās bildes un apraksts */}
          <div style={{ flex: 1, minWidth: 0 }}>
            
            {/* Augšdaļa virs bildes: Marka/Modelis, datums, skatījumi un poga Rediģēt */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', gap: '16px', color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>
                  {car.created_at && (
                    <span>📅 Publicēts: {new Date(car.created_at).toLocaleDateString('lv-LV')}</span>
                  )}
                  <span>👁️ Skatījumi: <strong>{car.views ?? 0}</strong></span>
                </div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: '#fff' }}>
                  {car.brand || car.make} {car.model}
                </h1>
              </div>

              <Link href={`/auto/${id}/edit`} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ✏️ Rediģēt
              </Link>
            </div>

            {/* Lielā bilde ar bultiņām */}
            {activeImage && (
              <div style={{ position: 'relative', width: '100%', height: '420px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000', marginBottom: '12px', border: '1px solid #374151' }}>
                <img src={activeImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                
                {allImages.length > 1 && (
                  <>
                    <button onClick={handlePrevImage} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ❮
                    </button>
                    <button onClick={handleNextImage} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ❯
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Mazās bildes (galerija) */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
                {allImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    onClick={() => setActiveImage(img)}
                    style={{ width: '84px', height: '64px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: activeImage === img ? '3px solid #22c55e' : '1px solid #374151', opacity: activeImage === img ? 1 : 0.7 }}
                  />
                ))}
              </div>
            )}

            {/* Apraksts apakšā */}
            {car.description && (
              <div style={{ backgroundColor: '#1f2937', border: '1px solid #374151', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#fff' }}>Apraksts</h3>
                <p style={{ color: '#d1d5db', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>{car.description}</p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  )
}
