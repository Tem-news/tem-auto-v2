'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

// Populārāko marku un modeļu datubāze
const CAR_DATA: Record<string, string[]> = {
  'Alfa Romeo': ['159', 'Giulia', 'Stelvio', 'Giulietta'],
  'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
  'BMW': ['1. sērija', '3. sērija', '5. sērija', '7. sērija', 'X1', 'X3', 'X5', 'X6', 'X7', 'i4', 'iX'],
  'Chevrolet': ['Camaro', 'Captiva', 'Cruze', 'Tahoe', 'Volt'],
  'Citroën': ['C3', 'C4', 'C5', 'Berlingo', 'C4 Cactus'],
  'Dacia': ['Duster', 'Sandero', 'Logan', 'Jogger'],
  'Dodge': ['Challenger', 'Charger', 'Durango', 'RAM 1500'],
  'Fiat': ['500', 'Panda', 'Punto', 'Tipo', 'Ducato'],
  'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Mustang', 'Kuga', 'Explorer', 'Transit'],
  'Honda': ['Civic', 'CR-V', 'Accordion', 'HR-V', 'Jazz'],
  'Hyundai': ['i20', 'i30', 'Tucson', 'Santa Fe', 'Ioniq 5', 'Kona'],
  'Jaguar': ['XE', 'XF', 'F-Pace', 'E-Pace', 'I-Pace'],
  'Jeep': ['Grand Cherokee', 'Wrangler', 'Compass', 'Renegade'],
  'Kia': ['Ceed', 'Sportage', 'Sorento', 'Rio', 'EV6', 'Stinger'],
  'Land Rover': ['Range Rover', 'Range Rover Sport', 'Defender', 'Discovery', 'Evoque'],
  'Lexus': ['IS', 'GS', 'LS', 'RX', 'NX', 'UX'],
  'Mazda': ['3', '6', 'CX-30', 'CX-5', 'CX-60', 'MX-5'],
  'Mercedes-Benz': ['A-Klase', 'C-Klase', 'E-Klase', 'S-Klase', 'GLC', 'GLE', 'GLS', 'G-Klase', 'Sprinter'],
  'MINI': ['Cooper', 'Countryman', 'Clubman'],
  'Mitsubishi': ['Lancer', 'Outlander', 'Pajero', 'ASX'],
  'Nissan': ['Qashqai', 'Juke', 'X-Trail', 'Leaf', 'Navara'],
  'Opel': ['Astra', 'Insignia', 'Corsa', 'Mokka', 'Zafira'],
  'Peugeot': ['208', '308', '508', '2008', '3008', '5008'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  'Renault': ['Clio', 'Megane', 'Scenic', 'Kadjar', 'Captur', 'Master'],
  'Škoda': ['Octavia', 'Superb', 'Fabia', 'Kodiaq', 'Karoq', 'Enyaq'],
  'Subaru': ['Outback', 'Forester', 'Impreza', 'XV'],
  'Toyota': ['Corolla', 'Camry', 'RAV4', 'Land Cruiser', 'Yaris', 'Hilux', 'C-HR', 'Prius'],
  'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Touareg', 'Polo', 'Arteon', 'ID.4', 'Transporter'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
}

const FUEL_TYPES = [
  'Benzīns',
  'Dīzelis',
  'Elektro',
  'Hibrīds (benzīns)',
  'Hibrīds (dīzelis)',
  'Gāze (LPG)',
  'Cits'
]

const CURRENCIES = [
  { code: 'EUR', symbol: '€' },
  { code: 'USD', symbol: '$' },
  { code: 'GBP', symbol: '£' },
]

