'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const POPULAR_MAKES = [
  'BMW', 'Audi', 'Volkswagen', 'Volvo', 'Toyota', 'Mercedes-Benz', 
  'Škoda', 'Ford', 'Hyundai', 'Kia', 'Nissan', 'Opel', 'Peugeot', 
  'Renault', 'Mazda', 'Honda', 'Lexus', 'Subaru', 'Tesla', 'Porsche'
]

const MODELS_BY_MAKE: { [key: string]: string[] } = {
  'BMW': ['1 sērija', '3 sērija', '5 sērija', '7 sērija', 'X1', 'X3', 'X5', 'X6', 'Z4'],
  'Audi': ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT'],
  'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Touareg', 'Polo', 'Touran', 'Transporter'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
  'Toyota': ['Corolla', 'Camry', 'RAV4', 'Land Cruiser', 'Yaris', 'Avensis', 'C-HR'],
  'Mercedes-Benz': ['A-klase', 'C-klase', 'E-klase', 'S-klase', 'GLC', 'GLE', 'ML'],
  'Škoda': ['Octavia', 'Superb', 'Fabia', 'Kodiaq', 'Karoq', 'Rapid'],
  'Ford': ['Focus', 'Mondeo', 'Fiesta', 'Kuga', 'S-Max', 'Ranger'],
  'Hyundai': ['i30', 'Tucson', 'Santa Fe', 'Kona', 'Ioniq'],
  'Kia': ['Ceed', 'Sportage', 'Sorento', 'Stonic', 'Niro'],
}

const COLORS = [
  { name: 'Melna', hex: '#111827', border: '#374151' },
  { name: 'Balta', hex: '#ffffff', border: '#d1d5db' },
  { name: 'Pelēka', hex: '#6b7280', border: '#4b5563' },
  { name: 'Sudraba', hex: '#e5e7eb', border: '#9ca3af' },
  { name: 'Zila', hex: '#2563eb', border: '#1d4ed8' },
  { name: 'Sarkana', hex: '#dc2626', border: '#b91c1c' },
  { name: 'Zaļa', hex: '#16a34a', border: '#15803d' },
  { name: 'Brūna', hex: '#78350f', border: '#451a03' },
  { name: 'Zelta', hex: '#d97706', border: '#b45309' },
  { name: 'Oranža', hex: '#ea580c', border: '#c2410c' },
  { name: 'Dzeltena', hex: '#eab308', border: '#ca8a04' },
  { name: 'Violeta', hex: '#7c3aed', border: '#6d28d9' }
]

const BODY_TYPES = [
  'Sedans', 'Universāls', 'Hečbeks', 'Apvidus (SUV)', 'Kupeja', 'Kabriolets', 'Minivens', 'Kompaktvens', 'Pikaps', 'Furgons'
]

const GEARBOX_TYPES = [
  'Mehāniskā', 'Automāts', 'Pusautomāts'
]

const ENGINE_TYPES = [
  'Dīzelis', 'Benzīns', 'Benzīns / Gāze', 'Hibrīds (Benzīns)', 'Hibrīds (Dīzelis)', 'Elektriskais'
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1969 }, (_, i) => (CURRENT_YEAR - i).toString())

