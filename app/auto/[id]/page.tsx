'use client'

import { useEffect, useState } from 'react'
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
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return

    async function fetchCar() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Kļūda ielādējot auto:', error)
      } else if (data) {
        setCar(data)
        const mainImg = data.image || (data.images && data.images[0]) || ''
        setActiveImage(mainImg)
      }
      setLoading(false)
    }

    fetchCar()
  }, [id])

  // Dzēšanas funkcija
  const handleDelete = async () => {
    const confirmDelete = window.confirm('Vai tiešām vēlaties dzēst šo sludinājumu? Šo darbību nevar atcelt.')
    if (!confirmDelete) return

    setDeleting(true)
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id)

    setDeleting(false)

    if (error) {
      alert('Kļūda dzēšot sludinājumu: ' + error.message)
    } else {
      alert('Sludinājums veiksmīgi izdzēsts!')
      router.push('/')
      router.refresh()
    }
  }

  // Apvienojam visas bildes sarakstā galerijai
  const allImages: string[] = []
  if (car?.image) allImages.push(car.image)
  if (Array.isArray(car?.images)) {
    car.images.forEach((img: string) => {
      if (img && !allImages.includes(img)) allImages.push(img)
    })
  }

  // Funkcijas bilžu pārslēgšanai uz riņķi
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Augšējā navigācijas josla */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
          ← Atpakaļ uz sarakstu
        </Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href={`/auto/${id}/edit`}
            style={{
              padding: '8px 14px',
              backgroundColor: '#2563eb',
              color: '#fff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ✏️ Rediģēt
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: '8px 14px',
              backgroundColor: deleting ? '#9ca3af' : '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: deleting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {deleting ? 'Dzēš...' : '🗑️ Dzēst'}
          </button>
        </div>
      </div>

      {/* Galvenais divu kolonnu izkārtojums: Kreisajā pusē auto informācija, labajā - baneris */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Kreisā puse: Viss par auto */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 16px 0', color: '#111827' }}>
            {car.make} {car.model} {car.year ? `(${car.year})` : ''}
          </h1>

          {/* Lielais attēls ar bultciņām */}
          {activeImage && (
            <div style={{ position: 'relative', width: '100%', height: '380px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f3f4f6', marginBottom: '12px' }}>
              <img src={activeImage} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      fontSize: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ❮
                  </button>
                  <button
                    onClick={handleNextImage}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      fontSize: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ❯
                  </button>
                </>
              )}
            </div>
          )}

          {/* Mazie sīktēli */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
              {allImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
                  onClick={() => setActiveImage(img)}
                  style={{
                    width: '80px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: activeImage === img ? '3px solid #2563eb' : '1px solid #d1d5db',
                    opacity: activeImage === img ? 1 : 0.7
                  }}
                />
              ))}
            </div>
          )}

          {/* Auto parametri un cena / kontakti */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>{car.price ? `€${car.price}` : 'Cena nav norādīta'}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {car.phone && (
                <a href={`tel:${car.phone}`} style={{ padding: '10px 16px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
                  📞 {car.phone}
                </a>
              )}
              {car.email && (
                <a href={`mailto:${car.email}`} style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
                  ✉️ {car.email}
                </a>
              )}
            </div>
          </div>

          {/* Parametru tabula ar visiem datiem */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {car.year && <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '6px' }}><strong>Gads:</strong> {car.year}</div>}
            {car.engine && <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '6px' }}><strong>Dzinējs:</strong> {car.engine}</div>}
            {car.fuel && <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '6px' }}><strong>Degviela:</strong> {car.fuel}</div>}
            {car.gearbox && <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '6px' }}><strong>Ātrumkārba:</strong> {car.gearbox}</div>}
            {car.mileage && <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '6px' }}><strong>Nobraukums:</strong> {car.mileage} km</div>}
          </div>

          {/* Apraksts */}
          {car.description && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Apraksts</h3>
              <p style={{ color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{car.description}</p>
            </div>
          )}
        </div>

        {/* Labā puse: Reklāmas baneris sludinājuma lapā */}
        <div style={{ width: '260px', position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Ekskluzīvs baneris šeit!<br/><span style={{ fontSize: '12px' }}>(Maksimāla uzmanība)</span></p>
          </div>
        </div>

      </div>
    </div>
  )
}
