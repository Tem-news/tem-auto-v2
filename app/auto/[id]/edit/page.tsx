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
  const [email, setEmail] = useState('')

  // Bilžu state: glabājam vienotā masīvā, kur pirmajam vienmēr ir jābūt titulbildei
  const [images, setImages] = useState<{ url: string; isNew: boolean; file?: File }[]>([])

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
        
        const existing = Array.isArray(data.images) ? data.images : (data.images ? [data.images] : [])
        setImages(existing.map(url => ({ url, isNew: false })))
      }
      setLoading(false)
    }
    loadCar()
  }, [id])

  // Pārvietot bildi uz pirmo vietu (padarīt par titulu)
  const setAsMain = (index: number) => {
    const updated = [...images]
    const [moved] = updated.splice(index, 1)
    updated.unshift(moved)
    setImages(updated)
  }

  // Dzēst bildi
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
      year: year ? Number(year) : null,
      price: price ? Number(price) : null,
      mileage: mileage ? Number(mileage) : null,
      engine,
      fuel,
      gearbox,
      description,
      phone,
      email,
      images: finalUrls,
      image: finalUrls[0] || null // Pirmā bilde automātiski kļūst par galveno/titulbildi sarakstam
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
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Dzinējs</label>
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
          <textarea placeholder="Papildus informācija par auto..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '120px', resize: 'vertical' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Telefona numurs</label>
          <input type="text" placeholder="Piem. +371 29000000" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>E-pasts</label>
          <input type="email" placeholder="Piem. epasts@inbox.lv" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>

        {/* BILŽU SADAĻA AR TITULBIĻDI UN DZĒŠANU */}
        <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Bildes (pirmā ir galvenā titulbilde):</label>
          <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '10px' }}>
            Spied pogu "Tituls" uz jebkuras bildes, lai to pārvietotu uz sākumu.
          </span>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '15px' }}>
            {images.map((img, i) => {
              const previewUrl = img.isNew && img.file ? URL.createObjectURL(img.file) : img.url
              const isMain = i === 0

              return (
                <div key={i} style={{ position: 'relative', width: '110px', height: '110px' }}>
                  <img 
                    src={previewUrl} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover', 
                      borderRadius: '8px', 
                      border: isMain ? '3px solid #2563eb' : '1px solid #cbd5e1' 
                    }} 
                  />
                  
                  {/* Dzēšanas poga (X) */}
                  <button 
                    type="button" 
                    onClick={() => removeImage(i)} 
                    style={{ 
                      position: 'absolute', top: '-6px', right: '-6px', 
                      background: '#ef4444', color: 'white', border: 'none', 
                      borderRadius: '50%', width: '24px', height: '24px', 
                      cursor: 'pointer', fontWeight: 'bold', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                    }}
                  >
                    ×
                  </button>

                  {/* Titulbilde rādītājs vai poga */}
                  {isMain ? (
                    <span style={{ 
                      position: 'absolute', bottom: '4px', left: '4px', right: '4px',
                      background: '#2563eb', color: 'white', fontSize: '10px', 
                      textAlign: 'center', borderRadius: '4px', padding: '2px 0', fontWeight: '600'
                    }}>
                      Tituls
                    </span>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => setAsMain(i)} 
                      style={{ 
                        position: 'absolute', bottom: '4px', left: '4px', right: '4px',
                        background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '10px', 
                        border: 'none', borderRadius: '4px', padding: '3px 0', cursor: 'pointer', fontWeight: '500'
                      }}
                    >
                      Uzstādīt par titulu
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <input 
            type="file" 
            multiple 
            onChange={(e) => {
              if (e.target.files) {
                const addedFiles = Array.from(e.target.files).map(file => ({ url: '', isNew: true, file }))
                setImages([...images, ...addedFiles])
              }
            }} 
            style={{ padding: '8px 0' }} 
          />
        </div>

        <button type="submit" disabled={saving} style={{ marginTop: '10px', padding: '15px', background: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>
          {saving ? 'Saglabā izmaiņas...' : 'Saglabāt izmaiņas'}
        </button>
      </form>
    </div>
  )
}
