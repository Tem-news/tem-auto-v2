'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'

export default function EditAuto() {
  const params = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Formas lauki
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [year, setYear] = useState('')
  const [mileage, setMileage] = useState('')
  const [engine, setEngine] = useState('')

  // Vizuālais attēlu saraksts
  const [imagesList, setImagesList] = useState<string[]>([])

  useEffect(() => {
    async function fetchCar() {
      if (!params?.id) return

      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        alert('Kļūda iegūstot datus: ' + error.message)
      } else if (data) {
        setTitle(data.title || '')
        setPrice(data.price ? String(data.price) : '')
        setYear(data.year ? String(data.year) : '')
        setMileage(data.mileage || '')
        setEngine(data.engine || '')

        // Apvienojam galveno bildi un papildu bildes vienā sarakstā
        const imgs: string[] = []
        if (data.image) imgs.push(data.image)
        if (data.images && Array.isArray(data.images)) {
          data.images.forEach((img: string) => {
            if (img && !imgs.includes(img)) imgs.push(img)
          })
        }
        setImagesList(imgs)
      }
      setLoading(false)
    }

    fetchCar()
  }, [params])

  // Augšupielādē jaunu bildi uz Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('car-images')
        .upload(fileName, file)

      if (error) {
        alert('Kļūda augšupielādējot attēlu: ' + error.message)
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('car-images')
          .getPublicUrl(data.path)

        if (publicUrlData?.publicUrl) {
          setImagesList((prev) => [...prev, publicUrlData.publicUrl])
        }
      }
    }

    setUploading(false)
    e.target.value = '' // Nometam ievades lauku
  }

  // Izdzēš bildi no vizuālā saraksta
  const handleRemoveImage = (indexToRemove: number) => {
    setImagesList((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Pirmā bilde kļūst par galveno `image`, pārējās aiziet uz `images` masīvu
    const mainImg = imagesList.length > 0 ? imagesList[0] : ''
    const extraImgs = imagesList.length > 1 ? imagesList.slice(1) : []

    const updatedCar = {
      title,
      price: Number(price),
      year: Number(year),
      mileage,
      engine,
      image: mainImg,
      images: extraImgs
    }

    const { error } = await supabase
      .from('cars')
      .update(updatedCar)
      .eq('id', params.id)

    if (error) {
      alert('Kļūda saglabājot izmaiņas: ' + error.message)
      setSaving(false)
    } else {
      router.push(`/auto/${params.id}`)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Vai tiešām vēlies neatgriezeniski dzēst šo sludinājumu?')) return

    setDeleting(true)
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', params.id)

    if (error) {
      alert('Kļūda dzēšot sludinājumu: ' + error.message)
      setDeleting(false)
    } else {
      router.push('/auto')
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '650px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <p>Ielādē sludinājuma datus...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <Link href={`/auto/${params.id}`} style={{ color: '#0066cc', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
        ← Atpakaļ uz sludinājumu
      </Link>

      <h1 style={{ marginBottom: '30px', fontSize: '26px' }}>Rediģēt sludinājumu</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Nosaukums / Marka un Modelis:</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Cena (€):</label>
          <input
            type="number"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Izlaiduma gads:</label>
          <input
            type="number"
            required
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Nobraukums (piem., 180 000 km):</label>
          <input
            type="text"
            required
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Dzinējs (piem., 2.0 Dīzelis):</label>
          <input
            type="text"
            required
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        {/* VIZUĀLĀ ATTĒLU PĀRVALDĪBAS SADAĻA */}
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', fontSize: '16px' }}>
            Sludinājuma attēli ({imagesList.length}):
          </label>

          {imagesList.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', marginBottom: '15px' }}>
              {imagesList.map((url, idx) => (
                <div key={idx} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd', backgroundColor: '#fff' }}>
                  <img
                    src={url}
                    alt={`Bilde ${idx + 1}`}
                    style={{ width: '100%', height: '85px', objectFit: 'cover', display: 'block' }}
                  />
                  {idx === 0 && (
                    <span style={{ position: 'absolute', top: '4px', left: '4px', backgroundColor: '#0066cc', color: '#fff', fontSize: '10px', padding: '2px 5px', borderRadius: '4px' }}>
                      Galvenā
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      width: '100%',
                      padding: '4px',
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🗑️ Dzēst
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '15px' }}>Pagaidām nav pievienots neviens attēls.</p>
          )}

          {/* ATTĒLU PIEVIENOŠANAS POGA */}
          <label
            style={{
              display: 'inline-block',
              padding: '10px 16px',
              backgroundColor: uploading ? '#6c757d' : '#0066cc',
              color: '#fff',
              borderRadius: '6px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            {uploading ? 'Augšupielādē attēlus...' : '➕ Pievienot jaunu attēlu'}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          style={{
            marginTop: '10px',
            padding: '12px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: saving || uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saglabā izmaiņas...' : '💾 Saglabā izmaiņas'}
        </button>
      </form>

      {/* DZĒŠANAS SADAĻA FORMAS APAKŠĀ */}
      <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '2px solid #fee2e2' }}>
        <h3 style={{ color: '#dc3545', marginTop: 0, fontSize: '18px' }}>Bīstamā zona</h3>
        <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '15px' }}>
          Ja vēlies pavisam izdzēst šo sludinājumu no datubāzes:
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: deleting ? 'not-allowed' : 'pointer'
          }}
        >
          {deleting ? 'Dzēš sludinājumu...' : '🗑️ Dzēst sludinājumu'}
        </button>
      </div>
    </div>
  )
}
