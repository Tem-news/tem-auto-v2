'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const CAR_DATABASE: { [key: string]: string[] } = {
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'e-tron'],
  'BMW': ['1. sērija', '3. sērija', '5. sērija', '7. sērija', 'X1', 'X3', 'X5', 'X6', 'Z4', 'i4', 'iX'],
  'Chevrolet': ['Camaro', 'Corvette', 'Cruze', 'Captiva', 'Malibu', 'Tahoe'],
  'Chrysler': ['300C', 'Voyager', 'Pacifica'],
  'Citroen': ['C3', 'C4', 'C5', 'Berlingo', 'Spacetourer'],
  'Dodge': ['Challenger', 'Charger', 'Durango', 'RAM'],
  'Fiat': ['500', 'Panda', 'Tipo', 'Doblo'],
  'Ford': ['Focus', 'Fiesta', 'Mondeo', 'Kuga', 'Puma', 'Mustang', 'Explorer', 'Transit', 'Ranger'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Jazz'],
  'Hyundai': ['i10', 'i20', 'i30', 'Tucson', 'Santa Fe', 'Kona', 'Ioniq'],
  'Infiniti': ['FX35', 'FX37', 'EX35', 'Q50', 'QX70'],
  'Jaguar': ['XF', 'XE', 'XJ', 'F-Pace', 'I-Pace'],
  'Jeep': ['Grand Cherokee', 'Wrangler', 'Renegade', 'Compass'],
  'Kia': ['Ceed', 'Sportage', 'Sorento', 'Rio', 'Stonic', 'Picanto', 'EV6'],
  'Land Rover': ['Range Rover', 'Range Rover Sport', 'Discovery', 'Defender', 'Evoque'],
  'Lexus': ['IS', 'GS', 'LS', 'RX', 'NX', 'UX', 'LX'],
  'Mazda': ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-30', 'MX-5'],
  'Mercedes-Benz': ['A-klase', 'C-klase', 'E-klase', 'S-klase', 'GLA', 'GLB', 'GLC', 'GLE', 'ML', 'G-klase', 'Sprinter'],
  'Mini': ['Cooper', 'Countryman', 'Clubman'],
  'Mitsubishi': ['Outlander', 'ASX', 'L200', 'Pajero', 'Eclipse Cross'],
  'Nissan': ['Qashqai', 'X-Trail', 'Juke', 'Micra', 'Leaf', 'Navara'],
  'Opel': ['Astra', 'Corsa', 'Insignia', 'Mokka', 'Zafira', 'Vectra', 'Grandland'],
  'Peugeot': ['208', '308', '508', '2008', '3008', '5008', 'Partner'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Scenic', 'Laguna', 'Master'],
  'Seat': ['Leon', 'Ibiza', 'Ateca', 'Arona'],
  'Skoda': ['Octavia', 'Superb', 'Fabia', 'Kodiaq', 'Karoq', 'Kamiq', 'Enyaq'],
  'Subaru': ['Outback', 'Forester', 'Impreza', 'XV'],
  'Suzuki': ['Vitara', 'Swift', 'SX4', 'Jimny'],
  'Tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'],
  'Toyota': ['Corolla', 'Camry', 'RAV4', 'Yaris', 'Avensis', 'C-HR', 'Land Cruiser', 'Supra', 'Prius'],
  'Volkswagen': ['Golf', 'Passat', 'Polo', 'Tiguan', 'Touareg', 'Touran', 'Arteon', 'Transporter', 'ID.4', 'ID.3'],
  'Volvo': ['S60', 'S90', 'V40', 'V60', 'V90', 'XC40', 'XC60', 'XC90']
}

