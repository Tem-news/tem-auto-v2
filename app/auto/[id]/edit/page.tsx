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
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [price, setPrice] = useState('')
  const [year, setYear] = useState('')
  const [mileage, setMileage] = useState('')
  const [engineSize, setEngineSize] = useState('')
  const [fuelType, setFuelType] = useState('Dīzelis')

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
        // Mēģinām sadalīt title, ja tur bija "Marka Modelis"
        const titleParts = (data.title || '').trim().split(' ')
        setMake(data.make || titleParts[0] || '')
        setModel(data.model || titleParts.slice(1).join(' ') || '')

        setPrice(data.price ? String(data.price) : '')
        setYear(data.year ? String(data.year) : '')
        setMileage(data.mileage || '')

        // Mēģinām sadalīt engine (piem., "2.0 Dīzelis")
        const engineStr = data.engine_size || data.engine || ''
        setEngineSize(engineStr.replace(/Dīzelis|Benzīns|Hibrīds|Elektro|Benzīns \/ Gāze/gi, '').trim())
        if (data.fuel_type) {
          setFuelType(data.fuel_type)
        } else if (engineStr.includes('Benzīns')) {
          setFuelType('Benzīns')
        } else if (engineStr.includes('Hibrīds')) {
          setFuelType('Hibrīds')
        } else if (engineStr.includes('Elektro')) {
          setFuelType('Elektro')
        } else {
          setFuelType('Dīzelis')
        }

        // Attēlu ielāde
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

  // Augšupielādē jaunu bildi
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
    e.target.value = ''
  }

  // Izdzēš bildi
  const handleRemoveImage = (indexToRemove: number) => {
    setImagesList((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  // Bīdīt bildi pa kreisi
  const moveImageLeft = (index: number) => {
    if (index === 0) return
    const updated = [...imagesList]
    const temp = updated[index - 1]
    updated[index - 1] = updated[index]
    updated[index] = temp
    setImagesList(updated)
  }

  // Bīdīt bildi pa labi
  const moveImageRight = (index: number) => {
    if (index === imagesList.length - 1) return
    const updated = [...imagesList]
    const temp = updated[index + 1]
    updated[index + 1] = updated[index]
    updated[index] = temp
    setImagesList(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Pirmā bilde kļūst par galveno
    const mainImg = imagesList.length > 0 ? imagesList[0] : ''
    const extraImgs = imagesList.length > 1 ? imagesList.slice(1) : []

    const fullTitle = `${make} ${model}`.trim()
    const fullEngine = `${engineSize} ${fuelType}`.trim()

    // Pamata dati, kas garantēti ir datubāzē
    const updatedCar: Record<string, any> = {
      title: fullTitle,
      price: Number(price),
      year: Number(year),
      mileage: mileage,
      engine: fullEngine,
      image: mainImg,
      images: extraImgs,
      make: make,
      model: model,
      engine_size: engineSize,
      fuel_type: fuelType
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
      router.refresh()
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
      router.refresh()
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Marka:</label>
            <input
              type="text"
              required
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="Piem., Seat"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Modelis:</label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Piem., Leon"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Nobraukums (km):</label>
          <input
            type="text"
            required
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Dzinēja tilpums / jauda:</label>
            <input
              type="text"
              required
              value={engineSize}
              onChange={(e) => setEngineSize(e.target.value)}
              placeholder="Piem., 2.0"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Dzinēja tips / Degviela:</label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            >
              <option value="Dīzelis">Dīzelis</option>
              <option value="Benzīns">Benzīns</option>
              <option value="Benzīns / Gāze">Benzīns / Gāze</option>
              <option value="Hibrīds">Hibrīds</option>
              <option value="Elektro">Elektro</option>
            </select>
          </div>
        </div>

        {/* VIZUĀLĀ ATTĒLU PĀRVALDĪBAS SADAĻA */}
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', fontSize: '16px' }}>
            Sludinājuma attēli ({imagesList.length}):
          </label>
          <p style={{ color: '#6c757d', fontSize: '13px', marginTop: 0, marginBottom: '15px' }}>
            Pirmā bilde kreisajā pusē kļūs par galveno titulbildi. Izmanto bultiņas, lai mainītu secību.
          </p>

          {imagesList.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginBottom: '15px' }}>
              {imagesList.map((url, idx) => (
                <div key={idx} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: idx === 0 ? '2px solid #0066cc' : '1px solid #ddd', backgroundColor: '#fff' }}>
                  <img
                    src={url}
                    alt={`Bilde ${idx + 1}`}
                    style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }}
                  />
                  {idx === 0 && (
                    <span style={{ position: 'absolute', top: '4px', left: '4px', backgroundColor: '#0066cc', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                      Galvenā
                    </span>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#eee', padding: '2px' }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveImageLeft(idx)}
                      style={{ border: 'none', background: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                      title="Pārvietot pa kreisi"
                    >
                      ⬅️
                    </button>
                    <button
                      type="button"
                      disabled={idx === imagesList.length - 1}
                      onClick={() => moveImageRight(idx)}
                      style={{ border: 'none', background: 'none', cursor: idx === imagesList.length - 1 ? 'default' : 'pointer', opacity: idx === imagesList.length - 1 ? 0.3 : 1 }}
                      title="Pārvietot pa labi"
                    >
                      ➡️
                    </button>
                  </div>

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
