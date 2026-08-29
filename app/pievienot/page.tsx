'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const POPULAR_MAKES = [
  'BMW', 'Audi', 'Volkswagen', 'Volvo', 'Toyota', 'Mercedes-Benz', 
  'Škoda', 'Ford', 'Hyundai', 'Kia', 'Nissan', 'Opel', 'Peugeot', 
  'Renault', 'Mazda', 'Honda', 'Lexus', 'Subaru', 'Tesla', 'Porsche',
  'Fiat', 'Alfa Romeo', 'Citroën', 'Dacia', 'Jeep', 'Land Rover', 
  'Mitsubishi', 'Suzuki', 'Mini', 'Chrysler', 'Dodge', 'Chevrolet'
]

const MODELS_BY_MAKE: { [key: string]: string[] } = {
  'BMW': ['1 sērija', '3 sērija', '5 sērija', '7 sērija', '8 sērija', 'X1', 'X3', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i4', 'iX'],
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'e-tron'],
  'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Touareg', 'Polo', 'Touran', 'Transporter', 'Arteon', 'ID.3', 'ID.4', 'T-Roc'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'EX30', 'EX90'],
  'Toyota': ['Corolla', 'Camry', 'RAV4', 'Land Cruiser', 'Yaris', 'Avensis', 'C-HR', 'Prius', 'Hilux', 'Aygo'],
  'Mercedes-Benz': ['A-klase', 'B-klase', 'C-klase', 'E-klase', 'S-klase', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-klase', 'ML'],
  'Škoda': ['Octavia', 'Superb', 'Fabia', 'Kodiaq', 'Karoq', 'Kamiq', 'Scala', 'Rapid'],
  'Ford': ['Focus', 'Mondeo', 'Fiesta', 'Kuga', 'S-Max', 'Ranger', 'Puma', 'Mustang', 'Explorer'],
  'Hyundai': ['i10', 'i20', 'i30', 'i40', 'Tucson', 'Santa Fe', 'Kona', 'Ioniq 5', 'Ioniq 6'],
  'Kia': ['Picanto', 'Ceed', 'Sportage', 'Sorento', 'Stonic', 'Niro', 'Rio', 'EV6', 'Stinger'],
  'Nissan': ['Qashqai', 'X-Trail', 'Juke', 'Leaf', 'Navara', 'Micra', 'Ariya'],
  'Opel': ['Astra', 'Corsa', 'Insignia', 'Mokka', 'Zafira', 'Crossland', 'Grandland'],
  'Peugeot': ['208', '308', '508', '2008', '3008', '5008', 'Partner'],
  'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Scenic', 'Talisman', 'Arkana', 'Austral'],
  'Mazda': ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-30', 'CX-60', 'MX-5'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Jazz'],
  'Lexus': ['IS', 'ES', 'GS', 'LS', 'NX', 'RX', 'UX', 'RZ'],
  'Subaru': ['Outback', 'Forester', 'Impreza', 'XV', 'Legacy', 'BRZ'],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  'Fiat': ['500', 'Panda', 'Tipo', 'Doblo', 'Ducato'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale', 'Giulietta'],
  'Citroën': ['C3', 'C4', 'C5 Aircross', 'Berlingo'],
  'Dacia': ['Duster', 'Sandero', 'Logan', 'Jogger'],
  'Jeep': ['Grand Cherokee', 'Wrangler', 'Renegade', 'Compass'],
  'Land Rover': ['Range Rover', 'Range Rover Sport', 'Discovery', 'Defender'],
  'Mitsubishi': ['Outlander', 'ASX', 'Eclipse Cross', 'L200'],
  'Suzuki': ['Vitara', 'SX4 S-Cross', 'Swift', 'Jimny'],
  'Mini': ['Cooper', 'Countryman', 'Clubman'],
  'Chrysler': ['300C', 'Voyager'],
  'Dodge': ['Charger', 'Challenger', 'Durango'],
  'Chevrolet': ['Camaro', 'Corvette', 'Silverado', 'Captiva']
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

const GEARBOX_TYPES = ['Mehāniskā', 'Automāts', 'Pusautomāts']
const ENGINE_TYPES = ['Dīzelis', 'Benzīns', 'Benzīns / Gāze', 'Hibrīds (Benzīns)', 'Hibrīds (Dīzelis)', 'Elektriskais']
const STEERING_TYPES = ['Kreisā', 'Labā']
const WHEEL_TYPES = [
  'R13 vieglmetāla', 'R14 vieglmetāla', 'R15 vieglmetāla', 'R16 vieglmetāla', 'R17 vieglmetāla', 
  'R18 vieglmetāla', 'R19 vieglmetāla', 'R20 vieglmetāla', 'R21 vieglmetāla', 'R22 vieglmetāla',
  'R15 tērauda', 'R16 tērauda'
]

const ENGINE_VOLUMES = [
  '1.0', '1.2', '1.3', '1.4', '1.5', '1.6', '1.8', '1.9', '2.0', 
  '2.2', '2.4', '2.5', '2.8', '3.0', '3.2', '3.5', '4.0', '4.4', '5.0', 'Elektro / Nav'
]

const COUNTRIES = [
  { name: 'Latvija', code: 'lv', regions: ['Rīga un rajons', 'Jūrmala', 'Pierīga', 'Vidzeme', 'Kurzeme', 'Zemgale', 'Latgale'] },
  { name: 'Lietuva', code: 'lt', regions: ['Viļņa', 'Kauņa', 'Klaipēda', 'Šauļi', 'Panevēža', 'Alytus'] },
  { name: 'Igaunija', code: 'ee', regions: ['Tallina', 'Tartu', 'Narva', 'Pērnava', 'Kohtla-Järve'] },
  { 
    name: 'Vācija', 
    code: 'de', 
    regions: [
      'Bavārija (Bayern)', 'Bādene-Virtemberga (Baden-Württemberg)', 'Ziemeļreina-Vestfālene (Nordrhein-Westfalen)',
      'Lejassaksija (Niedersachsen)', 'Hesene (Hessen)', 'Reinlande-Pfalca (Rheinland-Pfalz)',
      'Saksija (Sachsen)', 'Tīringene (Thüringen)', 'Brandenburga (Brandenburg)', 'Saksija-Anhalte (Saksija-Anhalt)',
      'Šlēsviga-Holšteina (Schleswig-Holstein)', 'Mēklenburga-Priekšpomerānija (Mecklenburg-Vorpommern)',
      'Hamburga', 'Berlīne', 'Brēmene', 'Sārija (Saarland)', 'Minhene', 'Frankfurte pie Mainas', 'Ķelne', 'Štutgarte'
    ] 
  },
  { name: 'Lielbritānija', code: 'gb', regions: ['Londona', 'Mančestra', 'Birmingema', 'Liverpūle', 'Skotija', 'Velsa', 'Ziemeļīrija'] },
  { 
    name: 'ASV', 
    code: 'us', 
    regions: [
      'Alabama', 'Aļaska (Alaska)', 'Arizona', 'Arkanzasa (Arkansas)', 'Kalifornija (California)', 
      'Kolorādo', 'Konektikuta (Connecticut)', 'Delavēra (Delaware)', 'Florida', 'Džordžija (Georgia)', 
      'Havajas (Hawaii)', 'Aidaho (Idaho)', 'Ilinoisa (Illinois)', 'Indiana', 'Aiovas (Iowa)', 
      'Kanzasa (Kansas)', 'Kentuki (Kentucky)', 'Luiziāna (Louisiana)', 'Meina (Maine)', 'Merilenda (Maryland)', 
      'Masačūsetsa (Massachusetts)', 'Mičigana (Michigan)', 'Minesota (Minnesota)', 'Misisipi (Mississippi)', 
      'Misūri (Missouri)', 'Montāna (Montana)', 'Nebraska', 'Nevada', 'Ņūhempšīra (New Hampshire)', 
      'Ņūdžersija (New Jersey)', 'Ņūmeksika (New Mexico)', 'Ņujorka (New York)', 'Ziemeļkarolīna (North Carolina)', 
      'Ziemeļdakota (North Dakota)', 'Ohaio (Ohio)', 'Oklahoma', 'Oregonas (Oregon)', 'Pensilvānija (Pennsylvania)', 
      'Roudailenda (Rhode Island)', 'Dienvidkarolīna (South Carolina)', 'Dienviddakota (South Dakota)', 'Tenesī (Tennessee)', 
      'Teksasa (Texas)', 'Jūta (Utah)', 'Vermonta (Vermont)', 'Virdžīnija (Virginia)', 'Vašingtona (Washington)', 
      'Rietumvirdžīnija (West Virginia)', 'Viskonsina (Wisconsin)', 'Vaiominga (Wyoming)'
    ] 
  },
  { name: 'Japāna', code: 'jp', regions: ['Tokija', 'Osaka', 'Kioto', 'Jokohama', 'Nagoja', 'Fukuoka', 'Hokaido'] },
  { name: 'Krievija', code: 'ru', regions: ['Maskava', 'Sanktpēterburga', 'Novosibirska', 'Jekaterinburga', 'Kazaņa', 'Soči', 'Kaliningrada'] },
  { name: 'Zviedrija', code: 'se', regions: ['Stokholma', 'Gēteborga', 'Malme', 'Uppsala'] },
  { name: 'Norvēģija', code: 'no', regions: ['Oslo', 'Bergena', 'Tronheima', 'Stavangere'] },
  { name: 'Polija', code: 'pl', regions: ['Varšava', 'Krakova', 'Gdaņska', 'Poznaņa', 'Vroclava', 'Lodza'] },
  { name: 'Somija', code: 'fi', regions: ['Helsinki', 'Espo', 'Tamperes', 'Vantaa', 'Oulu'] },
  { name: 'Dānija', code: 'dk', regions: ['Kopenhāgena', 'Orhūsa', 'Odense', 'Olborka'] },
  { name: 'Francija', code: 'fr', regions: ['Parīze', 'Marseļa', 'Liona', 'Tulūza', 'Nica', 'Nante'] },
  { name: 'Itālija', code: 'it', regions: ['Roma', 'Milāna', 'Neapole', 'Turīna', 'Palermo', 'Florence'] },
  { name: 'Spānija', code: 'es', regions: ['Madride', 'Barselona', 'Valensija', 'Seviļa', 'Saragosa', 'Malaga'] },
  { name: 'Nīderlande', code: 'nl', regions: ['Amsterdama', 'Roterdama', 'Hāga', 'Utrehta', 'Eindhovena'] },
  { name: 'Ķīna', code: 'cn', regions: ['Pekina', 'Šanhaja', 'Guandžou', 'Šendžena', 'Čendu'] },
  { name: 'Dienvidkoreja', code: 'kr', regions: ['Seula', 'Pusana', 'Inčhona', 'Tegu'] },
  { name: 'Apvienotie Arābu Emirāti', code: 'ae', regions: ['Dubaija', 'Abū Dabī', 'Šardža'] },
  { name: 'Kanāda', code: 'ca', regions: ['Ontārio', 'Kvebeka', 'Britu Kolumbija', 'Alberta', 'Monreāla', 'Toronto'] },
  { name: 'Austrālija', code: 'au', regions: ['Sidneja', 'Melburna', 'Brisbena', 'Pērta', 'Adelaida'] }
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1969 }, (_, i) => (CURRENT_YEAR - i).toString())

