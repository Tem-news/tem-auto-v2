'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'

interface Car {
  id: number
  title: string
  price: number
  year: number
  mileage: string
  engine: string
  image?: string
  images?: string[]
}

export default function EditAuto() {
  const params = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Formas lauki
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [year, setYear] = useState('')
  const [mileage, setMileage] = useState('')
  const [engine, setEngine] = useState('')
  const [mainImage, setMainImage] = useState('')
  const [additionalImages, setAdditionalImages] = useState('')

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
        setMainImage(data.image || '')
        setAdditionalImages(data.images && Array.isArray(data.images) ? data.images.join('\n') : '')
      }
      setLoading(false)
    }

    fetchCar()
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Attēlu masīva sagatavošana no teksta lauka
    const imagesArray = additionalImages
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0)

    const updatedCar = {
      title,
      price: Number(price),
      year: Number(year),
      mileage,
      engine,
      image: mainImage,
      images: imagesArray
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
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <p>Ielādē sludinājuma datus...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
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

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Galvenā attēla URL saite:</label>
          <input
            type="url"
            value={mainImage}
            onChange={(e) => setMainImage(e.target.value)}
            placeholder="https://..."
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Papildu attēlu URL saites (katru savā rindiņā):</label>
          <textarea
            rows={4}
            value={additionalImages}
            onChange={(e) => setAdditionalImages(e.target.value)}
            placeholder="https://...\nhttps://..."
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: '10px',
            padding: '12px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: saving ? 'not-allowed' : 'pointer'
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
