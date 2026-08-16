'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
export default function RedigetAuto() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [price, setPrice] = useState('')
  const [year, setYear] = useState('')
  const [mileage, setMileage] = useState('')
  const [engine, setEngine] = useState('')
  const [fuelType, setFuelType] = useState('Dīzelis')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [imagesInput, setImagesInput] = useState('')

  useEffect(() => {
    if (!id) return

    async function fetchCar() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Kļūda ielādējot datus:', error)
      } else if (data) {
        setTitle(data.title || '')
        setMake(data.make || '')
        setModel(data.model || '')
        setPrice(data.price ? String(data.price) : '')
        setYear(data.year ? String(data.year) : '')
        setMileage(data.mileage || '')
        setEngine(data.engine || '')
        setFuelType(data.fuel_type || data.fuelType || 'Dīzelis')
        setPhone(data.phone || '')
        setLocation(data.location || '')
        setDescription(data.description || '')

        const allImgs: string[] = []
        if (data.image) allImgs.push(data.image)
        if (data.images && Array.isArray(data.images)) {
          data.images.forEach((img: string) => {
            if (img && !allImgs.includes(img)) allImgs.push(img)
          })
        }
        setImagesInput(allImgs.join('\n'))
      }
      setLoading(false)
    }

    fetchCar()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const imagesArray = imagesInput
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0)

    const mainImage = imagesArray.length > 0 ? imagesArray[0] : ''

    const { error } = await supabase
      .from('cars')
      .update({
        title: title || `${make} ${model}`,
        make,
        model,
        price: Number(price),
        year: Number(year),
        mileage,
        engine,
        fuel_type: fuelType,
        phone,
        location,
        description,
        image: mainImage,
        images: imagesArray
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      console.error('Kļūda atjauninot sludinājumu:', error)
      alert('Kļūda atjauninot sludinājumu!')
    } else {
      router.push(`/auto/${id}`)
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
      <div style={{ marginBottom: '20px' }}>
        <Link href={`/auto/${id}`} style={{ color: '#0066cc', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Atpakaļ uz sludinājumu
        </Link>
      </div>

      <h1 style={{ marginBottom: '24px' }}>✏️ Rediģēt sludinājumu</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Virsraksts</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Marka</label>
            <input
              type="text"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Modelis</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Cena (€) *</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Izlaiduma gads *</label>
            <input
              type="number"
              required
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Nobraukums *</label>
            <input
              type="text"
              required
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Dzinējs *</label>
            <input
              type="text"
              required
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Degvielas tips</label>
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', boxSizing: 'border-box' }}
          >
            <option value="Dīzelis">Dīzelis</option>
            <option value="Benzīns">Benzīns</option>
            <option value="Hibrīds">Hibrīds</option>
            <option value="Elektro">Elektro</option>
            <option value="Gāze">Gāze / LPG</option>
          </select>
        </div>

        {/* KONTAKTI */}
        <div style={{ borderTop: '2px solid #eee', paddingTop: '16px', marginTop: '8px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>📞 Kontaktinformācija</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Tālrunis</label>
              <input
                type="text"
                placeholder="+371 20000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Pilsēta / Atrašanās vieta</label>
              <input
                type="text"
                placeholder="Rīga"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* APRAKSTS */}
        <div style={{ borderTop: '2px solid #eee', paddingTop: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>📝 Apraksts (brīvā formā)</label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontFamily: 'sans-serif', boxSizing: 'border-box' }}
          />
        </div>

        {/* ATTĒLI */}
        <div style={{ borderTop: '2px solid #eee', paddingTop: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>🖼️ Attēlu saites (URL, pa vienai katrā rindiņā)</label>
          <textarea
            rows={3}
            value={imagesInput}
            onChange={(e) => setImagesInput(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '14px',
            backgroundColor: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: saving ? 'not-allowed' : 'pointer',
            marginTop: '10px'
          }}
        >
          {saving ? 'Saglabā izmaiņas...' : 'Saglabā izmaiņas'}
        </button>
      </form>
    </div>
  )
}
