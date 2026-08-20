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

  // Bilžu state
  const [images, setImages] = useState<{ url: string; isNew: boolean; file?: File }[]>([])

  useEffect(() => {
    if (!id) return

    async function checkAuthAndLoadCar() {
      // 1. Pārbaudām, vai lietotājs ir ielogojies
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
        router.push('/login')
        return
      }

      // 2. Ielādējam sludinājumu
      const { data, error } = await supabase.from('cars').select('*').eq('id', id).single()

      if (error || !data) {
        setErrorMsg('Sludinājums nav atrasts.')
        setLoading(false)
        return
      }

      // 3. Pārbaudām, vai ielogotais lietotājs ir šī sludinājuma īpašnieks
      if (data.user_id && data.user_id !== session.user.id) {
        setErrorMsg('Tev nav tiesību rediģēt šo sludinājumu!')
        setLoading(false)
        return
      }

      // Ja viss kārtībā, aizpildām datus
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
      
      setLoading(false)
    }

    checkAuthAndLoadCar()
  }, [id, router])

  // Pārvietot bildi ar bultiņām
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= images.length) return
    const updated = [...images]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)
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
      image: finalUrls[0] || null
    }).eq('id', id)

    router.push(`/auto/${id}`)
  }

  if (loading) return <div style={{textAlign: 'center', padding: '50px', fontSize: '18px'}}>Pārbauda piekļuves tiesības...</div>

  if (errorMsg) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '30px', background: '#fff', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '15px' }}>Piekļuve liegta</h2>
        <p style={{ color: '#334155', marginBottom: '20px' }}>{errorMsg}</p>
        <button onClick={() => router.push('/')} style={{ padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Atgriezties sākumā
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1150px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      
      {/* Divu kolonnu izkārtojums: Forma kreisajā pusē, reklāma labajā */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', justifyContent: 'center' }}>
        
        {/* Kreisā puse: Rediģēšanas forma */}
        <div style={{ flex: 1, maxWidth: '800px', backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          <h1 style={{ marginBottom: '20px', color: '#111', fontSize: '24px' }}>Rediģēt sludinājumu: {make} {model}</h1>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <strong>Marka un modelis:</strong> {make} {model} <span style={{ color: '#64748b', fontSize: '14px' }}>(Nav maināmi)</span>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Gads</label>
              <input type="number" placeholder="Piem. 2018" value={year} onChange={(e) => setYear(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Cena (€)</label>
              <input type="number" placeholder="Piem. 12500" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nobraukums (km)</label>
              <input type="number" placeholder="Piem. 180000" value={mileage} onChange={(e) => setMileage(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Dzinējs</label>
              <input type="text" placeholder="Piem. 2.0" value={engine} onChange={(e) => setEngine(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Degvielas tips</label>
              <select value={fuel} onChange={(e) => setFuel(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', boxSizing: 'border-box' }}>
                <option>Dīzelis</option>
                <option>Benzīns</option>
                <option>Hibrīds</option>
                <option>Elektriskais</option>
                <option>Gāze / Benzīns</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Ātrumkārba</label>
              <select value={gearbox} onChange={(e) => setGearbox(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', boxSizing: 'border-box' }}>
                <option>Automāts</option>
                <option>Mehāniska</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Apraksts</label>
              <textarea placeholder="Papildus informācija par auto..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '120px', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Telefona numurs</label>
              <input type="text" placeholder="Piem. +371 29000000" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>E-pasts</label>
              <input type="email" placeholder="Piem. epasts@inbox.lv" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>

            {/* BILŽU SADAĻA */}
            <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Bildes (pirmā ir galvenā titulbilde):</label>
              <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '10px' }}>
                Izmanto bultiņas <b>← →</b>, lai mainītu bilžu secību.
              </span>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {images.map((img, i) => {
                  const previewUrl = img.isNew && img.file ? URL.createObjectURL(img.file) : img.url
                  const isMain = i === 0

                  return (
                    <div key={i} style={{ position: 'relative', width: '120px', height: '120px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', border: isMain ? '3px solid #2563eb' : '1px solid #cbd5e1' }}>
                      <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      
                      <button 
                        type="button" 
                        onClick={() => removeImage(i)} 
                        style={{ 
                          position: 'absolute', top: '4px', right: '4px', 
                          background: '#ef4444', color: 'white', border: 'none', 
                          borderRadius: '50%', width: '22px', height: '22px', 
                          cursor: 'pointer', fontWeight: 'bold', display: 'flex', 
                          alignItems: 'center', justifyContent: 'center', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                        }}
                      >
                        ×
                      </button>

                      <div style={{ 
                        position: 'absolute', bottom: '0', left: '0', right: '0', 
                        background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'space-between', padding: '3px 6px', alignItems: 'center' 
                      }}>
                        <button 
                          type="button" 
                          onClick={() => moveImage(i, 'left')} 
                          disabled={i === 0}
                          style={{ background: 'none', border: 'none', color: i === 0 ? '#64748b' : '#fff', cursor: i === 0 ? 'default' : 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                        >
                          ◀
                        </button>
                        
                        <span style={{ color: '#fff', fontSize: '10px', fontWeight: '600' }}>
                          {isMain ? 'Tituls' : `${i + 1}.`}
                        </span>

                        <button 
                          type="button" 
                          onClick={() => moveImage(i, 'right')} 
                          disabled={i === images.length - 1}
                          style={{ background: 'none', border: 'none', color: i === images.length - 1 ? '#64748b' : '#fff', cursor: i === images.length - 1 ? 'default' : 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                        >
                          ▶
                        </button>
                      </div>
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

        {/* Labā puse: Reklāmas baneris */}
        <div style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '20px' }}>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Ekskluzīvs baneris šeit!<br/><span style={{ fontSize: '12px' }}>(Maksimāla uzmanība)</span></p>
          </div>
        </div>

      </div>
    </div>
  )
}
