'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function PievienotAuto() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const imagesArray = imagesInput
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0)

    const mainImage = imagesArray.length > 0 ? imagesArray[0] : ''

    const { data, error } = await supabase
      .from('cars')
      .insert([
        {
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
        }
      ])
      .select()

    setLoading(false)

    if (error) {
      console.error('Kļūda saglabājot sludinājumu:', error)
      alert('Kļūda saglabājot sludinājumu!')
    } else if (data && data.length > 0) {
      router.push(`/auto/${data[0].id}`)
    } else {
      router.push('/')
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Atpakaļ uz sarakstu
        </Link>
      </div>

      <h1 style={{ marginBottom: '24px' }}>➕ Pievienot jaunu auto sludinājumu</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Marka *</label>
          <input
            type="text"
            required
            placeholder="piem., BMW, Audi, Volkswagen"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Modelis *</label>
          <input
            type="text"
            required
            placeholder="piem., 320, A4, Passat"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Virsraksts (pēc izvēles)</label>
          <input
            type="text"
            placeholder="Atstāj tukšu, lai izmantotu Marku + Modeli"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Cena (€) *</label>
            <input
              type="number"
              required
              placeholder="piem., 8500"
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
              placeholder="piem., 2018"
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
              placeholder="piem., 180 000 km"
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
              placeholder="piem., 2.0 Dīzelis (140kW)"
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
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Tālrunis *</label>
              <input
                type="text"
                required
                placeholder="piem., +371 20000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Pilsēta / Atrašanās vieta</label>
              <input
                type="text"
                placeholder="piem., Rīga"
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
            placeholder="Apraksti auto stāvokli, aprīkojumu, veiktās apkopes un citas priekšrocības..."
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
            placeholder="https://atels1.jpg&#10;https://atels2.jpg"
            value={imagesInput}
            onChange={(e) => setImagesInput(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '10px'
          }}
        >
          {loading ? 'Saglabā...' : 'Publicēt sludinājumu'}
        </button>
      </form>
    </div>
  )
}
