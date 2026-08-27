'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

// Populārāko auto marku un to modeļu datubāze ieteikumiem
const CAR_DATABASE: { [key: string]: string[] } = {
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT'],
  'BMW': ['1. sērija', '3. sērija', '5. sērija', '7. sērija', 'X1', 'X3', 'X5', 'X6', 'Z4'],
  'Ford': ['Focus', 'Fiesta', 'Mondeo', 'Kuga', 'Puma', 'Mustang', 'Explorer', 'Transit'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Jazz'],
  'Hyundai': ['i10', 'i20', 'i30', 'Tucson', 'Santa Fe', 'Kona'],
  'Kia': ['Ceed', 'Sportage', 'Sorento', 'Rio', 'Stonic', 'Picanto'],
  'Mazda': ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-30', 'MX-5'],
  'Mercedes-Benz': ['A-klase', 'C-klase', 'E-klase', 'S-klase', 'GLA', 'GLB', 'GLC', 'GLE', 'ML'],
  'Nissan': ['Qashqai', 'X-Trail', 'Juke', 'Micra', 'Leaf'],
  'Opel': ['Astra', 'Corsa', 'Insignia', 'Mokka', 'Zafira', 'Vectra'],
  'Peugeot': ['208', '308', '508', '2008', '3008', '5008'],
  'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Scenic', 'Laguna'],
  'Skoda': ['Octavia', 'Superb', 'Fabia', 'Kodiaq', 'Karoq', 'Kamiq'],
  'Toyota': ['Corolla', 'Camry', 'RAV4', 'Yaris', 'Avensis', 'C-HR', 'Land Cruiser'],
  'Volkswagen': ['Golf', 'Passat', 'Polo', 'Tiguan', 'Touareg', 'Touran', 'Arteon', 'Transporter'],
  'Volvo': ['S60', 'S90', 'V40', 'V60', 'V90', 'XC40', 'XC60', 'XC90']
}

