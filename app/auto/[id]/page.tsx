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

  // Stāvokļi datu maskēšanai
  const [showPhone, setShowPhone] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [showVin, setShowVin] = useState(false)

  // Stāvoklis sociālo tīklu izlecošajam logam un kopēšanai
  const [showSocialModal, setShowSocialModal] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const formatPrice = (price: number | string) => {
    if (!price) return 'Cena nav norādīta'
    const num = Number(price)
    if (isNaN(num)) return `${price} €`
    return `${num.toLocaleString('lv-LV')} €`
  }

  const maskPhone = (phone: string) => {
    if (phone.length <= 4) return '***'
    return phone.slice(0, 4) + '***' + phone.slice(-2)
  }

  const maskEmail = (email: string) => {
    const parts = email.split('@')
    if (parts.length !== 2) return '*****@*****'
    const name = parts[0]
    const maskedName = name.length > 2 ? name.slice(0, 2) + '***' : '***'
    return `${maskedName}@${parts[1]}`
  }

  const maskVin = (vin: string) => {
    if (vin.length <= 6) return '******'
    return vin.slice(0, 4) + '******' + vin.slice(-4)
  }

  const cleanPhone = car?.phone ? car.phone.replace(/\s+/g, '') : ''

  const handleCopyPhone = () => {
    if (!car?.phone) return
    navigator.clipboard.writeText(car.phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1250px', margin: '40px auto', padding: '0 20px', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontFamily: 'sans-serif' }}>
        Ielādē datus...
      </div>
    )
  }

  if (!car) {
    return (
      <div style={{ maxWidth: '1250px', margin: '40px auto', padding: '0 20px', minHeight: '600px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Sludinājums netika atrasts!</h2>
        <Link href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>Atpakaļ uz sarakstu</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1250px', height: 'calc(100vh - 40px)', margin: '20px auto', padding: '0 20px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
      
      {/* Augšējā daļa: 3 kolonnas (Pilnīgi nekustīgas, bez lēkāšanas) */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', justifyContent: 'center', flexShrink: 0, marginBottom: '16px' }}>
        
        {/* KREISAIS STABIŅŠ */}
        <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Cena */}
          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a', letterSpacing: '0.5px' }}>
              {formatPrice(car.price)}
            </span>
          </div>

          {/* Valsts un Pilsēta */}
          {(car.country || car.city) && (
            <div style={{ backgroundColor: '#f0fdf4', padding: '12px 16px', borderRadius: '10px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <span style={{ color: '#166534', fontWeight: 'bold' }}>{car.country || 'Latvija'}</span>
              <span style={{ color: '#166534', fontWeight: 'bold' }}>{car.city || car.region || ''}</span>
            </div>
          )}

          {/* Pārējie dati */}
          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {car.year && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>Izlaiduma gads:</span>
                <span style={{ color: '#111827', fontWeight: 'bold' }}>{car.year}</span>
              </div>
            )}
            {car.engine && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>Motors:</span>
                <span style={{ color: '#111827', fontWeight: 'bold' }}>{car.engine}</span>
              </div>
            )}
            {car.gearbox && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>Ātrumkārba:</span>
                <span style={{ color: '#111827', fontWeight: 'bold' }}>{car.gearbox}</span>
              </div>
            )}
            {car.color && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>Krāsa:</span>
                <span style={{ color: '#111827', fontWeight: 'bold' }}>{car.color}</span>
              </div>
            )}
            {car.body_type && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>Virsbūves tips:</span>
                <span style={{ color: '#111827', fontWeight: 'bold' }}>{car.body_type}</span>
              </div>
            )}
            {car.mileage && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>Nobraukums:</span>
                <span style={{ color: '#111827', fontWeight: 'bold' }}>{Number(car.mileage).toLocaleString('lv-LV')} km</span>
              </div>
            )}
            {car.tech_inspection && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>Tehniskā apskate:</span>
                <span style={{ color: '#111827', fontWeight: 'bold' }}>{car.tech_inspection}</span>
              </div>
            )}
            
            {/* VIN kods */}
            {car.vin && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>VIN kods:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#111827', fontWeight: 'bold', fontSize: '13px' }}>
                    {showVin ? car.vin : maskVin(car.vin)}
                  </span>
                  {!showVin && (
                    <button 
                      onClick={() => setShowVin(true)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '12px', padding: 0, textDecoration: 'underline' }}
                    >
                      Skatīt
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Kontakti */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {car.phone && (
              showPhone ? (
                <button 
                  onClick={() => setShowSocialModal(true)}
                  style={{ padding: '12px 16px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 'bold', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '14px', cursor: 'pointer' }}
                >
                  📞 {car.phone}
                </button>
              ) : (
                <button 
                  onClick={() => setShowPhone(true)}
                  style={{ padding: '12px 16px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 'bold', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '14px', cursor: 'pointer' }}
                >
                  📞 {maskPhone(car.phone)} (Parādīt)
                </button>
              )
            )}

            {car.email && (
              showEmail ? (
                <a href={`mailto:${car.email}`} style={{ padding: '12px 16px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', textAlign: 'center', wordBreak: 'break-all', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '14px' }}>
                  ✉️ {car.email}
                </a>
              ) : (
                <button 
                  onClick={() => setShowEmail(true)}
                  style={{ padding: '12px 16px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 'bold', textAlign: 'center', wordBreak: 'break-all', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '14px', cursor: 'pointer' }}
                >
                  ✉️ {maskEmail(car.email)} (Parādīt)
                </button>
              )
            )}
          </div>

        </div>

        {/* VIDĒJĀ DAĻA: Bildes un virsraksts */}
        <div style={{ flex: 1, maxWidth: '750px', minWidth: 0 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingTop: '4px' }}>
            <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}>
              ← Atpakaļ uz sarakstu
            </Link>
            <div>
              <Link href={`/auto/${id}/edit`} style={{ padding: '6px 14px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', display: 'inline-block' }}>
                ✏️ Rediģēt
              </Link>
            </div>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#111827' }}>
            {car.make} {car.model}
          </h1>

          <div style={{ display: 'flex', gap: '16px', color: '#6b7280', fontSize: '13px', marginBottom: '10px' }}>
            {car.created_at && (
              <span>📅 Publicēts: {new Date(car.created_at).toLocaleDateString('lv-LV')}</span>
            )}
            <span>👁️ Skatījumi: <strong>{car.views ?? 0}</strong></span>
          </div>

          {activeImage && (
            <div style={{ position: 'relative', width: '100%', height: '280px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f3f4f6', marginBottom: '8px' }}>
              <img src={activeImage} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {allImages.length > 1 && (
                <>
                  <button onClick={handlePrevImage} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ❮
                  </button>
                  <button onClick={handleNextImage} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ❯
                  </button>
                </>
              )}
            </div>
          )}

          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
              {allImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
                  onClick={() => setActiveImage(img)}
                  style={{ width: '65px', height: '48px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: activeImage === img ? '3px solid #2563eb' : '1px solid #d1d5db', opacity: activeImage === img ? 1 : 0.7 }}
                />
              ))}
            </div>
          )}

        </div>

        {/* LABĀ MALA: Reklāma */}
        <div style={{ width: '240px', flexShrink: '0' }}>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', textAlign: 'center', minHeight: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Ekskluzīvs baneris šeit!<br/><span style={{ fontSize: '12px' }}>(Maksimāla uzmanība)</span></p>
          </div>
        </div>

      </div>

      {/* APAKŠĒJĀ DAĻA: APRAKSTS AR MĪKSTU UN TĪRU IEKŠĒJO SKROLLĒŠANU */}
      {car.description && (
        <div style={{ backgroundColor: '#f9fafb', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#111827', flexShrink: 0 }}>Apraksts</h3>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
            <p style={{ color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>{car.description}</p>
          </div>
        </div>
      )}

      {/* SOCIĀLO TĪKLU IZLECOŠAIS LOGS */}
      {showSocialModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', width: '340px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', position: 'relative' }}>
            
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#111827' }}>Sazināties ar pārdevēju</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280', fontWeight: 'bold' }}>{car.phone}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '320px', overflowY: 'auto' }}>
              <a href={`tel:${cleanPhone}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: '#f3f4f6', color: '#111827', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '14px' }}>
                📞 Zvanīt parasto zvanu
              </a>
              <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: '#25D366', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                🟢 WhatsApp čats
              </a>
              <a href={`https://m.me/`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: '#0084FF', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                💙 Meta Messenger
              </a>
              <a href={`viber://chat?number=${cleanPhone}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: '#7360F2', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                🟣 Viber ziņa
              </a>
              <a href={`https://t.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: '#229ED9', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                ✈️ Telegram ziņa
              </a>
              <a href={`sms:${cleanPhone}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: '#4b5563', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                💬 Sūtīt SMS
              </a>
            </div>

            <button 
              onClick={handleCopyPhone}
              style={{ width: '100%', padding: '10px', backgroundColor: '#f0fdf4', border: '1px solid #16a34a', borderRadius: '8px', fontWeight: 'bold', color: '#16a34a', cursor: 'pointer', fontSize: '14px', marginBottom: '8px' }}
            >
              {copied ? '✅ Numurs nokopēts!' : '📋 Kopēt telefona numuru'}
            </button>

            <button 
              onClick={() => setShowSocialModal(false)}
              style={{ width: '100%', padding: '10px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: '#374151', cursor: 'pointer', fontSize: '14px' }}
            >
              Aizvērt
            </button>

          </div>
        </div>
      )}

    </div>
  )
}
