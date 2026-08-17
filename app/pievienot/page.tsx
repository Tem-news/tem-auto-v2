'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

// Auto marku un modeļu datubāze ieteikumiem
const CAR_DATA: Record<string, string[]> = {
  'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'e-tron'],
  'BMW': ['1. sērija', '3. sērija', '5. sērija', '7. sērija', 'X1', 'X3', 'X5', 'X6', 'X7', 'M3', 'M5'],
  'Citroen': ['Berlingo', 'C3', 'C4', 'C5', 'C5 Aircross', 'Jumper', 'Jumpy'],
  'Ford': ['C-Max', 'Fiesta', 'Focus', 'Galaxy', 'Kuga', 'Mondeo', 'Mustang', 'Ranger', 'S-Max', 'Transit'],
  'Honda': ['Accord', 'Civic', 'CR-V', 'HR-V', 'Jazz'],
  'Hyundai': ['Elantra', 'Ioniq', 'i20', 'i30', 'Santa Fe', 'Tucson'],
  'Kia': ['Ceed', 'Optima', 'Rio', 'Sorento', 'Sportage'],
  'Lexus': ['CT', 'GS', 'IS', 'LS', 'NX', 'RX'],
  'Mercedes-Benz': ['A-Klase', 'C-Klase', 'E-Klase', 'S-Klase', 'CLA', 'CLE', 'GLE', 'GLC', 'GLS', 'Sprinter', 'Vito'],
  'Nissan': ['Juke', 'Leaf', 'Navara', 'Qashqai', 'X-Trail'],
  'Opel': ['Astra', 'Corsa', 'Insignia', 'Mokka', 'Vivaro', 'Zafira'],
  'Peugeot': ['208', '308', '508', '2008', '3008', '5008', 'Partner', 'Boxer'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  'Renault': ['Clio', 'Espace', 'Kadjar', 'Koleos', 'Megane', 'Master', 'Trafic'],
  'SEAT': ['Alhambra', 'Ateca', 'Ibiza', 'Leon', 'Tarraco'],
  'Skoda': ['Fabia', 'Kamiq', 'Karoq', 'Kodiaq', 'Octavia', 'Superb'],
  'Subaru': ['Forester', 'Impreza', 'Legacy', 'Outback', 'XV'],
  'Toyota': ['Avensis', 'Camry', 'Corolla', 'Hilux', 'Land Cruiser', 'Prius', 'RAV4', 'Yaris'],
  'Volkswagen': ['Arteon', 'Golf', 'Passat', 'Polo', 'Sharan', 'Tiguan', 'Touareg', 'Touran', 'Transporter', 'T-Roc'],
  'Volvo': ['C30', 'S60', 'S80', 'S90', 'V60', 'V70', 'V90', 'XC60', 'XC70', 'XC90']
}

export default function PievienotAuto() {
  const router = useRouter()

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [price, setPrice] = useState('')
  const [mileage, setMileage] = useState('')
  const [engine, setEngine] = useState('')
  const [fuelType, setFuelType] = useState('Dīzelis')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])

  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Failu apstrāde (izmantojama gan no pogas, gan ievelkot)
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const newUploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `cars/${fileName}`

      const { error } = await supabase.storage
        .from('car-images')
        .upload(filePath, file)

      if (error) {
        console.error('Kļūda augšupielādējot bildi:', error)
        alert('Kļūda augšupielādējot attēlu: ' + error.message)
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('car-images')
          .getPublicUrl(filePath)

        if (publicUrlData?.publicUrl) {
          newUploadedUrls.push(publicUrlData.publicUrl)
        }
      }
    }

    setImages((prev) => [...prev, ...newUploadedUrls])
    setUploading(false)
  }

  // Izvēlas caur pogu
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }

  // Drag & Drop notikumi
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  // Attēla dzēšana
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  // Attēla pārvietošana
  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return
    const updated = [...images]
    const [movedItem] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, movedItem)
    setImages(updated)
  }

  // Sludinājuma saglabāšana
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!make.trim() || !model.trim() || !price) {
      alert('Lūdzu, aizpildi obligātos laukus (Marka, Modelis, Cena)!')
      return
    }

    setSaving(true)

    try {
      const mainImage = images.length > 0 ? images[0] : ''
      const otherImages = images.length > 1 ? images.slice(1) : []
      const autoTitle = `${make.trim()} ${model.trim()}${year ? ` (${year})` : ''}`

      const newCar: any = {
        title: autoTitle,
        make: make.trim(),
        model: model.trim(),
        year: year ? Number(year) : null,
        price: Number(price),
        mileage: mileage ? Number(mileage) : null,
        engine: engine.trim(),
        fuelType: fuelType,
        fuel_type: fuelType,
        phone: phone.trim(),
        description: description.trim(),
        image: mainImage,
        images: otherImages
      }

      const { data, error } = await supabase
        .from('cars')
        .insert([newCar])
        .select()

      if (error) {
        console.error('Kļūda saglabājot sludinājumu:', error)
        alert('Neizdevās saglabāt sludinājumu: ' + error.message)
      } else if (data && data.length > 0) {
        alert('Sludinājums veiksmīgi pievienots!')
        router.push(`/auto/${data[0].id}`)
        router.refresh()
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      console.error('Nezināma kļūda:', err)
      alert('Kļūda pievienojot sludinājumu: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  const availableModels = make && CAR_DATA[make] ? CAR_DATA[make] : []

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
        ← Atpakaļ uz sarakstu
      </Link>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>
        Pievienot jaunu auto sludinājumu
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* Marka */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Marka *</label>
          <input
            type="text"
            list="makes-list"
            value={make}
            onChange={(e) => {
              setMake(e.target.value)
              setModel('')
            }}
            placeholder="Izvēlies vai ieraksti marku (piem., BMW, Audi)"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
          <datalist id="makes-list">
            {Object.keys(CAR_DATA).map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>

        {/* Modelis */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Modelis *</label>
          <input
            type="text"
            list="models-list"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Izvēlies vai ieraksti modeli (piem., 3. sērija, A4)"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
          <datalist id="models-list">
            {availableModels.map((mod) => (
              <option key={mod} value={mod} />
            ))}
          </datalist>
        </div>

        {/* Gads un Cena */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Gads</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2018"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Cena (€) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="4500"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Nobraukums un Dzinējs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Nobraukums (km)</label>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="180000"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Dzinējs</label>
            <input
              type="text"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              placeholder="2.0 D"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Degviela un Telefons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Degvielas tips</label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', backgroundColor: '#fff' }}
            >
              <option value="Dīzelis">Dīzelis</option>
              <option value="Benzīns">Benzīns</option>
              <option value="Benzīns / Gāze">Benzīns / Gāze</option>
              <option value="Hibrīds">Hibrīds</option>
              <option value="Elektrība">Elektrība</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Tālruņa numurs</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+371 20000000"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Moderns Drag & Drop Attēlu laukums */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Attēli (Pirmā bilde būs titulbilde)</label>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragging ? '#2563eb' : '#d1d5db'}`,
              backgroundColor: isDragging ? '#eff6ff' : '#f9fafb',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s, border-color 0.2s',
              position: 'relative'
            }}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            <div style={{ pointerEvents: 'none' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>
                📁 Ievelc bildes šeit vai uzklikšķini, lai izvēlētos
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                Atbalstītie formāti: JPG, PNG, WEBP (var izvēlēties vairākus)
              </p>
            </div>
          </div>

          {uploading && <p style={{ fontSize: '13px', color: '#2563eb', marginTop: '8px' }}>Augšupielādē attēlus...</p>}

          {/* Sīktēlu saraksts */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '14px' }}>
            {images.map((img, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  width: '120px',
                  height: '90px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: idx === 0 ? '3px solid #2563eb' : '1px solid #d1d5db',
                  backgroundColor: '#f9fafb'
                }}
              >
                <img src={img} alt={`Bilde ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                {idx === 0 && (
                  <span style={{ position: 'absolute', top: '2px', left: '2px', backgroundColor: '#2563eb', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold' }}>
                    Titulbilde
                  </span>
                )}

                <div style={{ position: 'absolute', bottom: '2px', right: '2px', display: 'flex', gap: '2px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '2px', borderRadius: '4px' }}>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveImage(idx, idx - 1)}
                      style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', padding: '0 3px' }}
                      title="Pārvietot pa kreisi"
                    >
                      ◄
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveImage(idx, idx + 1)}
                      style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', padding: '0 3px' }}
                      title="Pārvietot pa labi"
                    >
                      ►
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: '0 3px' }}
                    title="Dzēst bildi"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Apraksts */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>Apraksts</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Ievadi papildus informāciju par auto stāvokli, aprīkojumu u.c."
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        </div>

        {/* Iesniegšanas poga */}
        <button
          type="submit"
          disabled={saving || uploading}
          style={{
            padding: '14px',
            backgroundColor: saving ? '#9ca3af' : '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: saving ? 'not-allowed' : 'pointer',
            marginTop: '10px'
          }}
        >
          {saving ? 'Saglabā sludinājumu...' : 'Publicēt sludinājumu'}
        </button>
      </form>
    </div>
  )
}
