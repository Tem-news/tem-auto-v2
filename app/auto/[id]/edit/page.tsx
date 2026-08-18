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
  const [errorMsg, setErrorMsg] = useState('')

  // Formas lauki
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
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([])

  useEffect(() => {
    if (!id) return

    async function loadCar() {
      const { data, error } = await supabase.from('cars').select('*').eq('id', id).single()
      
      if (error || !data) {
        setErrorMsg('Neizdevās ielādēt sludinājumu.')
        setLoading(false)
        return
      }

      setMake(data.make || '')
      setModel(data.model || '')
      setYear(data.year || '')
      setPrice(data.price || '')
      setMileage(data.mileage || '')
      setEngine(data.engine || '')
      setFuel(data.fuel || 'Dīzelis')
      setGearbox(data.gearbox || 'Automāts')
      setDescription(data.description || '')
      setPhone(data.phone || '')
      setEmail(data.email || '')
      setExistingImages(Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []))
      setLoading(false)
    }

    loadCar()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Augšupielādē jaunās bildes
    const uploadedUrls = []
    for (const img of newImages) {
      const fileName = `${Date.now()}-${Math.random()}.jpg`
      await supabase.storage.from('car-images').upload(fileName, img.file)
      const { data } = supabase.storage.from('car-images').getPublicUrl(fileName)
      uploadedUrls.push(data.publicUrl)
    }

    const allImages = [...existingImages, ...uploadedUrls]

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
      image: allImages[0] || null,
      image_url: allImages[0] || null,
      images: allImages
    }).eq('id', id)

    router.push(`/auto/${id}`)
  }

  if (loading) return <div>Ielādē...</div>

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1>Rediģēt: {make} {model}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <p><strong>Marka/Modelis:</strong> {make} {model} (nemaināmi)</p>
        
        <input type="number" placeholder="Gads" value={year} onChange={(e) => setYear(e.target.value)} style={{ padding: '10px' }} />
        <input type="number" placeholder="Cena" value={price} onChange={(e) => setPrice(e.target.value)} style={{ padding: '10px' }} />
        <input type="number" placeholder="Nobraukums" value={mileage} onChange={(e) => setMileage(e.target.value)} style={{ padding: '10px' }} />
        <input type="text" placeholder="Dzinējs" value={engine} onChange={(e) => setEngine(e.target.value)} style={{ padding: '10px' }} />
        
        <select value={fuel} onChange={(e) => setFuel(e.target.value)}>
          <option>Dīzelis</option> <option>Benzīns</option> <option>Hibrīds</option>
        </select>

        <textarea placeholder="Apraksts" value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: '10px' }} />
        <input type="text" placeholder="Tālrunis" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '10px' }} />
        
        <button type="submit" disabled={saving}>{saving ? 'Saglabā...' : 'Saglabāt izmaiņas'}</button>
      </form>
    </div>
  )
}
