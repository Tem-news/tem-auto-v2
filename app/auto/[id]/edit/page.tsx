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
  
  // Formas dati
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
  
  // Bilžu dati
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([])

  useEffect(() => {
    if (!id) return
    async function loadCar() {
      const { data, error } = await supabase.from('cars').select('*').eq('id', id).single()
      if (data) {
        setMake(data.make || ''); setModel(data.model || ''); setYear(data.year || '');
        setPrice(data.price || ''); setMileage(data.mileage || ''); setEngine(data.engine || '');
        setFuel(data.fuel || 'Dīzelis'); setGearbox(data.gearbox || 'Automāts');
        setDescription(data.description || ''); setPhone(data.phone || '');
        setExistingImages(Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []));
      }
      setLoading(false)
    }
    loadCar()
  }, [id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(file => ({
        file, preview: URL.createObjectURL(file)
      }))
      setNewImages(prev => [...prev, ...files])
    }
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
      year: year ? Number(year) : null, price: price ? Number(price) : null,
      mileage: mileage ? Number(mileage) : null, engine, fuel, gearbox,
      description, phone, images: uploadedUrls, image: uploadedUrls[0] || null
    }).eq('id', id)

    router.push(`/auto/${id}`)
    router.refresh()
  }

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Ielādē...</div>

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>Rediģēt: {make} {model}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <p><i>Marka un modelis nav maināmi.</i></p>
        <input type="number" placeholder="Gads" value={year} onChange={(e) => setYear(e.target.value)} style={{ padding: '8px' }} />
        <input type="number" placeholder="Cena" value={price} onChange={(e) => setPrice(e.target.value)} style={{ padding: '8px' }} />
        <input type="number" placeholder="Nobraukums" value={mileage} onChange={(e) => setMileage(e.target.value)} style={{ padding: '8px' }} />
        <input type="text" placeholder="Dzinējs" value={engine} onChange={(e) => setEngine(e.target.value)} style={{ padding: '8px' }} />
        <select value={fuel} onChange={(e) => setFuel(e.target.value)} style={{ padding: '8px' }}>
          <option>Dīzelis</option><option>Benzīns</option><option>Hibrīds</option><option>Elektriskais</option>
        </select>
        <textarea placeholder="Apraksts" value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: '8px', height: '100px' }} />
        
        {/* Bilžu sadaļa */}
        <div>
          <h3>Bildes</h3>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {existingImages.map((src, i) => <img key={i} src={src} width="80" />)}
            {newImages.map((img, i) => <img key={i} src={img.preview} width="80" />)}
          </div>
          <input type="file" multiple onChange={handleFileChange} />
        </div>

        <button type="submit" disabled={saving} style={{ padding: '10px', background: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}>
          {saving ? 'Saglabā...' : 'Saglabāt izmaiņas'}
        </button>
      </form>
    </div>
  )
}
