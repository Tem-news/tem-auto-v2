'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default function AutoLapa() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id

  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState<string>('')

  const [showPhone, setShowPhone] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [showVin, setShowVin] = useState(false)
  const [showSocialDropdown, setShowSocialDropdown] = useState(false)
  const [copied, setCopied] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Aizver izkrītošo lodziņu, ja noklikšķina ārpus tā
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSocialDropdown(false)
      }
    }
    if (showSocialDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSocialDropdown])

  useEffect(() => {
    if (!id) return

    async function fetchCarData() {
      try {
        await supabase.rpc('increment_view', { car_id: id })
      } catch (e) {
        // Ignorējam kļūdu, ja funkcija datubāzē nav izveidota
      }

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

  // GUDRĀ ATPAKAĻ POGA: Pārbauda iepriekšējo lapu vai izmanto vēsturi
  const handleSmartBack = () => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer
      // Ja iepriekšējā lapa ir no mūsu pašu domēna un nav tukša
      if (referrer && referrer.includes(window.location.origin)) {
        router.push(referrer)
        return
      }
    }
    // Fallback uz standarta vēsturi, ja referrer nav pieejams
    router.back()
  }

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

  const formatPrice = (price: any) => {
    if (price === null || price === undefined || price === '') return 'Cena nav norādīta'
    const rawString = String(price)
    const matches = rawString.match(/\d+/g)
    if (!matches) return `${price} €`
    const numericPrice = Number(matches.join(''))
    if (isNaN(numericPrice)) return `${price} €`
    
    const formattedNum = numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    return `${formattedNum} €`
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
        <button onClick={handleSmartBack} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '16px' }}>Atpakaļ</button>
      </div>
    )
  }

  const getMileage = () => {
    if (car.mileage) return car.mileage
    if (car.noobraukums) return car.noobraukums
    if (car.km) return car.km
    
    if (car.description) {
      const match = car.description.match(/(\d[\d\s]*)\s*(?:km|nobraukums)/i)
      if (match) {
        const cleaned = match[1].replace(/\s+/g, '')
        if (!isNaN(Number(cleaned))) return cleaned
      }
    }
    return null
  }

  const finalMileage = getMileage()

  return (
    <div style={{ maxWidth: '1250px', margin: '20px auto', padding: '0 20px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', justifyContent: 'center', marginBottom: '16px' }}>
        
        {/* KREISAIS STABIŅŠ */}
        <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Valsts un Pilsēta */}
          {(car.country || car.city) && (
            <div style={{ backgroundColor: '#f0fdf4', padding: '12px 16px', borderRadius: '10px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <span style={{ color: '#166534', fontWeight: 'bold' }}>{car.country || 'Latvija'}</span>
              <span style={{ color: '#166534', fontWeight: 'bold' }}>{car.city || car.region || ''}</span>
            </div>
          )}

          {/* Cena */}
          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a', letterSpacing: '0.5px' }}>
              {formatPrice(car.price)}
            </span>
          </div>

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

            {/* Nobraukums */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
              <span style={{ color: '#6b7280', fontWeight: '500' }}>Nobraukums:</span>
              <span style={{ color: '#111827', fontWeight: 'bold' }}>
                {finalMileage ? `${Number(finalMileage).toLocaleString('lv-LV')} km` : 'Nav norādīts'}
              </span>
            </div>

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
            {car.tech_inspection && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>Tehniskā apskate:</span>
                <span style={{ color: '#111827', fontWeight: 'bold' }}>{car.tech_inspection}</span>
              </div>
            )}
            
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
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                {showPhone ? (
                  <button 
                    onClick={() => setShowSocialDropdown(!showSocialDropdown)}
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 'bold', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '14px', cursor: 'pointer' }}
                  >
                    📞 {car.phone}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPhone(true)}
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 'bold', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '14px', cursor: 'pointer' }}
                  >
                    📞 {maskPhone(car.phone)} (Parādīt)
                  </button>
                )}

                {/* Saziņas izlecošais logs */}
                {showSocialDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: '6px', backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 1000, border: '1px solid #e5e7eb', boxSizing: 'border-box' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#111827', textAlign: 'center' }}>Sazināties ar pārdevēju</h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280', fontWeight: 'bold', textAlign: 'center' }}>{car.phone}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      <a href={`tel:${cleanPhone}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: '#f3f4f6', color: '#111827', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '13px' }}>
                        📞 Zvanīt parasto zvanu
                      </a>
                      <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: '#25D366', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
                        🟢 WhatsApp čats
                      </a>
                      <a href={`https://m.me/`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: '#0084FF', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
                        💙 Meta Messenger
                      </a>
                      <a href={`viber://chat?number=${cleanPhone}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: '#7360F2', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
                        🟣 Viber ziņa
                      </a>
                      <a href={`https://t.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: '#229ED9', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
                        ✈️ Telegram ziņa
                      </a>
                      <a href={`sms:${cleanPhone}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: '#4b5563', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
                        💬 Sūtīt SMS
                      </a>
                    </div>

                    <button
                      onClick={handleCopyPhone}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#f0fdf4', border: '1px solid #16a34a', borderRadius: '8px', fontWeight: 'bold', color: '#16a34a', cursor: 'pointer', fontSize: '13px', marginBottom: '6px' }}
                    >
                      {copied ? '✅ Numurs nokopēts!' : '📋 Kopēt telefona numuru'}
                    </button>

                    <button
                      onClick={() => setShowSocialDropdown(false)}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: '#374151', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Aizvērt
                    </button>
                  </div>
                )}
              </div>
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
            <button 
              onClick={handleSmartBack} 
              style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', padding: 0, textAlign: 'left', fontWeight: 'normal' }}
            >
              ← Atpakaļ uz sarakstu
            </button>
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
            <div style={{ position: 'relative', width: '100%', height: '380px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={activeImage} alt={`${car.make} ${car.model}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              
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

      {/* APAKŠĒJĀ DAĻA: APRAKSTS */}
      {car.description && (
        <div style={{ backgroundColor: '#f9fafb', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', maxHeight: '280px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#111827', flexShrink: 0 }}>Apraksts</h3>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
            <p style={{ color: '#374151', lineHeight: '1.6', fontSize: '14px', whiteSpace: 'pre-line', margin: 0 }}>{car.description}</p>
          </div>
        </div>
      )}

    </div>
  )
}
