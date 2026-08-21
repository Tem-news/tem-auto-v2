'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function PievienotAutoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState<string | number>(2018)
  const [price, setPrice] = useState('')
  const [mileage, setMileage] = useState('')
  const [engine, setEngine] = useState('')
  const [fuel, setFuel] = useState('Dīzelis')
  const [gearbox, setGearbox] = useState('Automāts')
  const [description, setDescription] = useState('')

  // Kontakti (E-pasts ir obligāts, Tālrunis neobligāts)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // Bildes
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        if (session.user.email) setEmail(session.user.email)
      }
    })
  }, [router])

  const addFiles = (files: FileList | File[]) => {
    const newImages = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))

    setImages((prev) => [...prev, ...newImages])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= images.length) return

    const updated = [...images]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    setImages(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (!user) throw new Error('Jums jābūt ielogotamies!')
      if (!email) throw new Error('E-pasts ir obligāts kontakts!')
      if (!make.trim() || !model.trim()) throw new Error('Marka un modelis ir obligāti lauki!')

      const uploadedUrls: string[] = []

      for (const img of images) {
        const fileExt = img.file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('car-images')
          .upload(fileName, img.file)

        if (uploadError) {
          throw new Error('Kļūda augšupielādējot attēlu: ' + uploadError.message)
        }

        const { data: publicUrlData } = supabase.storage
          .from('car-images')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrlData.publicUrl)
      }

      const mainImageUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : null

      const { error: insertError } = await supabase.from('cars').insert([
        {
          make,
          model,
          year: year ? Number(year) : null,
          price: price ? Number(price) : null,
          mileage: mileage ? Number(mileage) : null,
          engine: engine || null,
          fuel,
          gearbox,
          description: description || null,
          phone: phone || null,
          email,
          image: mainImageUrl,
          image_url: mainImageUrl,
          images: uploadedUrls,
          user_id: user.id,
        },
      ])

      if (insertError) {
        throw new Error('Kļūda saglabājot sludinājumu: ' + insertError.message)
      }

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Kaut kas nogāja greizi!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '1150px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      
      {/* Divu kolonnu izkārtojums: Forma kreisajā pusē, reklāma labajā */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', justifyContent: 'center' }}>
        
        {/* Kreisā puse: Forma */}
        <div style={{ flex: 1, maxWidth: '800px', backgroundColor: '#ffffff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>
            Pievienot jaunu auto sludinājumu
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            Aizpildiet informāciju par auto. Lauki nav obligāti, izņemot marku, modeli un e-pastu.
          </p>

          {errorMsg && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Marka & Modelis */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                  Marka <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="piem., Alfa Romeo"
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                  Modelis <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="piem., Giulia"
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Gads, Cena un Nobraukums */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Gads</label>
                <input
                  type="number"
                  min="1950"
                  max="2027"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="piem., 2018"
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Cena (€)</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Pēc vienošanās"
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Nobraukums (km)</label>
                <input
                  type="number"
                  min="0"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="piem., 180000"
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Motors, Degviela & Ātrumkārba */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Motors</label>
                <input
                  type="text"
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  placeholder="piem., 2.0 D"
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Degviela</label>
                <select
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '15px', boxSizing: 'border-box' }}
                >
                  <option value="Dīzelis">Dīzelis</option>
                  <option value="Benzīns">Benzīns</option>
                  <option value="Benzīns/Gāze">Benzīns / Gāze</option>
                  <option value="Hibrīds">Hibrīds</option>
                  <option value="Elektriskais">Elektriskais</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Ātrumkārba</label>
                <select
                  value={gearbox}
                  onChange={(e) => setGearbox(e.target.value)}
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '15px', boxSizing: 'border-box' }}
                >
                  <option value="Automāts">Automāts</option>
                  <option value="Manuālis">Manuālis</option>
                </select>
              </div>
            </div>

            {/* KONTAKTINFORMĀCIJA */}
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#0f172a' }}>Pārdevēja kontakti</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                    E-pasts <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vards@epasts.lv"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                    Tālruņa numurs <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(neobligāts)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+371 20000000"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* BILŽU IELĀDE */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                Auto fotoattēli <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(neobligāti)</span>
              </label>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
                }}
                style={{
                  border: `2px dashed ${isDragging ? '#16a34a' : '#cbd5e1'}`,
                  backgroundColor: isDragging ? '#f0fdf4' : '#f8fafc',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>📷</div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#334155', margin: '0 0 4px 0' }}>
                    Ievelciet bildes šeit vai noklikšķiniet, lai izvēlētos
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && addFiles(e.target.files)}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                  {images.map((img, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        border: index === 0 ? '2px solid #16a34a' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        padding: '4px',
                        backgroundColor: '#fff'
                      }}
                    >
                      {index === 0 && (
                        <span style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: '#16a34a', color: '#fff', fontSize: '9px', padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold', zIndex: 2 }}>
                          Titulbilde
                        </span>
                      )}
                      <img src={img.preview} alt={`Foto ${index + 1}`} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveImage(index, 'left')}
                          style={{ padding: '2px 6px', fontSize: '11px', cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{ color: '#ef4444', border: 'none', background: 'none', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          ✕
                        </button>
                        <button
                          type="button"
                          disabled={index === images.length - 1}
                          onClick={() => moveImage(index, 'right')}
                          style={{ padding: '2px 6px', fontSize: '11px', cursor: index === images.length - 1 ? 'default' : 'pointer', opacity: index === images.length - 1 ? 0.3 : 1 }}
                        >
                          →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Apraksts */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Apraksts</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Aprakstiet auto stāvokli (neobligāts)..."
                style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#94a3b8' : '#16a34a',
                color: '#ffffff',
                padding: '14px',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '16px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saglabā sludinājumu...' : 'Publicēt sludinājumu'}
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
