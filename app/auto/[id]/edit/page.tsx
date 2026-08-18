'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function RedigetAutoPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [carId, setCarId] = useState<string | null>(null)

  // Nemainīgie lauki (Marka un Modelis)
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')

  // Labojamie lauki
  const [year, setYear] = useState<string | number>('')
  const [price, setPrice] = useState('')
  const [mileage, setMileage] = useState('')
  const [engine, setEngine] = useState('')
  const [fuel, setFuel] = useState('Dīzelis')
  const [gearbox, setGearbox] = useState('Automāts')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // Bildes
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      // Paņemam ID no URL adreses (piemēram, ja URL ir /auto/edit?id=xyz vai caur citu parametru)
      const params = new URLSearchParams(window.location.search)
      const id = params.get('id')

      if (!id) {
        setErrorMsg('Nav norādīts sludinājuma ID.')
        setLoading(false)
        return
      }

      setCarId(id)

      const { data: car, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !car) {
        setErrorMsg('Sludinājums netika atrasts.')
        setLoading(false)
        return
      }

      if (car.user_id !== session.user.id) {
        setErrorMsg('Jums nav tiesību rediģēt šo sludinājumu.')
        setLoading(false)
        return
      }

      setMake(car.make || '')
      setModel(car.model || '')
      setYear(car.year || '')
      setPrice(car.price ? String(car.price) : '')
      setMileage(car.mileage ? String(car.mileage) : '')
      setEngine(car.engine || '')
      setFuel(car.fuel || 'Dīzelis')
      setGearbox(car.gearbox || 'Automāts')
      setDescription(car.description || '')
      setPhone(car.phone || '')
      setEmail(car.email || session.user.email || '')

      if (car.images && car.images.length > 0) {
        setExistingImages(car.images)
      } else if (car.image_url || car.image) {
        setExistingImages([car.image_url || car.image])
      }

      setLoading(false)
    }

    init()
  }, [router])

  const addNewFiles = (files: FileList | File[]) => {
    const added = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))

    setNewImages((prev) => [...prev, ...added])
  }

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!carId) return
    setSaving(true)
    setErrorMsg('')

    try {
      if (!user) throw new Error('Jums jābūt ielogotamies!')
      if (!email) throw new Error('E-pasts ir obligāts kontakts!')

      const uploadedUrls: string[] = []
      for (const img of newImages) {
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

      const allImages = [...existingImages, ...uploadedUrls]
      const mainImageUrl = allImages.length > 0 ? allImages[0] : null

      const { error: updateError } = await supabase
        .from('cars')
        .update({
          // Marku un modeli APZINĀTI neļaujam mainīt
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
          images: allImages,
        })
        .eq('id', carId)

      if (updateError) {
        throw new Error('Kļūda atjauninot sludinājumu: ' + updateError.message)
      }

      router.push(`/auto/${carId}`)
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Kaut kas nogāja greizi!')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Ielādē datus...</div>
  }

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '28px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>
        Rediģēt sludinājumu
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
        Marku un modeli mainīt nevar. Pārējos datus un bildes varat brīvi precizēt.
      </p>

      {errorMsg && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Marka & Modelis (BLOCKED / READONLY) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Marka</label>
            <input
              type="text"
              value={make}
              disabled
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '15px', cursor: 'not-allowed' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Modelis</label>
            <input
              type="text"
              value={model}
              disabled
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '15px', cursor: 'not-allowed' }}
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
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Cena (€)</label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Nobraukums (km)</label>
            <input
              type="number"
              min="0"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
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
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Degviela</label>
            <select
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '15px' }}
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
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '15px' }}
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
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Tālruņa numurs</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* BILDES */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
            Fotoattēli
          </label>

          {existingImages.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Esošās bildes:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                {existingImages.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={url} alt={`Esošā bilde ${idx + 1}`} style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              if (e.dataTransfer.files) addNewFiles(e.dataTransfer.files)
            }}
            style={{
              border: `2px dashed ${isDragging ? '#16a34a' : '#cbd5e1'}`,
              backgroundColor: isDragging ? '#f0fdf4' : '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            <label style={{ cursor: 'pointer', display: 'block' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>➕📷</div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#334155', margin: 0 }}>
                Pievienot vēl citas bildes
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && addNewFiles(e.target.files)}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {newImages.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
              {newImages.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', border: '1px solid #16a34a', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={img.preview} alt={`Jaunā bilde ${idx + 1}`} style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    ✕
                  </button>
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
            style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            backgroundColor: saving ? '#94a3b8' : '#2563eb',
            color: '#ffffff',
            padding: '14px',
            borderRadius: '10px',
            fontWeight: 'bold',
            fontSize: '16px',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saglabā izmaiņas...' : 'Saglabāt izmaiņas'}
        </button>
      </form>
    </div>
  )
}
