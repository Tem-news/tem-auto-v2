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

  // Visi lauki
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
  
  // Bilžu state
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([])

  useEffect(() => {
    if (!id) return
    async function loadCar() {
      const { data } = await supabase.from('cars').select('*').eq('id', id).single()
      if (data) {
        setMake(data.make); setModel(data.model); setYear(data.year);
        setPrice(data.price); setMileage(data.mileage); setEngine(data.engine);
        setFuel(data.fuel); setGearbox(data.gearbox); setDescription(data.description);
        setPhone(data.phone);
        setExistingImages(Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []));
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
      year: Number(year), price: Number(price), mileage: Number(mileage),
      engine, fuel, gearbox, description, phone, images: uploadedUrls, image: uploadedUrls[0] || null
    }).eq('id', id)

    router.push(`/auto/${id}`)
  }

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Ielādē datus...</div>

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      <h1 style={{ marginBottom: '20px' }}>Rediģēt: {make} {model}</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
          <strong>Marka/Modelis:</strong> {make} {model} (nemaināmi)
        </div>

        <input type="number" placeholder="Gads" value={year} onChange={(e) => setYear(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
        <input type="number" placeholder="Cena" value={price} onChange={(e) => setPrice(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
        <input type="text" placeholder="Dzinējs" value={engine} onChange={(e) => setEngine(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
        
        {/* BILŽU "SKAISTUMS" */}
        <div style={{ marginTop: '10px' }}>
          <label><strong>Bildes:</strong></label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            {existingImages.map((src, i) => (
              <div key={i} style={{ position: 'relative', width: '100px', height: '100px' }}>
                <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                <button type="button" onClick={() => handleRemoveExisting(i)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>X</button>
              </div>
            ))}
            {newImages.map((img, i) => (
              <div key={i} style={{ position: 'relative', width: '100px', height: '100px' }}>
                <img src={img.preview} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                <button type="button" onClick={() => handleRemoveNew(i)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>X</button>
              </div>
            ))}
          </div>
          <input type="file" multiple onChange={(e) => e.target.files && setNewImages([...newImages, ...Array.from(e.target.files).map(f => ({file: f, preview: URL.createObjectURL(f)}))])} style={{ marginTop: '15px' }} />
        </div>

        <button type="submit" disabled={saving} style={{ padding: '15px', background: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
          {saving ? 'Saglabā...' : 'Saglabāt izmaiņas'}
        </button>
      </form>
    </div>
  )
}
