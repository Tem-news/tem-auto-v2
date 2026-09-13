'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { canUseDevPreviewFallback, getAdaptedPreviewCarById, isPreviewListing } from '../../../lib/previewFallback'

export default function AutoLapa() {
  const params = useParams()
  const id = params?.id

  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState<string>('')
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [imageZoom, setImageZoom] = useState(1)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })

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
    if (!isImageViewerOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsImageViewerOpen(false)
        setImageZoom(1)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isImageViewerOpen])

  useEffect(() => {
    if (!id) return

    async function fetchCarData() {
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (!carError && carData) {
        await supabase.rpc('increment_view', { car_id: id })
        setCar(carData)
        const mainImg = carData.image || (carData.images && carData.images[0]) || ''
        setActiveImage(mainImg)
      } else if (canUseDevPreviewFallback()) {
        const previewCar = getAdaptedPreviewCarById(String(id))
        if (previewCar) {
          setCar(previewCar)
          const mainImg = previewCar.image || (previewCar.images && previewCar.images[0]) || ''
          setActiveImage(mainImg)
        }
      } else if (carError) {
        console.error('Kļūda ielādējot auto:', carError)
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
        <Link href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>Atpakaļ uz sarakstu</Link>
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
    <div style={{ width: 'calc(100% - 40px)', maxWidth: '1320px', height: 'calc(100dvh - 100px)', margin: '20px auto 0', padding: 0, fontFamily: 'sans-serif', display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr) 240px', gridTemplateRows: 'auto minmax(0, 1fr)', columnGap: '24px', rowGap: '16px', overflow: 'hidden', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'contents' }}>
        
        {/* KREISAIS STABIŅŠ */}
        <div style={{ gridColumn: '1', gridRow: '1', width: '320px', minHeight: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
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
            {car.steering_wheel && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>Stūre:</span>
                <span style={{ color: '#111827', fontWeight: 'bold' }}>{car.steering_wheel}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
              <span style={{ color: '#6b7280', fontWeight: '500' }}>Salons:</span>
              <span style={{ color: '#111827', fontWeight: 'bold' }}>{car.interior_color || '–'}</span>
            </div>
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
        <div style={{ gridColumn: '2', gridRow: '1', width: '100%', maxWidth: '750px', minWidth: 0 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingTop: '4px' }}>
            <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}>
              ← Atpakaļ uz sarakstu
            </Link>
            {!isPreviewListing(car) && (
              <div>
                <Link href={`/auto/${id}/edit`} style={{ padding: '6px 14px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', display: 'inline-block' }}>
                  ✏️ Rediģēt
                </Link>
              </div>
            )}
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
              <img
                src={activeImage}
                alt={`${car.make} ${car.model}`}
                onClick={() => {
                  setImageZoom(1)
                  setZoomOrigin({ x: 50, y: 50 })
                  setIsImageViewerOpen(true)
                }}
                title="Atvērt foto pilnekrānā"
                style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'zoom-in' }}
              />
              
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingBottom: '2px' }}>
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

        {/* LABĀ MALA: divi vienādi, gari platformā integrēti sponsoru lauki */}
        <div style={{ gridColumn: '3', gridRow: '1 / span 2', width: '240px', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2].map((placement) => (
            <aside
              key={placement}
              aria-label="Sponsora vieta"
              style={{ width: '100%', minHeight: 0, flex: '1 1 0', boxSizing: 'border-box', border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#6b7280', fontSize: '13px' }}
            >
              <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>SPONSORS</span>
              <span>Vieta sadarbības partnerim</span>
            </aside>
          ))}
        </div>

      </div>

      {/* APAKŠĒJĀ DAĻA: APRAKSTS (Optimizēts, nepārsniedz monitora robežas) */}
      {car.description && (
        <div style={{ gridColumn: '1 / 3', gridRow: '2', height: '100%', minHeight: 0, backgroundColor: '#f9fafb', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#111827', flexShrink: 0 }}>Apraksts</h3>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
            <p style={{ color: '#374151', lineHeight: '1.6', fontSize: '14px', whiteSpace: 'pre-line', margin: 0 }}>{car.description}</p>
          </div>
        </div>
      )}

      {isImageViewerOpen && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto pilnekrāna skatītājs"
          onClick={() => {
            setIsImageViewerOpen(false)
            setImageZoom(1)
          }}
          style={{ position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: 'rgba(0, 0, 0, 0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            onWheel={(event) => {
              event.preventDefault()
              const rect = event.currentTarget.getBoundingClientRect()
              setZoomOrigin({
                x: ((event.clientX - rect.left) / rect.width) * 100,
                y: ((event.clientY - rect.top) / rect.height) * 100
              })
              setImageZoom((current) => Math.min(4, Math.max(1, current + (event.deltaY < 0 ? 0.25 : -0.25))))
            }}
            style={{ position: 'relative', width: '100vw', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
          >
            <img
              src={activeImage}
              alt={`${car.make} ${car.model}`}
              draggable={false}
              onDoubleClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect()
                setZoomOrigin({
                  x: ((event.clientX - rect.left) / rect.width) * 100,
                  y: ((event.clientY - rect.top) / rect.height) * 100
                })
                setImageZoom((current) => current === 1 ? 2 : 1)
              }}
              style={{ maxWidth: '92vw', maxHeight: '88dvh', objectFit: 'contain', transform: `scale(${imageZoom})`, transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`, transition: 'transform 120ms ease-out', cursor: imageZoom > 1 ? 'zoom-out' : 'zoom-in', userSelect: 'none' }}
            />

            <button
              type="button"
              aria-label="Aizvērt foto"
              onClick={() => {
                setIsImageViewerOpen(false)
                setImageZoom(1)
              }}
              style={{ position: 'absolute', top: '18px', right: '22px', width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.45)', backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '28px', lineHeight: 1, cursor: 'pointer' }}
            >
              ×
            </button>

            {allImages.length > 1 && (
              <>
                <button type="button" aria-label="Iepriekšējais foto" onClick={() => { handlePrevImage(); setImageZoom(1) }} style={{ position: 'absolute', left: '22px', top: '50%', transform: 'translateY(-50%)', width: '48px', height: '48px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>❮</button>
                <button type="button" aria-label="Nākamais foto" onClick={() => { handleNextImage(); setImageZoom(1) }} style={{ position: 'absolute', right: '22px', top: '50%', transform: 'translateY(-50%)', width: '48px', height: '48px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>❯</button>
              </>
            )}

            <div style={{ position: 'absolute', left: '50%', bottom: '20px', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '24px', backgroundColor: 'rgba(0,0,0,0.68)', color: '#fff' }}>
              <button type="button" aria-label="Samazināt" onClick={() => setImageZoom((current) => Math.max(1, current - 0.25))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.45)', background: 'transparent', color: '#fff', fontSize: '22px', cursor: 'pointer' }}>−</button>
              <span style={{ minWidth: '52px', textAlign: 'center', fontSize: '14px' }}>{Math.round(imageZoom * 100)}%</span>
              <button type="button" aria-label="Palielināt" onClick={() => setImageZoom((current) => Math.min(4, current + 0.25))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.45)', background: 'transparent', color: '#fff', fontSize: '22px', cursor: 'pointer' }}>+</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