const WORLD_COUNTRIES = [
  { name: 'Latvija', code: 'lv', regions: ['Rīga', 'Pierīga', 'Vidzeme', 'Kurzeme', 'Zemgale', 'Latgale', 'Jūrmala', 'Liepāja', 'Daugavpils', 'Jelgava', 'Ventspils', 'Valmiera', 'Ogre', 'Salaspils', 'Tukums', 'Cēsis', 'Sigulda'] },
  { name: 'Lietuva', code: 'lt', regions: ['Viļņa', 'Kauņa', 'Klaipēda', 'Šauļi', 'Panevēža', 'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena'] },
  { name: 'Igaunija', code: 'ee', regions: ['Tallina', 'Tartu', 'Narva', 'Pērnava', 'Kohtla-Järve', 'Viljandi', 'Rakvere', 'Maardu', 'Kuressaare'] },
  { 
    name: 'Vācija', 
    code: 'de', 
    regions: [
      'Bādenes-Virtemberga', 'Bavārija', 'Berlīne', 'Brandenburga', 'Brēmene', 
      'Hamburga', 'Hesene', 'Mēklenburga-Priekšpomerānija', 'Lejassaksija', 
      'Ziemeļreina-Vestfālene', 'Reina-Pfalsa', 'Sāra', 'Saksija', 
      'Saksija-Anhalte', 'Šlēviga-Holšteina', 'Tīringene'
    ] 
  },
  { 
    name: 'Polija', 
    code: 'pl', 
    regions: [
      'Lielpolija', 'Kujāvijas-Pomožes', 'Mazpolsija', 'Lodza', 'Lejassilēzija', 
      'Ļubļina', 'Ļubusa', 'Mazovija', 'Opole', 'Pakarpatja', 'Podlase', 
      'Pomože', 'Silēzija', 'Sventokšiska', 'Varmijas-Mazūrija', 'Rietumpomože'
    ] 
  },
  { name: 'Zviedrija', code: 'se', regions: ['Stokholma', 'Gēteborga', 'Malme', 'Upsāla', 'Vesterosa', 'Ērebrū', 'Linšēpinga', 'Helsingborga', 'Jēnšēpinga'] },
  { name: 'Norvēģija', code: 'no', regions: ['Oslo', 'Viken', 'Vestland', 'Trondelag', 'Rogaland', 'Agder', 'Innlandet', 'Vestfold un Tēlemarka', 'Nordland', 'Troms un Finnmark'] },
  { name: 'Somija', code: 'fi', regions: ['Ūusimā', 'Pirkanmā', 'Varsinais-Suomi', 'Pohjois-Pohjanmaa', 'Keski-Suomi', 'Satakunta', 'Päijät-Häme'] },
  { name: 'Dānija', code: 'dk', regions: ['Hovedstaden', 'Midtjylland', 'Syddanmark', 'Sjælland', 'Nordjylland'] },
  { name: 'Francija', code: 'fr', regions: ['Ildefransa', 'Provansa-Alpi-Azūras krasts', 'Overņa-Ronas-Alpi', 'Grand Est', 'Nouvelle-Aquitaine', 'Occitanie', 'Hauts-de-France', 'Bretagne', 'Normandie', 'Pays de la Loire', 'Centre-Val de Loire', 'Bourgogne-Franche-Comté', 'Korsika'] },
  { name: 'Itālija', code: 'it', regions: ['Lombardija', 'Lacio', 'Veneto', 'Pjemonta', 'Emīlija-Romanja', 'Tuskānija', 'Kalabrija', 'Kampānija', 'Sicīlija', 'Sardīnija', 'Ligūrija', 'Apūlija', 'Friuli-Venēcija Džūlija', 'Trentīna-Alto Adige', 'Umbrija', 'Abruco', 'Bazilikāta', 'Molize', 'Valle d\'Aosta', 'Marche'] },
  { name: 'Spānija', code: 'es', regions: ['Madride', 'Katalonija', 'Andalūzija', 'Valensija', 'Galisija', 'Kastīlija un Leona',if: 'Basku Zeme', 'Kanāriju salas', 'Kastīlija-La Manča', 'Mursija', 'Aragona', 'Baleāru salas', 'Ekstremadura', 'Astūrija', 'Navarra', 'Kantabrija', 'La Rioja', 'Seuta', 'Meliļa'] },
  { name: 'Lielbritānija', code: 'gb', regions: ['Anglija', 'Skotija', 'Velsa', 'Ziemeļīrija', 'Londona', 'Lielā Mančestra', 'West Midlands', 'West Yorkshire', 'Hampshire', 'Essex', 'Kent'] },
  { 
    name: 'ASV', 
    code: 'us', 
    regions: [
      'Alabama', 'Aļaska', 'Arizona', 'Arkanzasa', 'Delavēra', 'Dienvidkarolīna', 
      'Dienviddakota', 'Florida', 'Džordžija', 'Havajas', 'Aidaho', 'Ilinoisa', 
      'Indiāna', 'Ajova', 'Kanzasa', 'Kentuki', 'Luiziāna', 'Meina', 'Merilenda', 
      'Masačūsetsa', 'Mičigana', 'Minesota', 'Misisipi', 'Misūri', 'Montāna', 
      'Nebraska', 'Nevada', 'Ņūhempšīra', 'Ņūdžersija', 'Ņūmeksika', 'Ņujorka', 
      'Ziemeļkarolīna', 'Ziemeļdakota', 'Ohaio', 'Oklahoma', 'Oregona', 
      'Pensilvānija', 'Rodeilenda', 'Tenesī', 'Teksasa', 'Jūta', 'Vermonta', 
      'Virdžīnija', 'Vašingtona', 'Rietumvirdžīnija', 'Viskonsina', 'Vaiominga', 
      'Kolorādo', 'Konektikuta', 'Kalifornija', 'Kolumbijas federālais apgabals (Vašingtona)'
    ] 
  },
  { name: 'Kanāda', code: 'ca', regions: ['Ontārio', 'Kvebeka', 'Britu Kolumbija', 'Alberta', 'Manitoba', 'Saskačevana', 'Jaunskotija', 'Ņūbransvika', 'Ņūfaundlenda un Labradora', 'Princa Edvarda Sala', 'Jukona', 'Ziemeļrietumu teritorijas', 'Nunavuta'] },
  { name: 'Nīderlande', code: 'nl', regions: ['Ziemeļholande', 'Dienvidholande', 'Utrehta', 'Ziemeļbrabante', 'Gelderlande', 'Overijseka', 'Limburga', Friesland, 'Groningene', 'Drenthe', 'Flevolande', 'Zēlande'] },
  { name: 'Beļģija', code: 'be', regions: ['Flandrija', 'Valonija', 'Briseles galvaspilsētas reģions', 'Antverpene', 'Austrūrija', 'Rietumflandrija', 'Lježas province', 'Hainaut'] },
  { name: 'Austrija', code: 'at', regions: ['Vīne', 'Augšaustrija', 'Lejaustrija', 'Tirole', 'Zalcburga', 'Štīrija', 'Karintija', 'Forarlberga', 'Burgenlande'] },
  { name: 'Šveice', code: 'ch', regions: ['Cīrihe', 'Ženēva', 'Berne', 'Vo', 'Bāzele', 'Lucerna', 'Sanktgallene', 'Tičīno', 'Valē'] },
  { name: 'Čehija', code: 'cz', regions: ['Prāga', 'Dienvidmorāvija', 'Vidusčehija', 'Morāvija-Silēzija', 'Ūstijas apgabals', 'Plzeņas apgabals', 'Liberecas apgabals'] },
  { name: 'Ukraina', code: 'ua', regions: ['Kijeva', 'Ļviva', 'Odesa', 'Harkiva', 'Dnipro', 'Zaporožje', 'Vinnica', 'Poltava', 'Černihiva', 'Žitomira', 'Kemerova', 'Krivijriha'] },
  { name: 'Austrālija', code: 'au', regions: ['Jaundienvidvelsa', 'Viktorija', 'Kvīnslenda', 'Rietumaustrālija', 'Dienvidaustrālija', 'Tasmānija', 'Austrālijas galvaspilsētas teritorija', 'Ziemeļu teritorija'] },
  { name: 'Japāna', code: 'jp', regions: ['Tokija', 'Osaka', 'Hokaido', 'Kiota', 'Kanaagava', 'Aiči', 'Fukuoka', 'Hjogo', 'Saitama', 'Čiba'] },
  { name: 'Brazīlija', code: 'br', regions: ['Sanpaulu', 'Riodaženeiru', 'Minasžeraisa', 'Baija', 'Parana', 'Riógrandes do Sula', 'Santa Katarina', 'Seara'] },
  { name: 'Turcija', code: 'tr', regions: ['Stambula', 'Ankara', 'Izmira', 'Antalja', 'Bursa', 'Adana', 'Konya', 'Gaziantep'] },
  { name: 'Grieķija', code: 'gr', regions: ['Atēnas', 'Saloniki', 'Krēta', 'Peloponēsa', 'Tesālija', 'Egejas salas', 'Jonijas salas'] },
  { name: 'Portugāle', code: 'pt', regions: ['Lisabona', 'Porto', 'Algarve', 'Coimbra', 'Braga', 'Madeira', 'Azoru salas'] },
  { name: 'Īrija', code: 'ie', regions: ['Dublina', 'Korka', 'Golveja', 'Limerika', 'Voterforda', 'Kleri', 'Mito'] },
  { name: 'Ungārija', code: 'hu', regions: ['Budapešta', 'Peste', 'Borsod-Abaúj-Zemplén', 'Győr-Moson-Sopron', 'Hajdú-Bihar', 'Szabolcs-Szatmár-Bereg'] },
  { name: 'Rumānija', code: 'ro', regions: ['Bukareste', 'Kluža-Napoka', 'Timišoara', 'Jaši', 'Konstanca', 'Krajova', 'Brašova'] }
]

