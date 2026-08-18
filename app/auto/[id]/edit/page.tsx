'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'

export default function RedigetAuto() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Visi lauki pilnā apmērā
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [price, setPrice] = useState('')
  const [mileage, setMileage] = useState('')
  const [engine, setEngine] = useState('')
  const [fuel, setFuel] = useState('Dīzelis')
  const [gearbox, setGearbox] = useState('Automāts')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  
  // Bilžu state
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([])

  useEffect(() => {
    if (!id) return
    async function loadCar() {
      const { data } = await supabase.from('cars').select('*').eq('id', id).single()
      if (data) {
        setMake(data.make || '')
        setModel(data.model || '')
        setYear(data.year ? String(data.year) : '')
        setPrice(data.price ? String(data.price) : '')
        setMileage(data.mileage ? String(data.mileage) : '')
        setEngine(data.engine || '')
        setFuel(data.fuel || 'Dīzelis')
        setGearbox(data.gearbox || 'Automāts')
        setDescription(data.description || '')
        setPhone(data.phone || '')
        setEmail(data.email || '')
        setExistingImages(Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []))
      }
      setLoading(false)
    }
    loadCar()
  }, [id])

  const handleRemoveExisting = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index))
  }

  const handleRemoveNew = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    let uploadedUrls = [...existingImages]
    for (const img of newImages) {
      const fileName = `${Date.now()}-${Math.random()}.jpg`
      await supabase.storage.from('car-images').upload(fileName, img.file)
      const { data } = supabase.storage.from('car-images').getPublicUrl(fileName)
      uploadedUrls.push(data.publicUrl)
    }

    await supabase.from('cars').update({
      year: year ? Number(year) : null,
      price: price ? Number(price) : null,
      mileage: mileage ? Number(mileage) : null,
      engine,
      fuel,
      gearbox,
      description,
      phone,
      email,
      images: uploadedUrls,
      image: uploadedUrls[0] || null
    }).eq('id', id)

    router.push(`/auto/${id}`)
  }

  if (loading) return <div style={{textAlign: 'center', padding: '50px', fontSize: '18px'}}>Ielādē datus...</div>

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      <h1 style={{ marginBottom: '20px', color: '#111' }}>Rediģēt sludinājumu: {make} {model}</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <strong>Marka un modelis:</strong> {make} {model} <span style={{ color: '#64748b', fontSize: '14px' }}>(Nav maināmi)</span>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Gads</label>
          <input type="number" placeholder="Piem. 2018" value={year} onChange={(e) => setYear(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Cena (€)</label>
          <input type="number" placeholder="Piem. 12500" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nobraukums (km)</label>
          <input type="number" placeholder="Piem. 180000" value={mileage} onChange={(e) => setMileage(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Dzinējs (Piem. 2.0 Dīzelis vai litrāža)</label>
          <input type="text" placeholder="Piem. 2.0" value={engine} onChange={(e) => setEngine(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Degvielas tips</label>
          <select value={fuel} onChange={(e) => setFuel(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>
            <option>Dīzelis</option>
            <option>Benzīns</option>
            <option>Hibrīds</option>
            <option>Elektriskais</option>
            <option>Gāze / Benzīns</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Ātrumkārba</label>
          <select value={gearbox} onChange={(e) => setGearbox(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>
            <option>Automāts</option>
            <option>Mehāniska</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Apraksts</label>
          <textarea placeholder="Papildus informācija par auto stāvokli, komplektāciju..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '120px', resize: 'vertical' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Telefona numurs</label>
          <input type="text" placeholder="Piem. +371 29000000" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>E-pasts</label>
          <input type="email" placeholder="Piem. epasts@inbox.lv" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>
        
        {/* BILŽU SADAĻA */}
        <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Bildes</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            {/* Esošās bildes */}
            {existingImages.map((src, i) => (
              <div key={i} style={{ position: 'relative', width: '100px', height: '100px' }}>
                <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <button type="button" onClick={() => handleRemoveExisting(i)} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>×</button>
              </div>
            ))}
            {/* Jaunās pievienotās bildes */}
            {newImages.map((img, i) => (
              <div key={i} style={{ position: 'relative', width: '100px', height: '100px' }}>
                <img src={img.preview} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <button type="button" onClick={() => handleRemoveNew(i)} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>×</button>
              </div>
            ))}
          </div>
          <input type="file" multiple onChange={(e) => e.target.files && setNewImages([...newImages, ...Array.from(e.target.files).map(f => ({file: f, preview: URL.createObjectURL(f)}))])} style={{ padding: '8px 0' }} />
        </div>

        <button type="submit" disabled={saving} style={{ marginTop: '10px', padding: '15px', background: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600', transition: 'background 0.2s' }}>
          {saving ? 'Saglabā izmaiņas...' : 'Saglabāt izmaiņas'}
        </button>
      </form>
    </div>
  )
}