export default function PievienotAuto() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Formas lauki
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [price, setPrice] = useState('')
  const [displayPrice, setDisplayPrice] = useState('')
  const [engine, setEngine] = useState('')
  const [volume, setVolume] = useState('')
  const [gearbox, setGearbox] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [color, setColor] = useState('')
  
  // Papildu lauki, kas bija iepriekš
  const [vin, setVin] = useState('')
  const [nobraukums, setNobraukums] = useState('')
  const [tehiskapskate, setTehiskapskate] = useState('')
  const [sture, setSture] = useState('Kreisā')
  const [diski, setDiski] = useState('')
  const [salonaKrasa, setSalonaKrasa] = useState('')
  
  const [country, setCountry] = useState('Latvija')
  const [region, setRegion] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([''])
  const [isDragging, setIsDragging] = useState(false)

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = (name: string) => {
    setActiveDropdown(prev => prev === name ? null : name)
  }

  const handlePriceChange = (val: string) => {
    const cleanNums = val.replace(/\D/g, '')
    if (!cleanNums) {
      setPrice('')
      setDisplayPrice('')
      return
    }
    setPrice(cleanNums)
    setDisplayPrice(cleanNums.replace(/\B(?=(\d{3})+(?!\d))/g, ' '))
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images]
    newImages[index] = value
    setImages(newImages)
  }

  const addImageField = () => {
    setImages([...images, ''])
  }

  const removeImageField = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages.length > 0 ? newImages : [''])
  }

  // Bilžu vilkšana ar peli (Drag and Drop) un failu izvēle
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files)
      // Konvertējam failus pagaidu URL un pievienojam sarakstam
      const newImageUrls = filesArray.map(file => URL.createObjectURL(file))
      setImages(prev => [...prev.filter(img => img.trim() !== ''), ...newImageUrls])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      const newImageUrls = filesArray.map(file => URL.createObjectURL(file))
      setImages(prev => [...prev.filter(img => img.trim() !== ''), ...newImageUrls])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    if (!make || !model || !price || !year) {
      setErrorMessage('Lūdzu, aizpildiet obligātos laukus: Marka, Modelis, Gads un Cena!')
      setLoading(false)
      return
    }

    const filteredImages = images.filter(img => img.trim() !== '')

    const { error } = await supabase.from('cars').insert([
      {
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
        price: Number(price),
        engine: engine.trim(),
        volume: volume ? Number(volume) : null,
        gearbox: gearbox.trim(),
        body_type: bodyType.trim(),
        color: color.trim(),
        vin: vin.trim(),
        mileage: nobraukums ? Number(nobraukums) : null,
        tech_inspection: tehiskapskate.trim(),
        steering_wheel: sture.trim(),
        wheels: diski.trim(),
        interior_color: salonaKrasa.trim(),
        country: country.trim(),
        region: region.trim(),
        description: description.trim(),
        images: filteredImages,
        image_url: filteredImages[0] || null,
        created_at: new Date().toISOString()
      }
    ])

    if (error) {
      console.error('Kļūda saglabājot auto:', error)
      setErrorMessage('Neizdevās pievienot sludinājumu: ' + error.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  const availableModels = (MODELS_BY_MAKE[make] || []).filter(m => 
    m.toLowerCase().includes(model.toLowerCase())
  )

  return (
    <div ref={dropdownRef} style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '24px 12px', boxSizing: 'border-box' }}>
      
      {/* Režģa struktūra ar sānu reklāmām un formu centrā */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 240px', gap: '16px', alignItems: 'start', width: '100%' }}>
        
        {/* KREISĀ PUSE - Reklāmas vieta */}
        <div style={{ position: 'sticky', top: '72px', alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#6b7280', fontSize: '13px' }}>
            <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA</span>
            <span>Sānu baneris šeit!</span>
          </div>
        </div>

        {/* VIDUS: Forma */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', boxSizing: 'border-box' }}>
          
          <div style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Pievienot jaunu auto sludinājumu</h1>
            <p style={{ fontSize: '13.5px', color: '#6b7280', marginTop: '4px' }}>Aizpildiet datus par automašīnu. Izmantojiet izlecošos sarakstus ātrākai ievadei.</p>
          </div>

          {errorMessage && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '13.5px', marginBottom: '20px' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* MARKA UN MODELIS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Automašīnas marka *</label>
                <input
                  type="text"
                  placeholder="Sāciet rakstīt vai izvēlieties..."
                  value={make}
                  onChange={(e) => { setMake(e.target.value); setActiveDropdown('make'); }}
                  onClick={() => toggleDropdown('make')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'make' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '220px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {POPULAR_MAKES.filter(m => m.toLowerCase().includes(make.toLowerCase())).map((m) => (
                      <div
                        key={m}
                        onClick={() => { setMake(m); setModel(''); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Modelis *</label>
                <input
                  type="text"
                  placeholder={make ? `Izvēlieties ${make} modeli...` : 'Vispirms izvēlieties marku'}
                  value={model}
                  onChange={(e) => { setModel(e.target.value); setActiveDropdown('model'); }}
                  onClick={() => toggleDropdown('model')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'model' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {availableModels.length > 0 ? (
                      availableModels.map((mod) => (
                        <div
                          key={mod}
                          onClick={() => { setModel(mod); setActiveDropdown(null); }}
                          style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                          {mod}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '8px 12px', fontSize: '13.5px', color: '#6b7280' }}>Ievadiet modeli brīvā formā vai izvēlieties marku</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* GADS UN CENA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Izlaiduma gads *</label>
                <input
                  type="text"
                  placeholder="Piem., 2020"
                  value={year}
                  onChange={(e) => { setYear(e.target.value); setActiveDropdown('year'); }}
                  onClick={() => toggleDropdown('year')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'year' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {YEARS.filter(y => y.includes(year)).map((y) => (
                      <div
                        key={y}
                        onClick={() => { setYear(y); setActiveDropdown(null); }}
                        style={{ padding: '6px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {y} g.
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Cena (€) *</label>
                <input
                  type="text"
                  placeholder="Piem., 12 500"
                  value={displayPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
            </div>

            {/* DZINĒJS UN TILPUMS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Dzinēja tips</label>
                <input
                  type="text"
                  placeholder="Izvēlieties dzinēju..."
                  value={engine}
                  onChange={(e) => { setEngine(e.target.value); setActiveDropdown('engine'); }}
                  onClick={() => toggleDropdown('engine')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'engine' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {ENGINE_TYPES.filter(et => et.toLowerCase().includes(engine.toLowerCase())).map((et) => (
                      <div
                        key={et}
                        onClick={() => { setEngine(et); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {et}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Dzinēja tilpums (L)</label>
                <input
                  type="text"
                  placeholder="Piem., 2.0"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
            </div>

            {/* ĀTRUMKĀRBA UN VIRSBŪVE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Ātrumkārba</label>
                <input
                  type="text"
                  placeholder="Izvēlieties kārbu..."
                  value={gearbox}
                  onChange={(e) => { setGearbox(e.target.value); setActiveDropdown('gearbox'); }}
                  onClick={() => toggleDropdown('gearbox')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'gearbox' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {GEARBOX_TYPES.filter(g => g.toLowerCase().includes(gearbox.toLowerCase())).map((g) => (
                      <div
                        key={g}
                        onClick={() => { setGearbox(g); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {g}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Virsbūves tips</label>
                <input
                  type="text"
                  placeholder="Izvēlieties virsbūvi..."
                  value={bodyType}
                  onChange={(e) => { setBodyType(e.target.value); setActiveDropdown('bodyType'); }}
                  onClick={() => toggleDropdown('bodyType')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'bodyType' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {BODY_TYPES.filter(b => b.toLowerCase().includes(bodyType.toLowerCase())).map((b) => (
                      <div
                        key={b}
                        onClick={() => { setBodyType(b); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {b}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* KRĀSA AR PARAUDZIŅIEM */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Krāsa</label>
              <input
                type="text"
                placeholder="Izvēlieties krāsu..."
                value={color}
                onChange={(e) => { setColor(e.target.value); setActiveDropdown('color'); }}
                onClick={() => toggleDropdown('color')}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
              />
              {activeDropdown === 'color' && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '220px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  {COLORS.filter(c => c.name.toLowerCase().includes(color.toLowerCase())).map((c) => (
                    <div
                      key={c.name}
                      onClick={() => { setColor(c.name); setActiveDropdown(null); }}
                      style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f3f4f6' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                      <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: c.hex, border: `1px solid ${c.border}` }}></span>
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PAPILDUS LAUKI (NOBRAUKUMS, VIN, TEHNISKĀ APSKATE, STŪRE, DISKI, SALONS) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Nobraukums (km)</label>
                <input
                  type="text"
                  placeholder="Piem., 185000"
                  value={nobraukums}
                  onChange={(e) => setNobraukums(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Tehniskā apskate</label>
                <input
                  type="text"
                  placeholder="Piem., 05.2027"
                  value={tehiskapskate}
                  onChange={(e) => setTehiskapskate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>VIN kods</label>
                <input
                  type="text"
                  placeholder="Šasijas numurs"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Stūre</label>
                <input
                  type="text"
                  placeholder="Kreisā / Labā"
                  value={sture}
                  onChange={(e) => setSture(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Diski</label>
                <input
                  type="text"
                  placeholder="Piem., R17 vieglmetāla"
                  value={diski}
                  onChange={(e) => setDiski(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Salona krāsa/materiāls</label>
                <input
                  type="text"
                  placeholder="Piem., Melns ādas salons"
                  value={salonaKrasa}
                  onChange={(e) => setSalonaKrasa(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
            </div>

            {/* ATRAŠANĀS VIETA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Valsts</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Reģions / Pilsēta</label>
                <input
                  type="text"
                  placeholder="Piem., Rīga"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
            </div>

            {/* FOTOGRĀFIJAS: DRAG AND DROP UN SAITES */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Attēli un fotogrāfijas</label>
              
              {/* Velkamais laukums (Drag & Drop) */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: isDragging ? '2px dashed #16a34a' : '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: isDragging ? '#f0fdf4' : '#f9fafb',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  transition: 'background-color 0.2s, border-color 0.2s'
                }}
              >
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                  style={{ display: 'none' }} 
                  id="file-upload" 
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer', fontSize: '13.5px', color: '#4b5563' }}>
                  📂 **Ievelciet bildes šeit** vai <span style={{ color: '#2563eb', textDecoration: 'underline' }}>izvēlieties failus</span> no datora
                </label>
              </div>

              {images.map((img, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Vai ielīmējiet attēla saiti (https://...)"
                    value={img}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: '#fff' }}
                  />
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      style={{ padding: '10px 14px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addImageField}
                style={{ marginTop: '4px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 12px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
              >
                + Pievienot vēl vienu attēla lauku
              </button>
            </div>

            {/* APRAKSTS */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Papildu apraksts un komentāri</label>
              <textarea
                rows={4}
                placeholder="Pastāstiet par auto stāvokli, komplektāciju..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
              />
            </div>

            {/* SAGLABĀŠANAS POGA */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '12px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 20px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#15803d')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#16a34a')}
            >
              {loading ? 'Saglabā sludinājumu...' : 'Pievienot sludinājumu'}
            </button>

          </form>
        </div>

        {/* LABĀ PUSE - Reklāmas vieta */}
        <div style={{ position: 'sticky', top: '72px', alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#6b7280', fontSize: '13px' }}>
            <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA</span>
            <span>Sānu baneris šeit!</span>
          </div>
        </div>

      </div>
    </div>
  )
}