export default function PievienotSludinajumu() {
  const router = useRouter()
  
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  
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
  
  const [country, setCountry] = useState('Latvija')
  const [countryCode, setCountryCode] = useState('lv')
  const [countrySuggestions, setCountrySuggestions] = useState<{ name: string; code: string; regions: string[] }[]>([])
  
  const [region, setRegion] = useState('')
  const [regionSuggestions, setRegionSuggestions] = useState<string[]>([])

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

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

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setModel(value)

    let availableModels: string[] = []
    const matchedMakeKey = Object.keys(CAR_DATABASE).find(m => m.toLowerCase() === make.toLowerCase())
    
    if (matchedMakeKey) {
      availableModels = CAR_DATABASE[matchedMakeKey]
    } else {
      availableModels = Array.from(new Set(Object.values(CAR_DATABASE).flat()))
    }

    if (value.trim().length > 0) {
      const filtered = availableModels.filter(mod => mod.toLowerCase().includes(value.toLowerCase()))
      setModelSuggestions(filtered)
    } else {
      setModelSuggestions(availableModels)
    }
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCountry(value)

    if (value.trim().length > 0) {
      const filtered = WORLD_COUNTRIES.filter(c => 
        c.name.toLowerCase().includes(value.toLowerCase())
      )
      setCountrySuggestions(filtered)
    } else {
      setCountrySuggestions(WORLD_COUNTRIES)
    }
  }

  const handleRegionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRegion(value)

    const foundCountry = WORLD_COUNTRIES.find(c => country.toLowerCase() === c.name.toLowerCase())
    const availableRegions = foundCountry ? foundCountry.regions : []

    if (value.trim().length > 0) {
      const filtered = availableRegions.filter(r => r.toLowerCase().includes(value.toLowerCase()))
      setRegionSuggestions(filtered)
    } else {
      setRegionSuggestions(availableRegions)
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
        country: country.trim() || null,
        region: region.trim() || null,
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
        
        {/* KREISĀ PUSE */}
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
            
            {/* 1. Rinda: Marka un Modelis */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Marka *</label>
                <input
                  type="text"
                  placeholder="piem., Tesla"
                  value={make}
                  onChange={handleMakeChange}
                  onFocus={() => { if (!make) setMakeSuggestions(Object.keys(CAR_DATABASE)) }}
                  onBlur={() => setTimeout(() => setMakeSuggestions([]), 200)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
                {makeSuggestions.length > 0 && (
                  <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '0 0 6px 6px', maxHeight: '180px', overflowY: 'auto', listStyle: 'none', margin: 0, padding: 0, zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {makeSuggestions.map((item, idx) => (
                      <li key={idx} onClick={() => { setMake(item); setMakeSuggestions([]); setModel(''); }} style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Modelis *</label>
                <input
                  type="text"
                  placeholder="piem., Model 3 vai Supra"
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
                      <li key={idx} onClick={() => { setModel(item); setModelSuggestions([]); }} style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}>
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
                <input type="number" placeholder="2018" value={year} onChange={(e) => setYear(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Cena (€)</label>
                <input type="text" placeholder="piem., 5 800" value={price} onChange={handlePriceChange} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Nobraukums (km)</label>
                <input type="text" placeholder="piem., 180 000" value={mileage} onChange={handleMileageChange} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>
            </div>

            {/* 3. Rinda: Motors, Degviela, Ātrumkārba */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Motors</label>
                <input type="text" placeholder="piem., 2.0 D" value={engine} onChange={(e) => setEngine(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Degviela</label>
                <select value={fuel} onChange={(e) => setFuel(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px', backgroundColor: '#fff' }}>
                  <option value="Dīzelis">Dīzelis</option>
                  <option value="Benzīns">Benzīns</option>
                  <option value="Hibrīds">Hibrīds</option>
                  <option value="Elektrība">Elektrība</option>
                  <option value="Gāze / Benzīns">Gāze / Benzīns</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Ātrumkārba</label>
                <input type="text" placeholder="piem., Automāts" value={transmission} onChange={(e) => setTransmission(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>
            </div>

            {/* 4. Rinda: Krāsa, Virsbūves tips, VIN kods */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Krāsa</label>
                <input type="text" placeholder="piem., Melna" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Virsbūves tips</label>
                <input type="text" placeholder="piem., Sedans" value={bodyType} onChange={(e) => setBodyType(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>VIN kods</label>
                <input type="text" placeholder="piem., WBA..." value={vin} onChange={(e) => setVin(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>
            </div>

            {/* 5. Rinda: Valsts un Reģions ar krāsainiem karodziņiem un pilnu reģionu sarakstu */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Valsts lauks */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Valsts</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <img 
                    src={`https://flagcdn.com/24x18/${countryCode}.png`} 
                    alt="karogs" 
                    style={{ position: 'absolute', left: '10px', width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px', pointerEvents: 'none' }} 
                  />
                  <input
                    type="text"
                    placeholder="Sāc rakstīt valsti..."
                    value={country}
                    onChange={handleCountryChange}
                    onFocus={() => setCountrySuggestions(WORLD_COUNTRIES)}
                    onBlur={() => setTimeout(() => setCountrySuggestions([]), 200)}
                    style={{ width: '100%', padding: '9px 9px 9px 38px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                  />
                </div>
                {countrySuggestions.length > 0 && (
                  <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '0 0 6px 6px', maxHeight: '200px', overflowY: 'auto', listStyle: 'none', margin: 0, padding: 0, zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {countrySuggestions.map((c, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          setCountry(c.name)
                          setCountryCode(c.code)
                          setCountrySuggestions([])
                          setRegion('')
                        }}
                        style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '10px' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                      >
                        <img src={`https://flagcdn.com/24x18/${c.code}.png`} alt={c.name} style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px' }} />
                        <span>{c.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Reģions / Štats lauks */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Reģions / Štats</label>
                <input
                  type="text"
                  placeholder="Piem., Kalifornija, Rīga..."
                  value={region}
                  onChange={handleRegionChange}
                  onFocus={() => {
                    const foundCountry = WORLD_COUNTRIES.find(c => country.toLowerCase() === c.name.toLowerCase())
                    if (foundCountry) setRegionSuggestions(foundCountry.regions)
                  }}
                  onBlur={() => setTimeout(() => setRegionSuggestions([]), 200)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }}
                />
                {regionSuggestions.length > 0 && (
                  <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '0 0 6px 6px', maxHeight: '180px', overflowY: 'auto', listStyle: 'none', margin: 0, padding: 0, zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {regionSuggestions.map((item, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          setRegion(item)
                          setRegionSuggestions([])
                        }}
                        style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>

            {/* Pārdevēja kontakti */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '4px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', margin: '0 0 12px 0' }}>Pārdevēja kontakti</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>E-pasts *</label>
                  <input type="email" placeholder="jusu@epasts.lv" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Tālruņa numurs (neobligāts)</label>
                  <input type="text" placeholder="+371 20000000" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px' }} />
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
                  input.onchange = (e: any) => { if (e.target.files) handleImageFiles(e.target.files) }
                  input.click()
                }}
                style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '24px', textAlign: 'center', backgroundColor: '#f9fafb', cursor: 'pointer', boxSizing: 'border-box' }}
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
                          {index > 0 && <button type="button" onClick={(e) => { e.stopPropagation(); moveImage(index, 'up'); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '10px', cursor: 'pointer', padding: '0 2px' }}>◀</button>}
                          {index < images.length - 1 && <button type="button" onClick={(e) => { e.stopPropagation(); moveImage(index, 'down'); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '10px', cursor: 'pointer', padding: '0 2px' }}>▶</button>}
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
              <textarea rows={4} placeholder="Aprakstiet auto stāvokli, komplektāciju..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '13px', resize: 'vertical' }} />
            </div>

            {/* Poga */}
            <div>
              <button type="submit" disabled={loading} style={{ backgroundColor: '#15803d', color: '#fff', border: 'none', borderRadius: '6px', padding: '11px 20px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                {loading ? 'Saglabā...' : 'Pievienot sludinājumu'}
              </button>
            </div>

          </form>
        </div>

        {/* LABĀ PUSE */}
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
