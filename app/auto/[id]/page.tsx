'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { canUseDevPreviewFallback, getAdaptedPreviewCarById, isPreviewListing } from '../../../lib/previewFallback'

const FAVORITES_STORAGE_KEY = 'temauto-favorite-car-ids'

const COUNTRY_FLAG_CODES: Record<string, string> = {
  Latvija: 'lv',
  Lietuva: 'lt',
  Igaunija: 'ee',
  Vācija: 'de',
  Lielbritānija: 'gb',
  ASV: 'us',
  Japāna: 'jp',
  Krievija: 'ru',
  Zviedrija: 'se',
  Norvēģija: 'no',
  Polija: 'pl',
  Somija: 'fi',
  Dānija: 'dk',
  Francija: 'fr',
  Itālija: 'it',
  Spānija: 'es',
  Nīderlande: 'nl',
  Ķīna: 'cn',
  Dienvidkoreja: 'kr',
  'Apvienotie Arābu Emirāti': 'ae',
  Kanāda: 'ca',
  Austrālija: 'au'
}

const getCountryFlagCode = (country: string, storedCode?: string) => {
  const normalizedStoredCode = storedCode?.trim().toLowerCase()
  if (normalizedStoredCode && /^[a-z]{2}$/.test(normalizedStoredCode)) return normalizedStoredCode
  return COUNTRY_FLAG_CODES[country] || ''
}