export default function PievienotAuto() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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
  
  const [vin, setVin] = useState('')
  const [nobraukums, setNobraukums] = useState('')
  const [tehiskapskate, setTehiskapskate] = useState('')
  const [sture, setSture] = useState('')
  const [diski, setDiski] = useState('')
  const [salonaKrasa, setSalonaKrasa] = useState('')
  
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [region, setRegion] = useState('')
  const [description, setDescription] = useState('')
  
  // Kontakta lauki (virs attēliem)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  
  const [images, setImages] = useState<string[]>([])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (!target.closest('.dropdown-container')) {
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

  const handleFiles = (files: FileList | File[]) => {
    const filesArray = Array.from(files)
    const newUrls = filesArray.map(file => URL.createObjectURL(file))
    setImages(prev => [...prev, ...newUrls])
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages(prev => [...prev, imageUrlInput.trim()])
      setImageUrlInput('')
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images]
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newImages.length) return
    const temp = newImages[index]
    newImages[index] = newImages[targetIndex]
    newImages[targetIndex] = temp
    setImages(newImages)
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
        steering_wheel: sture.trim() || 'Kreisā',
        wheels: diski.trim(),
        interior_color: salonaKrasa.trim(),
        country: selectedCountry.name,
        region: region.trim(),
        description: description.trim(),
        email: email.trim(),
        phone: phone.trim(),
        images: images,
        image_url: images[0] || null,
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
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '24px 12px', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 240px', gap: '16px', alignItems: 'start', width: '100%' }}>
        
        {/* KREISĀ PUSE - 2 Reklāmas baneri stabiņā */}
        <div style={{ position: 'sticky', top: '72px', alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#6b7280', fontSize: '13px' }}>
            <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA 1</span>
            <span>Sānu baneris augšējais!</span>
          </div>
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#6b7280', fontSize: '13px' }}>
            <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA 2</span>
            <span>Sānu baneris apakšējais!</span>
          </div>
        </div>

        {/* VIDUS: Forma */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', boxSizing: 'border-box' }}>
          
          <div style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Pievienot jaunu auto sludinājumu</h1>
            <p style={{ fontSize: '13.5px', color: '#6b7280', marginTop: '4px' }}>Aizpildiet datus par automašīnu un sakārtojiet attēlus.</p>
          </div>

          {errorMessage && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '13.5px', marginBottom: '20px' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* MARKA UN MODELIS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="dropdown-container" style={{ position: 'relative' }}>
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
                        style={{ padding: '9px 12px', fontSize: '13.5px', cursor: 'pointer', fontWeight: '500', color: '#111827', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dropdown-container" style={{ position: 'relative' }}>
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
                      <div style={{ padding: '8px 12px', fontSize: '13.5px', color: '#6b7280' }}>Ievadiet modeli brīvā formā</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* GADS UN CENA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="dropdown-container" style={{ position: 'relative' }}>
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
              <div className="dropdown-container" style={{ position: 'relative' }}>
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

              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Dzinēja tilpums (L)</label>
                <input
                  type="text"
                  placeholder="Piem., 2.0"
                  value={volume}
                  onChange={(e) => { setVolume(e.target.value); setActiveDropdown('volume'); }}
                  onClick={() => toggleDropdown('volume')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'volume' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {ENGINE_VOLUMES.filter(v => v.toLowerCase().includes(volume.toLowerCase())).map((vol) => (
                      <div
                        key={vol}
                        onClick={() => { setVolume(vol); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {vol}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ĀTRUMKĀRBA UN VIRSBŪVE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="dropdown-container" style={{ position: 'relative' }}>
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

              <div className="dropdown-container" style={{ position: 'relative' }}>
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

            {/* KRĀSA */}
            <div className="dropdown-container" style={{ position: 'relative' }}>
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

            {/* PAPILDUS LAUKI */}
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
              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Stūre</label>
                <input
                  type="text"
                  placeholder="Kreisā"
                  value={sture}
                  onChange={(e) => { setSture(e.target.value); setActiveDropdown('sture'); }}
                  onClick={() => toggleDropdown('sture')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'sture' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {STEERING_TYPES.filter(s => s.toLowerCase().includes(sture.toLowerCase())).map((s) => (
                      <div
                        key={s}
                        onClick={() => { setSture(s); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Diski</label>
                <input
                  type="text"
                  placeholder="Piem., R17 vieglmetāla"
                  value={diski}
                  onChange={(e) => { setDiski(e.target.value); setActiveDropdown('diski'); }}
                  onClick={() => toggleDropdown('diski')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'diski' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {WHEEL_TYPES.filter(w => w.toLowerCase().includes(diski.toLowerCase())).map((w) => (
                      <div
                        key={w}
                        onClick={() => { setDiski(w); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {w}
                      </div>
                    ))}
                  </div>
                )}
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

            {/* VALSTS UN REĢIONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Valsts</label>
                <div
                  onClick={() => toggleDropdown('country')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <img src={`https://flagcdn.com/24x18/${selectedCountry.code}.png`} alt={selectedCountry.name} style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px' }} />
                  <span>{selectedCountry.name}</span>
                </div>
                {activeDropdown === 'country' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '220px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {COUNTRIES.map((c) => (
                      <div
                        key={c.name}
                        onClick={() => { setSelectedCountry(c); setRegion(''); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        <img src={`https://flagcdn.com/24x18/${c.code}.png`} alt={c.name} style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px' }} />
                        <span>{c.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dropdown-container" style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Reģions / Pilsēta / Štats</label>
                <input
                  type="text"
                  placeholder={`Izvēlieties vai ierakstiet (${selectedCountry.name})...`}
                  value={region}
                  onChange={(e) => { setRegion(e.target.value); setActiveDropdown('region'); }}
                  onClick={() => toggleDropdown('region')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
                {activeDropdown === 'region' && selectedCountry.regions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {selectedCountry.regions.filter(r => r.toLowerCase().includes(region.toLowerCase())).map((reg) => (
                      <div
                        key={reg}
                        onClick={() => { setRegion(reg); setActiveDropdown(null); }}
                        style={{ padding: '8px 12px', fontSize: '13.5px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {reg}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

            {/* KONTAKTINFORMĀCIJA (Pārcelta virs attēliem, bez "neobligāti") */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>E-pasts</label>
                <input
                  type="email"
                  placeholder="piemērs@epasts.lv"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>Tālruņa Nr.</label>
                <input
                  type="text"
                  placeholder="+371 20000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
            </div>

            {/* FOTOGRĀFIJU GALERIJA */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>
                Attēli un fotogrāfijas (Pirmā bilde būs titulbilde)
              </label>
              
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: isDragging ? '2px dashed #16a34a' : '2px dashed #d1d5db',
                  borderRadius: '10px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: isDragging ? '#f0fdf4' : '#f9fafb',
                  cursor: 'pointer',
                  marginBottom: '16px',
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
                <label htmlFor="file-upload" style={{ cursor: 'pointer', fontSize: '14.5px', color: '#4b5563', display: 'block' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                  <strong>Ievelciet bildes šeit</strong> vai <span style={{ color: '#2563eb', textDecoration: 'underline' }}>izvēlieties failus</span> no datora
                </label>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Vai ielīmējiet attēla URL saiti (https://...)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: '#fff' }}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  style={{ padding: '10px 16px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Pievienot saiti
                </button>
              </div>

              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginTop: '12px' }}>
                  {images.map((img, index) => (
                    <div key={index} style={{ position: 'relative', border: index === 0 ? '2px solid #16a34a' : '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f3f4f6', height: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={img} alt={`Auto bilde ${index + 1}`} style={{ width: '100%', height: '90px', objectFit: 'cover' }} />
                      
                      {index === 0 && (
                        <span style={{ position: 'absolute', top: '4px', left: '4px', backgroundColor: '#16a34a', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          Titulbilde
                        </span>
                      )}

                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'space-between', padding: '4px 8px' }}>
                        <button type="button" onClick={() => moveImage(index, 'left')} disabled={index === 0} style={{ color: '#fff', background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', fontSize: '12px', opacity: index === 0 ? 0.3 : 1 }}>◀</button>
                        <button type="button" onClick={() => removeImage(index)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>✕ Dzēst</button>
                        <button type="button" onClick={() => moveImage(index, 'right')} disabled={index === images.length - 1} style={{ color: '#fff', background: 'none', border: 'none', cursor: index === images.length - 1 ? 'not-allowed' : 'pointer', fontSize: '12px', opacity: index === images.length - 1 ? 0.3 : 1 }}>▶</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

        {/* LABĀ PUSE - 2 Reklāmas baneri stabiņā */}
        <div style={{ position: 'sticky', top: '72px', alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#6b7280', fontSize: '13px' }}>
            <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA 3</span>
            <span>Sānu baneris augšējais!</span>
          </div>
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#6b7280', fontSize: '13px' }}>
            <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA 4</span>
            <span>Sānu baneris apakšējais!</span>
          </div>
        </div>

      </div>
    </div>
  )
}
