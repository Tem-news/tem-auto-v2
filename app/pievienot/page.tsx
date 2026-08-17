'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

// Marku un modeļu datubāze ar pareizi noformētām atslēgām
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

  // Forma valstis & lauki
  const [make, setMake] = useState('BMW')
  const [model, setModel] = useState('3. sērija')
  const [year, setYear] = useState(2018)
  const [price, setPrice] = useState('')
  const [engine, setEngine] = useState('')
  const [fuel, setFuel] = useState('Dīzelis')
  const [gearbox, setGearbox] = useState('Automāts')
  const [description, setDescription] = useState('')
  
  // Bildes un Drag & Drop
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
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

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (!user) throw new Error('Jums jābūt ielogotamies!')

      let imageUrl = ''

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('car-images')
          .upload(fileName, imageFile)

        if (uploadError) {
          throw new Error('Kļūda augšupielādējot attēlu: ' + uploadError.message)
        }

        const { data: publicUrlData } = supabase.storage
          .from('car-images')
          .getPublicUrl(fileName)

        imageUrl = publicUrlData.publicUrl
      }

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
          image_url: imageUrl,
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
    <div style={{ maxWidth: '650px', margin: '40px auto', padding: '28px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>
        Pievienot jaunu auto sludinājumu
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
        Aizpildiet informāciju par savu spēkratu un pievienojiet fotoattēlu.
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
              Marka
            </label>
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
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
              Modelis
            </label>
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
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
              Izlaiduma gads
            </label>
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
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
              Cena (€)
            </label>
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
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
              Motors (piem., 2.0)
            </label>
            <input
              type="text"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              placeholder="2.0 D"
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
              Degviela
            </label>
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
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
              Ātrumkārba
            </label>
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

        {/* DRAG & DROP BILDES LAUKS */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
            Auto fotoattēls (Ievilkt vai izvēlēties)
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragging ? '#16a34a' : '#cbd5e1'}`,
              backgroundColor: isDragging ? '#f0fdf4' : '#f8fafc',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {imagePreview ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <img
                  src={imagePreview}
                  alt="Priekšskatījums"
                  style={{ maxHeight: '180px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
                >
                  ✕ Noņemt bildi
                </button>
              </div>
            ) : (
              <label style={{ cursor: 'pointer', display: 'block' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#334155', margin: '0 0 4px 0' }}>
                  Ievelciet bildi šeit vai noklikšķiniet, lai izvēlētos
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                  Atbalstīti formāti: JPG, PNG, WEBP
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Apraksts */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
            Papildus apraksts
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Aprakstiet auto stāvokli, komplektāciju..."
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
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '8px',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
          }}
        >
          {loading ? 'Saglabā sludinājumu...' : 'Publicēt sludinājumu'}
        </button>
      </form>
    </div>
  )
}
