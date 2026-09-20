'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const formatPrice = (price: unknown) => {
  if (price === null || price === undefined || price === '') return '–'
  const number = Number(String(price).replace(/\s/g, ''))
  if (Number.isNaN(number)) return String(price)
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €'
}

function CabinetListingGallery({ images }: { images: string[] }) {
  const galleryRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const didSwipe = useRef(false)
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLooping = images.length > 1
  const loopImages = isLooping ? [images[images.length - 1], ...images, images[0]] : images

  const jumpTo = (left: number) => {
    const gallery = galleryRef.current
    if (!gallery) return
    gallery.style.scrollBehavior = 'auto'
    gallery.scrollLeft = left
    requestAnimationFrame(() => {
      gallery.style.scrollBehavior = ''
    })
  }

  useEffect(() => {
    if (!isLooping) return

    const placeOnFirstImage = () => {
      const gallery = galleryRef.current
      if (gallery?.clientWidth) jumpTo(gallery.clientWidth)
    }

    placeOnFirstImage()
    window.addEventListener('resize', placeOnFirstImage)
    return () => {
      window.removeEventListener('resize', placeOnFirstImage)
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current)
    }
  }, [isLooping, images.length])

  const handleScroll = () => {
    if (!isLooping || !galleryRef.current) return
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current)
    scrollEndTimer.current = setTimeout(() => {
      const gallery = galleryRef.current
      if (!gallery?.clientWidth) return
      const slide = Math.round(gallery.scrollLeft / gallery.clientWidth)
      if (slide === 0) jumpTo(images.length * gallery.clientWidth)
      if (slide === images.length + 1) jumpTo(gallery.clientWidth)
    }, 80)
  }

  return (
    <div
      ref={galleryRef}
      data-make-row-gallery="true"
      onScroll={handleScroll}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
        didSwipe.current = false
      }}
      onTouchMove={(event) => {
        const currentX = event.touches[0]?.clientX
        if (touchStartX.current !== null && currentX !== undefined && Math.abs(currentX - touchStartX.current) > 8) {
          didSwipe.current = true
        }
      }}
      onClickCapture={(event) => {
        if (didSwipe.current) {
          event.preventDefault()
          event.stopPropagation()
          didSwipe.current = false
        }
      }}
      style={{ width: '112px', height: '68px', overflow: 'hidden', borderRadius: '6px', backgroundColor: '#e5e7eb' }}
    >
      {loopImages.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={image}
          alt=""
          draggable={false}
          style={{ width: '112px', minWidth: '112px', height: '68px', objectFit: 'cover' }}
        />
      ))}
    </div>
  )
}

export default function KabinetsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadCabinet() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        sessionStorage.setItem('redirectAfterLogin', '/kabinets')
        router.replace('/login')
        return
      }

      setUser(session.user)

      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setErrorMessage('Neizdevās ielādēt tavus sludinājumus.')
      } else {
        setCars(data || [])
      }

      setLoading(false)
    }

    loadCabinet()
  }, [router])

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif', color: '#64748b' }}>Ielādē lietotāja kabinetu...</div>
  }

  return (
    <main data-cabinet-page="true" style={{ width: 'calc(100% - 40px)', maxWidth: '1100px', margin: '32px auto', fontFamily: 'sans-serif' }}>
      <style>{`
        @media (max-width: 767px) {
          [data-cabinet-page="true"] {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
          }

          [data-cabinet-panel="true"] {
            width: 100% !important;
            padding: 10px 0 16px !important;
            border-left: 0 !important;
            border-right: 0 !important;
            border-radius: 0 !important;
            box-sizing: border-box !important;
          }

          [data-cabinet-title="true"] {
            margin: 0 10px 10px !important;
          }

          [data-cabinet-list="true"] {
            width: 100% !important;
            max-width: none !important;
            margin-left: 0 !important;
            border-left: 0 !important;
            border-right: 0 !important;
            border-radius: 0 !important;
          }

          html[data-temauto-theme="night"] body:has([data-cabinet-page="true"]),
          html[data-temauto-theme="night"] [data-cabinet-page="true"] {
            background-color: #020617 !important;
          }

          html[data-temauto-theme="night"] [data-cabinet-page="true"] {
            min-height: calc(100vh - 58px) !important;
            color: #e5e7eb !important;
          }

          html[data-temauto-theme="night"] [data-cabinet-panel="true"] {
            background-color: #020617 !important;
            border-color: #334155 !important;
            box-shadow: none !important;
          }

          html[data-temauto-theme="night"] [data-cabinet-title="true"] {
            color: #f1f5f9 !important;
            background-color: #020617 !important;
          }

          html[data-temauto-theme="night"] [data-cabinet-list="true"] {
            background-color: #111827 !important;
            border-color: #334155 !important;
          }
        }
      `}</style>
      <section data-cabinet-panel="true" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        <h2 data-cabinet-title="true" style={{ margin: '0 0 16px', color: '#111827', fontSize: '18px' }}>
          Mani sludinājumi ({cars.length})
        </h2>

        {errorMessage ? (
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#b91c1c' }}>{errorMessage}</div>
        ) : cars.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
            Tev pašlaik nav neviena sludinājuma.
          </div>
        ) : (
          <div data-make-table="true" data-cabinet-list="true" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <div data-make-table-body="true" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {cars.map((car) => {
                const galleryImages = Array.from(new Set([
                  ...(Array.isArray(car.images) ? car.images : []),
                  car.image,
                  car.image_url
                ].filter((image): image is string => typeof image === 'string' && image.trim() !== '')))
                const engineType = car.engine || car.engine_type || car.fuel_type || car.fuel || car.dzinejs || car.degviela || ''
                const engineVolume = car.volume !== null && car.volume !== undefined && car.volume !== '' ? `${car.volume}L` : ''
                const engineSummary = [engineType, engineVolume].filter(Boolean).join(' ')

                return (
                  <div
                    key={car.id}
                    data-make-table-row="true"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '112px minmax(0, 1fr) 170px 110px',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '7px 10px',
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <Link href={`/auto/${car.id}`} data-cell="photo" aria-label={`Apskatīt ${car.make || ''} ${car.model || ''}`.trim()}>
                      {galleryImages.length > 0 ? (
                        <CabinetListingGallery images={galleryImages} />
                      ) : (
                        <div style={{ width: '112px', height: '68px', borderRadius: '6px', backgroundColor: '#e5e7eb' }} />
                      )}
                    </Link>

                    <div data-cell="car" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <Link href={`/auto/${car.id}`} style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1d4ed8', textDecoration: 'none', fontSize: '15px', fontWeight: '700' }}>
                        {car.make} {car.model}
                      </Link>
                      <Link
                        href={`/auto/${car.id}/edit`}
                        role="button"
                        style={{ flexShrink: 0, marginLeft: 'auto', color: '#2563eb', textDecoration: 'none', fontSize: '12px', fontWeight: '700' }}
                      >
                        Rediģēt
                      </Link>
                    </div>

                    <div data-cell="year" style={{ color: '#374151' }}>
                      <span>{car.year || '-'}</span>
                      {engineSummary && <span data-mobile-engine-summary="true">{engineSummary}</span>}
                    </div>

                    <div data-cell="price" style={{ textAlign: 'right', color: '#111827', fontSize: '15px', fontWeight: '700' }}>
                      {formatPrice(car.price)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