export default function PievienotAuto() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Formas dati
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [mileage, setMileage] = useState('')
  const [engineVolume, setEngineVolume] = useState('')
  const [fuelType, setFuelType] = useState('Dīzelis')

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Sagatavoti modeļi atkarībā no izvēlētās markas
  const availableModels = CAR_DATA[make] || []

  // Pievieno jaunos failus sarakstam
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const totalFiles = [...selectedFiles, ...newFiles]

      if (totalFiles.length > 10) {
        alert('Var pievienot maksimāli 10 attēlus!')
        setSelectedFiles(totalFiles.slice(0, 10))
      } else {
        setSelectedFiles(totalFiles)
      }
    }
  }

  // Dzēš bildi no izvēlētā saraksta
  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!make || !model) {
      alert('Lūdzu izvēlies vai ievadi auto marku un modeli!')
      return
    }

    if (selectedFiles.length > 10) {
      alert('Var pievienot maksimāli 10 attēlus!')
      return
    }

    setLoading(true)

    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${i}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('car-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error('Kļūda augšupielādējot bildi:', uploadError)
          continue
        }

        const { data: urlData } = supabase.storage
          .from('car-images')
          .getPublicUrl(fileName)

        if (urlData && urlData.publicUrl) {
          uploadedUrls.push(urlData.publicUrl)
        }
      }

      // Formatējam motora aprakstu (piem. "2.0 Dīzelis" vai "Elektro")
      const engineText = fuelType === 'Elektro' 
        ? 'Elektro' 
        : `${engineVolume ? engineVolume + ' ' : ''}${fuelType}`

      const fullTitle = `${make} ${model}`
      const symbol = CURRENCIES.find(c => c.code === currency)?.symbol || '€'

      // Saglabājam datus datubāzē
      const { error: insertError } = await supabase
        .from('cars')
        .insert([
          {
            title: fullTitle,
            price: Number(price),
            year: Number(year),
            mileage: mileage ? `${mileage} km` : '',
            engine: engineText,
            image: uploadedUrls[0] || '',
            images: uploadedUrls,
          },
        ])

      if (insertError) throw insertError

      alert('Sludinājums veiksmīgi pievienots!')
      router.push('/')
      router.refresh()
    } catch (err: any) {
      alert('Kļūda saglabājot: ' + (err.message || 'Nezināma kļūda'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: '650px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/" style={{ color: '#64748b', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block', fontWeight: 'bold' }}>
        ← Atpakaļ uz sākumu
      </Link>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', marginTop: 0, marginBottom: '1.5rem' }}>
          Pievienot jaunu sludinājumu
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Marka un Modelis */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>
                Auto Marka
              </label>
              <input
                type="text"
                list="car-makes-list"
                required
                placeholder="Sāc rakstīt vai izvēlies..."
                value={make}
                onChange={(e) => {
                  setMake(e.target.value)
                  setModel('') // Notīra modeli, ja maina marku
                }}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <datalist id="car-makes-list">
                {Object.keys(CAR_DATA).map((carMake) => (
                  <option key={carMake} value={carMake} />
                ))}
              </datalist>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>
                Modelis
              </label>
              <input
                type="text"
                list="car-models-list"
                required
                placeholder={make ? "Sāc rakstīt vai izvēlies..." : "Vispirms izvēlies marku"}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <datalist id="car-models-list">
                {availableModels.map((carModel) => (
                  <option key={carModel} value={carModel} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Cena un Valūta */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Cena un Valūta</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                required
                placeholder="piem. 4500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} ({c.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Gads un Nobraukums */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Izlaiduma gads</label>
              <input
                type="number"
                required
                placeholder="piem. 2018"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Nobraukums (km)</label>
              <input
                type="number"
                required
                placeholder="piem. 210000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Motors - Tilpums un Dzinēja veids */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>
                Motora tilpums {fuelType === 'Elektro' ? '(Nav nepieciešams)' : '(L)'}
              </label>
              <input
                type="text"
                placeholder="piem. 2.0 vai 3.0"
                disabled={fuelType === 'Elektro'}
                value={engineVolume}
                onChange={(e) => setEngineVolume(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: fuelType === 'Elektro' ? '#f1f5f9' : '#ffffff' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Degvielas veids</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
              >
                {FUEL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Attēlu pievienošana */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>
              Pievienot attēlus ({selectedFiles.length}/10)
            </label>
            
            {selectedFiles.length < 10 && (
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginBottom: '0.75rem' }}
              />
            )}

            {/* Bilžu priekšskatījums */}
            {selectedFiles.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {selectedFiles.map((file, index) => (
                  <div key={index} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Priekšskatījums"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                      title="Dzēst bildi"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#94a3b8' : '#22c55e',
              color: '#ffffff',
              padding: '0.875rem',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '1rem',
            }}
          >
            {loading ? 'Pievieno sludinājumu un ielādē bildes...' : 'Publicēt sludinājumu'}
          </button>
        </form>
      </div>
    </main>
  )
}
