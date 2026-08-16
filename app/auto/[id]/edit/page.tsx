'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'

export default function RedigetAuto() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Auto dati
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [price, setPrice] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    if (!id) return

    async function fetchCar() {
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Kļūda ielādējot auto:', error)
          alert('Kļūda ielādējot datus: ' + error.message)
        } else if (data) {
          setMake(data.make || '')
          setModel(data.model || '')
          setYear(data.year || '')
          setPrice(data.price ? String(data.price) : '')
          setPhone(data.phone || '')
          setDescription(data.description || '')

          // Apvienojam galveno bildi un pārējās bildes masīvā
          const allImgs: string[] = []
          if (data.image) allImgs.push(data.image)
          if (Array.isArray(data.images)) {
            data.images.forEach((img: string) => {
              if (img && !allImgs.includes(img)) allImgs.push(img)
            })
          }
          setImages(allImgs)
        }
      } catch (err: any) {
        console.error('Neidentificēta kļūda:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCar()
  }, [id])

  // Attēlu augšupielāde
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newUploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `cars/${fileName}`

      const { error } = await supabase.storage
        .from('car-images')
        .upload(filePath, file)

      if (error) {
        console.error('Kļūda augšupielādējot bildi:', error)
        alert('Kļūda augšupielādējot attēlu: ' + error.message)
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('car-images')
          .getPublicUrl(filePath)

        if (publicUrlData?.publicUrl) {
          newUploadedUrls.push(publicUrlData.publicUrl)
        }
      }
    }

    setImages((prev) => [...prev, ...newUploadedUrls])
    setUploading(false)
  }

  // Attēla dzēšana
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  // Attēla pārvietošana (secības maiņa)
  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return
    const updated = [...images]
    const [movedItem] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, movedItem)
    setImages(updated)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const mainImage = images.length > 0 ? images[0] : ''
      const otherImages = images.length > 1 ? images.slice(1) : []

      const updatedFields: any = {
        price: price ? Number(price) : null,
        phone,
        description,
        image: mainImage,
        images: otherImages
      }

      const { error } = await supabase
        .from('cars')
        .update(updatedFields)
        .eq('id', id)

      if (error) {
        console.error('Supabase atjaunināšanas kļūda:', error)
        alert('Kļūda saglabājot izmaiņas: ' + error.message)
      } else {
        alert('Izmaiņas veiksmīgi saglabātas!')
        router.push(`/auto/${id}`)
        router.refresh()
      }
    } catch (err: any) {
      console.error('Kļūda saglabāšanas laikā:', err)
      alert('Nezināma kļūda saglabājot: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Ielādē datus...</div>
  }

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <Link href={`/auto/${id}`} style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
        ← Atpakaļ uz sludinājumu
      </Link>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>
        Rediģēt sludinājumu
      </h1>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Bloķētie lauki drošībai */}
        <div style={{ backgroundColor: '#f3f4f6', padding: '14px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Auto marka, modelis un gads (nav maināmi):</p>
          <strong style={{ color: '#111827', fontSize: '18px' }}>{make} {model} ({year})</strong>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Cena (€)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Tālruņa numurs</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+371 20000000"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
        </div>

        {/* Attēlu pārvaldība */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Attēli (Pirmā bilde ir titulbilde)</label>
          
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ marginBottom: '12px', display: 'block' }}
          />
          {uploading && <p style={{ fontSize: '13px', color: '#2563eb' }}>Lādē bildes...</p>}

          {/* Sīktēlu saraksts ar bultiņām un dzēšanu */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
            {images.map((img, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  width: '120px',
                  height: '90px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: idx === 0 ? '3px solid #2563eb' : '1px solid #d1d5db',
                  backgroundColor: '#f9fafb'
                }}
              >
                <img src={img} alt={`Bilde ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                {idx === 0 && (
                  <span style={{ position: 'absolute', top: '2px', left: '2px', backgroundColor: '#2563eb', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '4px' }}>
                    Titulbilde
                  </span>
                )}

                {/* Vadības pogas */}
                <div style={{ position: 'absolute', bottom: '2px', right: '2px', display: 'flex', gap: '2px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '2px', borderRadius: '4px' }}>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveImage(idx, idx - 1)}
                      style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', padding: '0 3px' }}
                      title="Pārvietot pa kreisi"
                    >
                      ◄
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveImage(idx, idx + 1)}
                      style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', padding: '0 3px' }}
                      title="Pārvietot pa labi"
                    >
                      ►
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: '0 3px' }}
                    title="Dzēst bildi"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Apraksts</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          style={{
            padding: '12px',
            backgroundColor: saving ? '#9ca3af' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saglabā...' : 'Saglabāt izmaiņas'}
        </button>
      </form>
    </div>
  )
}
