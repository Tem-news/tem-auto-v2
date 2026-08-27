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
  
  // Bilžu masīvs (vilkšanai un secības maiņai)
  const [images, setImages] = useState<string[]>([])
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleImageFiles = (files: FileList | File[]) => {
    const newImageUrls: string[] = []
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file)
      newImageUrls.push(url)
    })
    setImages(prev => [...prev, ...newImageUrls])
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newImages.length) return
    const temp = newImages[index]
    newImages[index] = newImages[targetIndex]
    newImages[targetIndex] = temp
    setImages(newImages)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!make.trim() || !model.trim() || !email.trim()) {
      setErrorMsg('Lūdzu aizpildiet obligātos laukus: Marka, Modelis un E-pasts!')
      return
    }

    setLoading(true)

    const mainImage = images.length > 0 ? images[0] : null

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
        image: mainImage,
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
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '16px 12px', boxSizing: 'border-box' }}>
      
      {/* GALVENAIS REŽĢIS AR REKLĀMĀM PA ABĀM MALĀM */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 240px', gap: '16px', alignItems: 'start', width: '100%' }}>
        
        {/* KREISĀ PUSE: Reklāmas baneris */}
        <div style={{ position: 'sticky', top: '80px', alignSelf: 'start', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Kreisais baneris šeit!</p>
          </div>
        </div>

        {/* VIDUS: Sludinājuma pievienošanas forma */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', minWidth: 0 }}>
          
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

            {/* 4. Rinda: Krāsa, Virsbūves tips, VIN kods */}
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

            {/* Bilžu vilkšanas lauks ar secības maiņu */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Auto fotoattēli (neobligāti)</label>
              
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.multiple = true
                  input.accept = 'image/*'
                  input.onchange = (e: any) => {
                    if (e.target.files) handleImageFiles(e.target.files)
                  }
                  input.click()
                }}
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
                <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>Ievelciet bildes šeit vai noklikšķiniet, lai izvēlētos</div>
              </div>

              {images.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>Augšupielādētās bildes (pirmā bilde būs titulbilde):</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {images.map((imgUrl, index) => (
                      <div key={index} style={{ position: 'relative', width: '90px', height: '70px', border: index === 0 ? '2px solid #16a34a' : '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                        <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        
                        {index === 0 && (
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(22, 163, 74, 0.85)', color: '#fff', fontSize: '9px', textAlign: 'center', fontWeight: 'bold', padding: '1px 0' }}>
                            Titulbilde
                          </div>
                        )}

                        <div style={{ position: 'absolute', bottom: 2, right: 2, display: 'flex', gap: '2px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '1px' }}>
                          {index > 0 && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); moveImage(index, 'up'); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '10px', cursor: 'pointer', padding: '0 2px' }}>◀</button>
                          )}
                          {index < images.length - 1 && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); moveImage(index, 'down'); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '10px', cursor: 'pointer', padding: '0 2px' }}>▶</button>
                          )}
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(index); }} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '10px', cursor: 'pointer', padding: '0 2px', fontWeight: 'bold' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

        {/* LABĀ PUSE: Reklāmas baneri */}
        <div style={{ position: 'sticky', top: '80px', alignSelf: 'start', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Globālais baneris šeit!</p>
          </div>
          
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Globālais baneris šeit!</p>
          </div>
        </div>

      </div>
    </div>
  )
}
