'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function PievienotSludinajumu() {
  const router = useRouter()
  
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [price, setPrice] = useState('')
  const [mileage, setMileage] = useState('')
  const [engine, setEngine] = useState('')
  const [fuel, setFuel] = useState('Dīzelis')
  const [transmission, setTransmission] = useState('Automāts')
  
  // Jaunie lauki
  const [color, setColor] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [vin, setVin] = useState('')

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!make.trim() || !model.trim() || !email.trim()) {
      setErrorMsg('Lūdzu aizpildiet obligātos laukus: Marka, Modelis un E-pasts!')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('cars').insert([
      {
        make: make.trim(),
        model: model.trim(),
        year: year ? Number(year) : null,
        price: price ? Number(price) : null,
        mileage: mileage ? Number(mileage) : null,
        engine: engine.trim() || null,
        fuel: fuel.trim() || null,
        transmission: transmission.trim() || null,
        color: color.trim() || null,
        body_type: bodyType.trim() || null,
        vin: vin.trim() || null,
        email: email.trim(),
        phone: phone.trim() || null,
        description: description.trim() || null,
        image: image.trim() || null,
      }
    ])

    setLoading(false)

    if (error) {
      console.error('Kļūda saglabājot sludinājumu:', error)
      setErrorMsg('Neizdevās saglabāt sludinājumu. Pārbaudiet Supabase tabulas kolonnas.')
    } else {
      router.push('/')
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '24px 16px', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>Pievienot jaunu auto sludinājumu</h1>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0' }}>Aizpildiet informāciju par auto. Lauki nav obligāti, izņemot marku, modeli un e-pastu.</p>

        {errorMsg && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 1. Rinda: Marka un Modelis */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Marka *</label>
              <input
                type="text"
                placeholder="piem., Alfa Romeo"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Modelis *</label>
              <input
                type="text"
                placeholder="piem., Giulia"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* 2. Rinda: Gads, Cena, Nobraukums */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Gads</label>
              <input
                type="number"
                placeholder="2018"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Cena (€)</label>
              <input
                type="text"
                placeholder="Pēc vienošanās vai summa"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Nobraukums (km)</label>
              <input
                type="number"
                placeholder="piem., 180000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* 3. Rinda: Motors, Degviela, Ātrumkārba */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Motors</label>
              <input
                type="text"
                placeholder="piem., 2.0 D"
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Degviela</label>
              <select
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px', backgroundColor: '#fff' }}
              >
                <option value="Dīzelis">Dīzelis</option>
                <option value="Benzīns">Benzīns</option>
                <option value="Hibrīds">Hibrīds</option>
                <option value="Elektrība">Elektrība</option>
                <option value="Gāze / Benzīns">Gāze / Benzīns</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Ātrumkārba</label>
              <input
                type="text"
                placeholder="piem., Automāts, 8 ātrumi"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* 4. Rinda (Jaunie lauki): Krāsa, Virsbūves tips, VIN kods */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Krāsa</label>
              <input
                type="text"
                placeholder="piem., Melna metalika"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Virsbūves tips</label>
              <input
                type="text"
                placeholder="piem., Universāls / Sedans"
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>VIN kods</label>
              <input
                type="text"
                placeholder="piem., WBA..."
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Pārdevēja kontakti */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '4px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', margin: '0 0 12px 0' }}>Pārdevēja kontakti</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>E-pasts *</label>
                <input
                  type="email"
                  placeholder="jusu@epasts.lv"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Tālruņa numurs (neobligāts)</label>
                <input
                  type="text"
                  placeholder="+371 20000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Foto saite */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Foto attēla saite (URL)</label>
            <input
              type="text"
              placeholder="https://piemērs.lv/bilde.jpg"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
            />
          </div>

          {/* Apraksts */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Apraksts</label>
            <textarea
              rows={4}
              placeholder="Aprakstiet auto stāvokli, komplektāciju..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px', resize: 'vertical' }}
            />
          </div>

          {/* Poga */}
          <div>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#15803d',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '11px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              {loading ? 'Saglabā...' : 'Pievienot sludinājumu'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