export default function AutoLapa() {
  const params = useParams()
  const id = params?.id

  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState<string>('')
  const [activeImageRatio, setActiveImageRatio] = useState(16 / 9)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [imageZoom, setImageZoom] = useState(1)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 })

  const [showPhone, setShowPhone] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [showVin, setShowVin] = useState(false)
  const [showSocialDropdown, setShowSocialDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const imageFrameRatioLocked = useRef(false)
  const imageTouchStart = useRef<{ x: number; y: number } | null>(null)
  const imageSwipeHandled = useRef(false)
  const viewerGesture = useRef<{
    mode: 'pinch' | 'pan'
    distance: number
    zoom: number
    x: number
    y: number
    panX: number
    panY: number
  } | null>(null)

  useEffect(() => {
    imageFrameRatioLocked.current = false
    setActiveImageRatio(16 / 9)
  }, [id])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user.id ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!id) return
    try {
      const savedFavoriteIds = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]')
      setIsFavorite(Array.isArray(savedFavoriteIds) && savedFavoriteIds.map(String).includes(String(id)))
    } catch {
      setIsFavorite(false)
    }
  }, [id])

  const toggleFavorite = () => {
    if (!id) return

    let savedFavoriteIds: string[] = []
    try {
      const storedValue = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]')
      if (Array.isArray(storedValue)) {
        savedFavoriteIds = storedValue.map(String)
      }
    } catch {
      savedFavoriteIds = []
    }

    const normalizedId = String(id)
    const nextFavoriteIds = savedFavoriteIds.includes(normalizedId)
      ? savedFavoriteIds.filter(savedId => savedId !== normalizedId)
      : [...savedFavoriteIds, normalizedId]

    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavoriteIds))
    setIsFavorite(nextFavoriteIds.includes(normalizedId))
  }

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
        setImagePan({ x: 0, y: 0 })
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
  if (car?.image_url && !allImages.includes(car.image_url)) allImages.push(car.image_url)
  if (Array.isArray(car?.images)) {
    car.images.forEach((img: string) => {
      if (img && !allImages.includes(img)) allImages.push(img)
    })
  }

  const activeImageFrameWidth = `min(100%, ${Math.round(360 * activeImageRatio)}px)`
  const activeImageIndex = Math.max(0, allImages.indexOf(activeImage))
  const imageCount = Math.max(1, allImages.length)

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

  const handleImageTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    imageTouchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null
    imageSwipeHandled.current = false
  }

  const handleImageTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = imageTouchStart.current
    const touch = event.changedTouches[0]
    imageTouchStart.current = null

    if (!start || !touch) return

    const distanceX = touch.clientX - start.x
    const distanceY = touch.clientY - start.y

    if (Math.abs(distanceX) < 45 || Math.abs(distanceX) <= Math.abs(distanceY)) return

    imageSwipeHandled.current = true
    if (distanceX < 0) {
      handleNextImage()
    } else {
      handlePrevImage()
    }

    window.setTimeout(() => {
      imageSwipeHandled.current = false
    }, 0)
  }

  const handleViewerTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length >= 2) {
      const first = event.touches[0]
      const second = event.touches[1]
      const distance = Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY)
      const rect = event.currentTarget.getBoundingClientRect()
      const midpointX = (first.clientX + second.clientX) / 2
      const midpointY = (first.clientY + second.clientY) / 2

      setZoomOrigin({
        x: ((midpointX - rect.left) / rect.width) * 100,
        y: ((midpointY - rect.top) / rect.height) * 100
      })
      viewerGesture.current = {
        mode: 'pinch',
        distance,
        zoom: imageZoom,
        x: midpointX,
        y: midpointY,
        panX: imagePan.x,
        panY: imagePan.y
      }
      return
    }

    if (event.touches.length === 1 && imageZoom > 1) {
      const touch = event.touches[0]
      viewerGesture.current = {
        mode: 'pan',
        distance: 0,
        zoom: imageZoom,
        x: touch.clientX,
        y: touch.clientY,
        panX: imagePan.x,
        panY: imagePan.y
      }
    }
  }

  const handleViewerTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const gesture = viewerGesture.current
    if (!gesture) return

    event.preventDefault()

    if (gesture.mode === 'pinch' && event.touches.length >= 2) {
      const first = event.touches[0]
      const second = event.touches[1]
      const distance = Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY)
      const nextZoom = Math.min(4, Math.max(1, gesture.zoom * (distance / Math.max(1, gesture.distance))))
      setImageZoom(nextZoom)
      if (nextZoom === 1) setImagePan({ x: 0, y: 0 })
      return
    }

    if (gesture.mode === 'pan' && event.touches.length === 1 && imageZoom > 1) {
      const touch = event.touches[0]
      setImagePan({
        x: gesture.panX + touch.clientX - gesture.x,
        y: gesture.panY + touch.clientY - gesture.y
      })
    }
  }

  const handleViewerTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 0) {
      viewerGesture.current = null
      return
    }

    if (event.touches.length === 1 && imageZoom > 1) {
      const touch = event.touches[0]
      viewerGesture.current = {
        mode: 'pan',
        distance: 0,
        zoom: imageZoom,
        x: touch.clientX,
        y: touch.clientY,
        panX: imagePan.x,
        panY: imagePan.y
      }
    }
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
    <>
      <style>{`
        [data-listing-mobile-titlebar="true"],
        [data-listing-year-favorite="true"] {
          display: none;
        }

        @media (max-width: 767px) {
          [data-listing-year-favorite="true"] {
            display: inline-flex !important;
          }
          [data-listing-mobile-titlebar="true"] {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1001;
            width: 100%;
            height: 48px;
            padding: 0 20px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            background: #0f172a;
            color: #ffffff;
          }

          [data-listing-mobile-titlebar="true"] strong {
            position: absolute;
            left: 20px;
            top: 8px;
            z-index: 1002;
            width: calc(100% - 158px);
            min-width: 0;
            max-height: 42px;
            display: -webkit-box;
            overflow: hidden;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            white-space: normal;
            font-size: 17px;
            line-height: 21px;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
          }

          [data-listing-home-logo="true"] {
            position: static;
            flex: 0 0 54px;
            width: 54px;
            height: 32px;
            margin-left: auto;
            margin-right: 8px;
            transform: rotate(-3deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            text-decoration: none;
            -webkit-tap-highlight-color: transparent;
          }

          [data-listing-home-logo="true"]:active {
            transform: rotate(-3deg) scale(0.94);
          }

          [data-listing-mobile-views="true"] {
            flex: 0 0 50px;
            min-width: 50px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 5px;
            font-size: 14px;
            font-weight: 700;
          }

          [data-listing-detail-layout="true"] {
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 16px 16px !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 16px !important;
            overflow: visible !important;
          }

          [data-listing-detail-header="true"] {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 1000 !important;
            width: 100% !important;
            height: 48px !important;
            min-height: 48px !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            display: flex !important;
            align-items: center !important;
            box-shadow: none !important;
          }

          [data-listing-detail-gallery="true"] {
            order: 1;
            position: fixed;
            top: 48px;
            left: 0;
            z-index: 900;
            width: 100vw !important;
            max-width: none !important;
            min-width: 0 !important;
            margin: 0 !important;
            background: #f3f4f6;
          }

          [data-listing-gallery-actions="true"],
          [data-listing-gallery-info="true"],
          [data-listing-thumbnails="true"] {
            display: none !important;
          }

          [data-listing-main-photo="true"] {
            width: 100% !important;
            max-width: none !important;
            max-height: none !important;
            aspect-ratio: 16 / 9 !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }

          [data-listing-main-photo="true"] > img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center !important;
          }

          [data-listing-detail-data="true"] {
            order: 2;
            width: 100% !important;
            min-width: 0 !important;
            margin-top: calc(56.25vw + 48px) !important;
            gap: 0 !important;
          }

          [data-listing-location-card="true"],
          [data-listing-price-card="true"] {
            display: none !important;
          }

          [data-listing-specifications="true"] {
            padding: 3px 16px !important;
            gap: 0 !important;
            font-size: 14px !important;
            border-radius: 10px !important;
          }

          [data-listing-specifications="true"] > div {
            min-height: 32px;
            padding: 3px 0 !important;
            box-sizing: border-box;
            align-items: center;
          }

          [data-listing-specifications="true"] > [data-listing-compact-location="true"] {
            display: flex !important;
            padding: 3px 8px !important;
            margin: 2px -8px 0;
            border-radius: 7px;
            background-color: #f0fdf4;
          }

          [data-listing-specifications="true"] > div:last-child {
            border-bottom: none !important;
          }

          [data-listing-specifications="true"] > div > span:last-child,
          [data-listing-specifications="true"] > div > div:last-child {
            text-align: right;
          }

          [data-listing-contacts="true"] {
            margin-top: 12px;
          }

          [data-listing-detail-description="true"] {
            order: 3;
            width: 100% !important;
            height: auto !important;
            min-height: 240px !important;
          }

          [data-listing-detail-sponsors="true"] {
            order: 4;
            width: 100% !important;
            height: auto !important;
            gap: 0 !important;
          }

          [data-listing-detail-sponsors="true"] > aside:first-child {
            min-height: 300px !important;
            flex: none !important;
          }

          [data-listing-detail-sponsors="true"] > aside:nth-child(2) {
            display: none !important;
          }
        }
      `}</style>
      <div data-listing-mobile-titlebar="true">
        <strong>{car.make} {car.model}</strong>
        <Link
          href="/"
          data-listing-home-logo="true"
          aria-label="Atgriezties TemAuto sākumlapā"
          title="Uz sākumlapu"
        >
          <svg
            viewBox="0 0 64 32"
            width="58"
            height="30"
            role="img"
            aria-hidden="true"
          >
            <path
              d="M5 21.5 C8 20.8 8.8 16.4 11.7 14.3 C14 12.7 18.1 13 21 12.4 C24.4 8.1 27.4 6.7 33.3 6.8 C40.8 6.9 43.3 7.8 47.6 13.2 C52.4 14.2 56.5 15.8 59 18.1 C60.2 19.2 59.8 21 58.7 22"
              fill="none"
              stroke="#16a34a"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.8 22.2 C13.5 23.1 20.4 22.7 27.6 22.8 C37.8 23 48.8 22.4 58.2 22.2"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M6.7 20.5 C10.4 18.9 9.8 15.5 13.1 13.7 M22 11.5 C26.1 7.4 29 7.2 34 7.4 C42 7.5 43.7 9.1 47 13.7"
              fill="none"
              stroke="#4ade80"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.9"
            />
            <circle cx="16" cy="23" r="3.6" fill="#0f172a" stroke="#f8fafc" strokeWidth="2.1" />
            <circle cx="49" cy="23" r="3.6" fill="#0f172a" stroke="#f8fafc" strokeWidth="2.1" />
            <path
              d="M25.5 11.8 C29.8 11.1 35.2 11.2 39.7 12 M32.9 11.8 C32.5 15 32.3 18.3 31.8 21.2"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.6"
              strokeLinecap="round"
            />
            <path
              d="M26.2 12.5 C30.3 11.8 35.5 11.9 39 12.5"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.9"
            />
          </svg>
        </Link>
        <span data-listing-mobile-views="true" aria-label={`Skatījumi: ${car.views ?? 0}`}>
          <span aria-hidden="true">👁️</span>
          <span>{car.views ?? 0}</span>
        </span>
      </div>
      <div data-listing-detail-layout="true" style={{ width: 'calc(100% - 40px)', maxWidth: '1320px', height: 'calc(100dvh - 100px)', margin: '20px auto 0', padding: 0, fontFamily: 'sans-serif', display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr) 240px', gridTemplateRows: 'auto minmax(0, 1fr)', columnGap: '24px', rowGap: '0', overflow: 'hidden', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'contents' }}>
        
        {/* KREISAIS STABIŅŠ */}
        <div data-listing-detail-data="true" style={{ gridColumn: '1', gridRow: '1', width: '320px', minHeight: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Valsts un Pilsēta */}
          {(car.country || car.city) && (
            <div data-listing-location-card="true" style={{ backgroundColor: '#f0fdf4', padding: '12px 16px', borderRadius: '10px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <span style={{ color: '#166534', fontWeight: 'bold' }}>{car.country || 'Latvija'}</span>
              <span style={{ color: '#166534', fontWeight: 'bold' }}>{car.city || car.region || ''}</span>
            </div>
          )}

          {/* Cena */}
          <div data-listing-price-card="true" style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a', letterSpacing: '0.5px' }}>
              {formatPrice(car.price)}
            </span>
          </div>

          {/* Pārējie dati */}
          <div data-listing-specifications="true" style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {car.year && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                <span style={{ color: '#111827', fontSize: '17px', fontWeight: '800' }}>{car.year}</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    data-listing-year-favorite="true"
                    aria-pressed={isFavorite}
                    onClick={toggleFavorite}
                    style={{
                      display: 'none',
                      alignItems: 'center',
                      padding: '5px 8px',
                      borderRadius: '14px',
                      border: isFavorite ? '1px solid rgba(255,255,255,0.75)' : '1px solid rgba(17,24,39,0.18)',
                      backgroundColor: isFavorite ? 'rgba(21,128,61,0.92)' : 'rgba(255,255,255,0.86)',
                      color: isFavorite ? '#ffffff' : '#374151',
                      fontFamily: 'inherit',
                      fontSize: '11px',
                      fontWeight: isFavorite ? '700' : '600',
                      lineHeight: 1,
                      boxShadow: '0 1px 5px rgba(0,0,0,0.20)',
                      transform: 'rotate(-2deg)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Mans favorīts
                  </button>
                </div>
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

            <div
              data-listing-compact-location="true"
              style={{ display: 'none', justifyContent: 'space-between', borderBottom: 'none' }}
            >
              <span style={{ color: '#166534', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '7px' }}>
                {getCountryFlagCode(car.country || '', car.country_code) && (
                  <img
                    src={`https://flagcdn.com/w40/${getCountryFlagCode(car.country || '', car.country_code)}.png`}
                    alt={`${car.country || 'Valsts'} karogs`}
                    style={{ width: '22px', height: '15px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                  />
                )}
                <span>{car.country || '–'}</span>
              </span>
              <span style={{ color: '#166534', fontWeight: 'bold' }}>{car.region || car.city || '–'}</span>
            </div>
          </div>

          {/* Kontakti */}
          <div data-listing-contacts="true" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
        <div data-listing-detail-gallery="true" style={{ gridColumn: '2', gridRow: '1', width: '100%', maxWidth: '750px', minWidth: 0 }}>
          
          <div data-listing-gallery-actions="true" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back()
                } else {
                  window.location.assign('/')
                }
              }}
              style={{ color: '#2563eb', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}
            >
              ← Atpakaļ uz sarakstu
            </button>
            {!isPreviewListing(car) && Boolean(car.user_id) && car.user_id === currentUserId && (
              <div>
                <Link href={`/auto/${id}/edit`} style={{ padding: '6px 14px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', display: 'inline-block' }}>
                  ✏️ Rediģēt
                </Link>
              </div>
            )}
          </div>

          <div data-listing-gallery-info="true" style={{ width: activeImageFrameWidth, margin: '0 auto' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#111827' }}>
              {car.make} {car.model}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', color: '#6b7280', fontSize: '13px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {car.created_at && (
                  <span>📅 Publicēts: {new Date(car.created_at).toLocaleDateString('lv-LV')}</span>
                )}
                <span>👁️ Skatījumi: <strong>{car.views ?? 0}</strong></span>
              </div>
              <button
                type="button"
                aria-pressed={isFavorite}
                onClick={toggleFavorite}
                style={{
                  flexShrink: 0,
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  color: isFavorite ? '#15803d' : '#9ca3af',
                  fontFamily: 'inherit',
                  fontSize: '12px',
                  fontWeight: isFavorite ? '700' : '500',
                  cursor: 'pointer'
                }}
              >
                Mans favorīts
              </button>
            </div>
          </div>

          {activeImage && (
            <div
              data-listing-main-photo="true"
              onTouchStart={handleImageTouchStart}
              onTouchEnd={handleImageTouchEnd}
              style={{ position: 'relative', width: activeImageFrameWidth, aspectRatio: String(activeImageRatio), maxHeight: '360px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f3f4f6', margin: '0 auto 8px', touchAction: 'pan-y' }}
            >
              <img
                src={activeImage}
                alt={`${car.make} ${car.model}`}
                onLoad={(event) => {
                  const image = event.currentTarget
                  if (!imageFrameRatioLocked.current && image.naturalWidth > 0 && image.naturalHeight > 0) {
                    setActiveImageRatio(image.naturalWidth / image.naturalHeight)
                    imageFrameRatioLocked.current = true
                  }
                }}
                onClick={() => {
                  if (imageSwipeHandled.current) return
                  setImageZoom(1)
        setImagePan({ x: 0, y: 0 })
                  setZoomOrigin({ x: 50, y: 50 })
                  setIsImageViewerOpen(true)
                }}
                title="Atvērt foto pilnekrānā"
                style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'zoom-in' }}
              />
              
              <div
                data-image-position="true"
                aria-label={`Foto ${activeImageIndex + 1} no ${imageCount}`}
                style={{
                  position: 'absolute',
                  left: '10px',
                  bottom: '10px',
                  zIndex: 20,
                  padding: '6px 10px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(0, 0, 0, 0.78)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '700',
                  lineHeight: 1,
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.35)',
                  pointerEvents: 'none'
                }}
              >
                {activeImageIndex + 1}/{imageCount}
              </div>
              
              {car.price !== null && car.price !== undefined && car.price !== '' && (
                <div
                  data-listing-photo-price="true"
                  aria-label={`Cena: ${formatPrice(car.price)}`}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    bottom: '10px',
                    zIndex: 20,
                    color: '#111827',
                    fontSize: '20px',
                    fontWeight: '800',
                    lineHeight: 1,
                    WebkitTextStroke: '1px rgba(255, 255, 255, 0.98)',
                    paintOrder: 'stroke fill',
                    textShadow: '-1px -1px 0 rgba(255,255,255,0.9), 1px -1px 0 rgba(255,255,255,0.9), -1px 1px 0 rgba(255,255,255,0.9), 1px 1px 0 rgba(255,255,255,0.9)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {formatPrice(car.price)}
                </div>
              )}

            </div>
          )}

          {allImages.length > 1 && (
            <div data-listing-thumbnails="true" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingBottom: '2px' }}>
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
        <div data-listing-detail-sponsors="true" style={{ gridColumn: '3', gridRow: '1 / span 2', width: '240px', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
        <div data-listing-detail-description="true" style={{ gridColumn: '1 / 3', gridRow: '2', height: '100%', minHeight: 0, backgroundColor: '#f9fafb', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
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
        setImagePan({ x: 0, y: 0 })
          }}
          style={{ position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: 'rgba(0, 0, 0, 0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleViewerTouchStart}
            onTouchMove={handleViewerTouchMove}
            onTouchEnd={handleViewerTouchEnd}
            onTouchCancel={() => { viewerGesture.current = null }}
            onWheel={(event) => {
              event.preventDefault()
              const rect = event.currentTarget.getBoundingClientRect()
              setZoomOrigin({
                x: ((event.clientX - rect.left) / rect.width) * 100,
                y: ((event.clientY - rect.top) / rect.height) * 100
              })
              setImageZoom((current) => Math.min(4, Math.max(1, current + (event.deltaY < 0 ? 0.25 : -0.25))))
            }}
            style={{ position: 'relative', width: '100vw', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', touchAction: 'none' }}
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
              style={{ maxWidth: '92vw', maxHeight: '88dvh', objectFit: 'contain', transform: `translate3d(${imagePan.x}px, ${imagePan.y}px, 0) scale(${imageZoom})`, transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`, transition: 'transform 120ms ease-out', cursor: imageZoom > 1 ? 'zoom-out' : 'zoom-in', userSelect: 'none' }}
            />

            <button
              type="button"
              aria-label="Aizvērt foto"
              onClick={() => {
                setIsImageViewerOpen(false)
                setImageZoom(1)
        setImagePan({ x: 0, y: 0 })
              }}
              style={{ position: 'absolute', top: '18px', right: '22px', width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.45)', backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '28px', lineHeight: 1, cursor: 'pointer' }}
            >
              ×
            </button>

            <div style={{ position: 'absolute', left: '50%', bottom: '20px', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '24px', backgroundColor: 'rgba(0,0,0,0.68)', color: '#fff' }}>
              <button type="button" aria-label="Samazināt" onClick={() => setImageZoom((current) => Math.max(1, current - 0.25))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.45)', background: 'transparent', color: '#fff', fontSize: '22px', cursor: 'pointer' }}>−</button>
              <span style={{ minWidth: '52px', textAlign: 'center', fontSize: '14px' }}>{Math.round(imageZoom * 100)}%</span>
              <button type="button" aria-label="Palielināt" onClick={() => setImageZoom((current) => Math.min(4, current + 0.25))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.45)', background: 'transparent', color: '#fff', fontSize: '22px', cursor: 'pointer' }}>+</button>
            </div>
          </div>
        </div>
      )}

      </div>
    </>
  )
}
