'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const CAR_DATA: Record<string, string[]> = {
  "Audi": ["A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "TT", "E-Tron"],
  "BMW": ["1. sērija", "2. sērija", "3. sērija", "4. sērija", "5. sērija", "6. sērija", "7. sērija", "X1", "X3", "X5", "X6", "X7", "i4", "iX"],
  "Mercedes-Benz": ["A-Klase", "C-Klase", "E-Klase", "S-Klase", "CLA", "CLS", "GLA", "GLC", "GLE", "GLS", "G-Klase", "EQE", "EQS"],
  "Volkswagen": ["Golf", "Passat", "Arteon", "Tiguan", "Touareg", "Touran", "Sharan", "Polo", "ID.3", "ID.4"],
  "Volvo": ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
  "Toyota": ["Avensis", "Camry", "Corolla", "RAV4", "Land Cruiser", "Yaris", "C-HR", "Prius"],
  "Honda": ["Accord", "Civic", "CR-V", "HR-V"],
  "Ford": ["Focus", "Mondeo", "Fiesta", "Kuga", "Mustang", "Explorer", "Galaxy", "S-Max"],
  "Skoda": ["Octavia", "Superb", "Kodiaq", "Karoq", "Fabia"],
  "Hyundai": ["i30", "i40", "Tucson", "Santa Fe", "Ioniq 5", "Kona"],
  "Kia": ["Ceed", "Optima", "Sportage", "Sorento", "EV6"],
  "Nissan": ["Qashqai", "X-Trail", "Juke", "Leaf"],
  "Opel": ["Astra", "Insignia", "Zafira", "Mokka", "Corsa"],
  "Lexus": ["IS", "GS", "LS", "RX", "NX", "UX"],
  "Porsche": ["911", "Cayenne", "Panamera", "Macan", "Taycan"]
}

export default function PievienotAutoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const [make, setMake] = useState('BMW')
  const [model, setModel] = useState('3. sērija')
  const [year, setYear] = useState(2018)
  const [price, setPrice] = useState('')
  const [engine, setEngine] = useState('')
  const [fuel, setFuel] = useState('Dīzelis')
  const [gearbox, setGearbox] = useState('Automāts')
  const [description, setDescription] = useState('')

  // Vairāku bilžu stāvoklis
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    })
  }, [router])

  const handleMakeChange = (selectedMake: string) => {
    setMake(selectedMake)
    if (CAR_DATA[selectedMake] && CAR_DATA[selectedMake].length > 0) {
      setModel(CAR_DATA[selectedMake][0])
    } else {
      setModel('')
    }
  }

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

      const uploadedUrls: string[] = []

      // Augšupielādē visas bildes
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

      const mainImageUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : ''

      const { error: insertError } = await supabase.from('cars').insert([
        {
          make,
          model,
          year: Number(year),
          price: Number(price),
          engine,
          fuel,
          gearbox,
          description,
          image_url: mainImageUrl, // Titulbilde (pirmā bilde)
          images: uploadedUrls,    // Visi fotoattēli
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
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '28px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>
        Pievienot jaunu auto sludinājumu
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
        Aizpildiet informāciju par savu spēkratu un pievienojiet fotoattēlus.
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
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Marka</label>
            <select
              value={make}
              onChange={(e) => handleMakeChange(e.target.value)}
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '15px' }}
            >
              {Object.keys(CAR_DATA).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Modelis</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '15px' }}
            >
              {(CAR_DATA[make] || []).map((mod) => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Gads & Cena */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Izlaiduma gads</label>
            <input
              type="number"
              required
              min="1950"
              max="2027"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Cena (€)</label>
            <input
              type="number"
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="3500"
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
              placeholder="2.0 D"
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

        {/* VAIRĀKU BILŽU IELĀDES ZONA */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
            Auto fotoattēli (Pirmā būs titulbilde)
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
                Ievelciet bildes šeit vai noklikšķiniet, lai izvēlētos vairākas
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

          {/* BILŽU SARAKSTS UN SECĪBAS MAIŅA */}
          {images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
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
                    <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#16a34a', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', zIndex: 2 }}>
                      Titulbilde
                    </span>
                  )}
                  <img src={img.preview} alt={`Foto ${index + 1}`} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '4px' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveImage(index, 'left')}
                      style={{ padding: '2px 6px', fontSize: '12px', cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{ color: '#ef4444', border: 'none', background: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ✕
                    </button>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => moveImage(index, 'right')}
                      style={{ padding: '2px 6px', fontSize: '12px', cursor: index === images.length - 1 ? 'default' : 'pointer', opacity: index === images.length - 1 ? 0.3 : 1 }}
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
            placeholder="Aprakstiet auto stāvokli..."
            style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
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
  )
}
