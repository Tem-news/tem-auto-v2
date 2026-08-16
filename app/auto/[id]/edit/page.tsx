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

  // Auto dati
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [price, setPrice] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [images, setImages] = useState<string[]>([])

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
        setMake(data.make || '')
        setModel(data.model || '')
        setYear(data.year || '')
        setPrice(data.price || '')
        setPhone(data.phone || '')
        setDescription(data.description || '')
        setImage(data.image || '')
        setImages(data.images || [])
      }
      setLoading(false)
    }

    fetchCar()
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('cars')
      .update({
        price: Number(price),
        phone,
        description,
        image,
        images
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      alert('Kļūda saglabājot izmaiņas: ' + error.message)
    } else {
      router.push(`/auto/${id}`)
    }
  }

  if (loading) {
    return <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Ielādē datus...</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <Link href={`/auto/${id}`} style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
        ← Atpakaļ uz sludinājumu
      </Link>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>
        Rediģēt sludinājumu
      </h1>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Nobloķēti lauki drošībai */}
        <div style={{ backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Auto marka, modelis un gads (nav maināmi):</p>
          <strong style={{ color: '#374151', fontSize: '16px' }}>{make} {model} ({year})</strong>
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

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Galvenā attēla URL (Titulbilde)</label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
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
          disabled={saving}
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
