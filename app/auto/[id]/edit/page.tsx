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

  // Formas lauki...
  const [make, setMake] = useState(''); const [model, setModel] = useState('');
  const [year, setYear] = useState(''); const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState(''); const [engine, setEngine] = useState('');
  const [fuel, setFuel] = useState('Dīzelis'); const [gearbox, setGearbox] = useState('Automāts');
  const [description, setDescription] = useState(''); const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Bilžu state (visas bildes vienā masīvā)
  const [images, setImages] = useState<{ url: string; isNew: boolean; file?: File }[]>([])

  useEffect(() => {
    if (!id) return
    async function loadCar() {
      const { data } = await supabase.from('cars').select('*').eq('id', id).single()
      if (data) {
        setMake(data.make); setModel(data.model); setYear(data.year);
        setPrice(data.price); setMileage(data.mileage); setEngine(data.engine);
        setFuel(data.fuel); setGearbox(data.gearbox); setDescription(data.description);
        setPhone(data.phone); setEmail(data.email);
        
        const existing = Array.isArray(data.images) ? data.images : (data.images ? [data.images] : [])
        setImages(existing.map(url => ({ url, isNew: false })))
      }
      setLoading(false)
    }
    loadCar()
  }, [id])

  // Pārvietošana: Uzliek izvēlēto bildi pirmo (tā kļūst par titulu)
  const setAsMain = (index: number) => {
    const newImages = [...images]
    const [moved] = newImages.splice(index, 1)
    newImages.unshift(moved)
    setImages(newImages)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    let finalUrls = []
    for (const img of images) {
      if (img.isNew && img.file) {
        const fileName = `${Date.now()}-${Math.random()}.jpg`
        await supabase.storage.from('car-images').upload(fileName, img.file)
        const { data } = supabase.storage.from('car-images').getPublicUrl(fileName)
        finalUrls.push(data.publicUrl)
      } else {
        finalUrls.push(img.url)
      }
    }

    await supabase.from('cars').update({
      year: Number(year), price: Number(price), mileage: Number(mileage),
      engine, fuel, gearbox, description, phone, email,
      images: finalUrls, image: finalUrls[0] || null
    }).eq('id', id)

    router.push(`/auto/${id}`)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      <h1>Rediģēt: {make} {model}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* ... (šeit paliek visi ievades lauki tāpat kā iepriekš) ... */}
        
        <div>
          <label><strong>Bildes (pirmā bilde ir tituls):</strong></label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: 'relative', width: '120px', height: '120px' }}>
                <img src={img.isNew ? URL.createObjectURL(img.file!) : img.url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: i === 0 ? '3px solid #2563eb' : '1px solid #ccc' }} />
                
                {/* Dzēšanas poga */}
                <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '25px', cursor: 'pointer' }}>×</button>
                
                {/* Titulbildes poga */}
                {i !== 0 && (
                  <button type="button" onClick={() => setAsMain(i)} style={{ position: 'absolute', bottom: '5px', left: '5px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Tituls</button>
                )}
              </div>
            ))}
          </div>
          <input type="file" multiple onChange={(e) => {
            if (e.target.files) {
              const newImgs = Array.from(e.target.files).map(file => ({ url: '', isNew: true, file }))
              setImages([...images, ...newImgs])
            }
          }} style={{ marginTop: '15px' }} />
        </div>

        <button type="submit" disabled={saving} style={{ padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          {saving ? 'Saglabā...' : 'Saglabāt izmaiņas'}
        </button>
      </form>
    </div>
  )
}