export default function PievienotSludinajumu() {
  const router = useRouter()
  
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  
  // Ieteikumu sarakstu stāvokļi
  const [makeSuggestions, setMakeSuggestions] = useState<string[]>([])
  const [modelSuggestions, setModelSuggestions] = useState<string[]>([])

  const [year, setYear] = useState('')
  const [price, setPrice] = useState('')
  const [mileage, setMileage] = useState('')
  const [engine, setEngine] = useState('')
  const [fuel, setFuel] = useState('Dīzelis')
  const [transmission, setTransmission] = useState('Automāts')
  
  const [color, setColor] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [vin, setVin] = useState('')

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Markas rakstīšanas apstrāde un ieteikumu filtrēšana
  const handleMakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMake(value)

    if (value.trim().length > 0) {
      const allMakes = Object.keys(CAR_DATABASE)
      const filtered = allMakes.filter(m => m.toLowerCase().includes(value.toLowerCase()))
      setMakeSuggestions(filtered)
    } else {
      setMakeSuggestions([])
    }
  }

  // Modelis rakstīšanas apstrāde un ieteikumu filtrēšana
  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setModel(value)

    // Noskaidrojam, kādi modeļi ir pieejami šai markai
    let availableModels: string[] = []
    const matchedMakeKey = Object.keys(CAR_DATABASE).find(m => m.toLowerCase() === make.toLowerCase())
    
    if (matchedMakeKey) {
      availableModels = CAR_DATABASE[matchedMakeKey]
    } else {
      // Ja marka nav precīzi atpazīta, piedāvājam modeļus no visām markām
      availableModels = Array.from(new Set(Object.values(CAR_DATABASE).flat()))
    }

    if (value.trim().length > 0) {
      const filtered = availableModels.filter(mod => mod.toLowerCase().includes(value.toLowerCase()))
      setModelSuggestions(filtered)
    } else {
      setModelSuggestions(availableModels) // Ja lauks ir tukšs, rādām visus tās markas modeļus
    }
  }

  const formatNumberWithSpaces = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '')
    if (!numbersOnly) return ''
    return numbersOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(formatNumberWithSpaces(e.target.value))
  }

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMileage(formatNumberWithSpaces(e.target.value))
  }

  const handleImageFiles = (files: FileList | File[]) => {
    const newImageUrls: string[] = []
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file)
      newImageUrls.push(url)
    })
    setImages(prev => [...prev, ...newImageUrls])
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newImages.length) return
    const temp = newImages[index]
    newImages[index] = newImages[targetIndex]
    newImages[targetIndex] = temp
    setImages(newImages)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!make.trim() || !model.trim() || !email.trim()) {
      setErrorMsg('Lūdzu aizpildiet obligātos laukus: Marka, Modelis un E-pasts!')
      return
    }

    setLoading(true)

    const mainImage = images.length > 0 ? images[0] : null
    const cleanPrice = price ? Number(price.replace(/\s/g, '')) : null
    const cleanMileage = mileage ? Number(mileage.replace(/\s/g, '')) : null

    const { error } = await supabase.from('cars').insert([
      {
        make: make.trim(),
        model: model.trim(),
        year: year ? Number(year) : null,
        price: cleanPrice,
        mileage: cleanMileage,
        engine: engine.trim() || null,
        fuel: fuel.trim() || null,
        transmission: transmission.trim() || null,
        color: color.trim() || null,
        body_type: bodyType.trim() || null,
        vin: vin.trim() || null,
        email: email.trim(),
        phone: phone.trim() || null,
        description: description.trim() || null,
        image: mainImage,
      }
    ])

    setLoading(false)

    if (error) {
      console.error('Kļūda saglabājot sludinājumu:', error)
      setErrorMsg('Neizdevās saglabāt sludinājumu. Pārbaudiet Supabase tabulas kolonnas.')
    } else {
      router.push('/')
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '16px 12px', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 240px', gap: '16px', alignItems: 'start', width: '100%' }}>
        
        {/* KREISĀ PUSE: Reklāmas baneri */}
        <div style={{ position: 'sticky', top: '80px', alignSelf: 'start', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Globālais baneris šeit!</p>
          </div>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Globālais baneris šeit!</p>
          </div>
        </div>

        {/* VIDUS: Forma */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', minWidth: 0 }}>
          
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>Pievienot jaunu auto sludinājumu</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0' }}>Aizpildiet informāciju par auto. Lauki nav obligāti, izņemot marku, modeli un e-pastu.</p>

          {errorMsg && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* 1. Rinda: Marka un Modelis ar automātisko ieteikšanu */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* MARKA */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Marka *</label>
                <input
                  type="text"
                  placeholder="piem., BMW"
                  value={make}
                  onChange={handleMakeChange}
                  onFocus={() => {
                    if (!make) setMakeSuggestions(Object.keys(CAR_DATABASE))
                  }}
                  onBlur={() => setTimeout(() => setMakeSuggestions([]), 200)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
                {makeSuggestions.length > 0 && (
                  <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '0 0 6px 6px', maxHeight: '180px', overflowY: 'auto', listStyle: 'none', margin: 0, padding: 0, zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {makeSuggestions.map((item, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          setMake(item)
                          setMakeSuggestions([])
                          setModel('') // Notīra modeli, kad maina marku
                        }}
                        style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* MODELIS */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Modelis *</label>
                <input
                  type="text"
                  placeholder="piem., 3. sērija"
                  value={model}
                  onChange={handleModelChange}
                  onFocus={() => {
                    let available = CAR_DATABASE[make] || Array.from(new Set(Object.values(CAR_DATABASE).flat()))
                    setModelSuggestions(available)
                  }}
                  onBlur={() => setTimeout(() => setModelSuggestions([]), 200)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
                {modelSuggestions.length > 0 && (
                  <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '0 0 6px 6px', maxHeight: '180px', overflowY: 'auto', listStyle: 'none', margin: 0, padding: 0, zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {modelSuggestions.map((item, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          setModel(item)
                          setModelSuggestions([])
                        }}
                        style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>

            {/* 2. Rinda: Gads, Cena, Nobraukums */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Gads</label>
                <input
                  type="number"
                  placeholder="2018"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Cena (€)</label>
                <input
                  type="text"
                  placeholder="piem., 5 800"
                  value={price}
                  onChange={handlePriceChange}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Nobraukums (km)</label>
                <input
                  type="text"
                  placeholder="piem., 180 000"
                  value={mileage}
                  onChange={handleMileageChange}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* 3. Rinda: Motors, Degviela, Ātrumkārba */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Motors</label>
                <input
                  type="text"
                  placeholder="piem., 2.0 D"
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Degviela</label>
                <select
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px', backgroundColor: '#fff' }}
                >
                  <option value="Dīzelis">Dīzelis</option>
                  <option value="Benzīns">Benzīns</option>
                  <option value="Hibrīds">Hibrīds</option>
                  <option value="Elektrība">Elektrība</option>
                  <option value="Gāze / Benzīns">Gāze / Benzīns</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Ātrumkārba</label>
                <input
                  type="text"
                  placeholder="piem., Automāts, 8 ātrumi"
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* 4. Rinda: Krāsa, Virsbūves tips, VIN kods */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Krāsa</label>
                <input
                  type="text"
                  placeholder="piem., Melna metalika"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Virsbūves tips</label>
                <input
                  type="text"
                  placeholder="piem., Universāls / Sedans"
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>VIN kods</label>
                <input
                  type="text"
                  placeholder="piem., WBA..."
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Pārdevēja kontakti */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '4px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', margin: '0 0 12px 0' }}>Pārdevēja kontakti</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>E-pasts *</label>
                  <input
                    type="email"
                    placeholder="jusu@epasts.lv"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Tālruņa numurs (neobligāts)</label>
                  <input
                    type="text"
                    placeholder="+371 20000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            {/* Bilžu vilkšanas lauks */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Auto fotoattēli (neobligāti)</label>
              
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.multiple = true
                  input.accept = 'image/*'
                  input.onchange = (e: any) => {
                    if (e.target.files) handleImageFiles(e.target.files)
                  }
                  input.click()
                }}
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
                <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>Ievelciet bildes šeit vai noklikšķiniet, lai izvēlētos</div>
              </div>

              {images.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>Augšupielādētās bildes (pirmā bilde būs titulbilde):</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {images.map((imgUrl, index) => (
                      <div key={index} style={{ position: 'relative', width: '90px', height: '70px', border: index === 0 ? '2px solid #16a34a' : '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                        <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        
                        {index === 0 && (
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(22, 163, 74, 0.85)', color: '#fff', fontSize: '9px', textAlign: 'center', fontWeight: 'bold', padding: '1px 0' }}>
                            Titulbilde
                          </div>
                        )}

                        <div style={{ position: 'absolute', bottom: 2, right: 2, display: 'flex', gap: '2px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '1px' }}>
                          {index > 0 && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); moveImage(index, 'up'); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '10px', cursor: 'pointer', padding: '0 2px' }}>◀</button>
                          )}
                          {index < images.length - 1 && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); moveImage(index, 'down'); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '10px', cursor: 'pointer', padding: '0 2px' }}>▶</button>
                          )}
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(index); }} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '10px', cursor: 'pointer', padding: '0 2px', fontWeight: 'bold' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Apraksts */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Apraksts</label>
              <textarea
                rows={4}
                placeholder="Aprakstiet auto stāvokli, komplektāciju..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px', resize: 'vertical' }}
              />
            </div>

            {/* Poga */}
            <div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#15803d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '11px 20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {loading ? 'Saglabā...' : 'Pievienot sludinājumu'}
              </button>
            </div>

          </form>
        </div>

        {/* LABĀ PUSE: Reklāmas baneri */}
        <div style={{ position: 'sticky', top: '80px', alignSelf: 'start', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Globālais baneris šeit!</p>
          </div>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Globālais baneris šeit!</p>
          </div>
        </div>

      </div>
    </div>
  )
}
