'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

// Saraksts marku ieteikumiem filtrā
const CAR_MAKES = [
  'Audi', 'BMW', 'Chevrolet', 'Chrysler', 'Citroen', 'Dodge', 'Fiat', 'Ford', 
  'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Land Rover', 
  'Lexus', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Opel', 
  'Peugeot', 'Porsche', 'Renault', 'Seat', 'Skoda', 'Subaru', 'Suzuki', 
  'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
]

export default function Home() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filtru stāvokļi
  const [filterMake, setFilterMake] = useState('')
  const [filterModel, setFilterModel] = useState('')
  const [filterFuel, setFilterFuel] = useState('')
  const [filterTransmission, setFilterTransmission] = useState('')
  const [filterBodyType, setFilterBodyType] = useState('')
  const [filterPriceMin, setFilterPriceMin] = useState('')
  const [filterPriceMax, setFilterPriceMax] = useState('')
  const [filterYearMin, setFilterYearMin] = useState('')
  const [filterYearMax, setFilterYearMax] = useState('')
  const [filterMileageMax, setFilterMileageMax] = useState('')

  // Ieteikumu saraksti
  const [makeSuggestions, setMakeSuggestions] = useState<string[]>([])

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async (queryParams?: any) => {
    setLoading(true)
    let query = supabase.from('cars').select('*')

    // Pielietojam filtrus, ja tie ir norādīti
    if (queryParams) {
      if (queryParams.make) query = query.ilike('make', `%${queryParams.make}%`)
      if (queryParams.model) query = query.ilike('model', `%${queryParams.model}%`)
      if (queryParams.fuel) query = query.eq('fuel', queryParams.fuel)
      if (queryParams.transmission) query = query.ilike('transmission', `%${queryParams.transmission}%`)
      if (queryParams.bodyType) query = query.ilike('body_type', `%${queryParams.bodyType}%`)
      if (queryParams.priceMin) query = query.gte('price', Number(queryParams.priceMin))
      if (queryParams.priceMax) query = query.lte('price', Number(queryParams.priceMax))
      if (queryParams.yearMin) query = query.gte('year', Number(queryParams.yearMin))
      if (queryParams.yearMax) query = query.lte('year', Number(queryParams.yearMax))
      if (queryParams.mileageMax) query = query.lte('mileage', Number(queryParams.mileageMax))
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Kļūda ielādējot auto:', error)
    } else {
      setCars(data || [])
    }
    setLoading(false)
  }

  const handleSearchClick = () => {
    fetchCars({
      make: filterMake,
      model: filterModel,
      fuel: filterFuel,
      transmission: filterTransmission,
      bodyType: filterBodyType,
      priceMin: filterPriceMin,
      priceMax: filterPriceMax,
      yearMin: filterYearMin,
      yearMax: filterYearMax,
      mileageMax: filterMileageMax,
    })
  }

  const handleMakeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFilterMake(val)
    if (val.trim()) {
      setMakeSuggestions(CAR_MAKES.filter(m => m.toLowerCase().includes(val.toLowerCase())))
    } else {
      setMakeSuggestions([])
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '16px 12px', boxSizing: 'border-box' }}>
      
      {/* NEKUSTĪGAIS FILTRA BLOKS (Virs visiem ilustrētajiem sludinājumiem) */}
      <div style={{
        position: 'sticky',
        top: '10px',
        zIndex: 100,
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box'
      }}>
        
        {/* Filtra režģis */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
          
          {/* Marka */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Marka..."
              value={filterMake}
              onChange={handleMakeInput}
              onFocus={() => { if (!filterMake) setMakeSuggestions(CAR_MAKES) }}
              onBlur={() => setTimeout(() => setMakeSuggestions([]), 200)}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
            />
            {makeSuggestions.length > 0 && (
              <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '0 0 6px 6px', maxHeight: '150px', overflowY: 'auto', listStyle: 'none', margin: 0, padding: 0, zIndex: 50 }}>
                {makeSuggestions.map((m, idx) => (
                  <li
                    key={idx}
                    onClick={() => { setFilterMake(m); setMakeSuggestions([]) }}
                    style={{ padding: '7px 10px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Modelis */}
          <div>
            <input
              type="text"
              placeholder="Modelis..."
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Degvielas tips */}
          <div>
            <select
              value={filterFuel}
              onChange={(e) => setFilterFuel(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
            >
              <option value="">Degvielas tips (visi)</option>
              <option value="Dīzelis">Dīzelis</option>
              <option value="Benzīns">Benzīns</option>
              <option value="Hibrīds">Hibrīds</option>
              <option value="Elektrība">Elektrība</option>
              <option value="Gāze / Benzīns">Gāze / Benzīns</option>
            </select>
          </div>

          {/* Ātrumkārba */}
          <div>
            <input
              type="text"
              placeholder="Ātrumkārba (piem. Automāts)"
              value={filterTransmission}
              onChange={(e) => setFilterTransmission(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

        </div>

        {/* Otrā rinda: Virsbūve, Gads, Cena, Nobraukums */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          
          {/* Virsbūves tips */}
          <div>
            <input
              type="text"
              placeholder="Virsbūves tips (piem. Sedans)"
              value={filterBodyType}
              onChange={(e) => setFilterBodyType(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Gads no / līdz */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <input
              type="number"
              placeholder="Gads no"
              value={filterYearMin}
              onChange={(e) => setFilterYearMin(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
            />
            <input
              type="number"
              placeholder="līdz"
              value={filterYearMax}
              onChange={(e) => setFilterYearMax(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Cena no / līdz */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <input
              type="number"
              placeholder="Cena no (€)"
              value={filterPriceMin}
              onChange={(e) => setFilterPriceMin(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
            />
            <input
              type="number"
              placeholder="līdz"
              value={filterPriceMax}
              onChange={(e) => setFilterPriceMax(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Nobraukums līdz */}
          <div>
            <input
              type="number"
              placeholder="Maks. nobraukums (km)"
              value={filterMileageMax}
              onChange={(e) => setFilterMileageMax(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

        </div>

        {/* Meklēt Poga */}
        <div>
          <button
            onClick={handleSearchClick}
            style={{
              width: '100%',
              backgroundColor: '#f59e0b',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '11px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            Meklēt ({cars.length})
          </button>
        </div>

      </div>

      {/* ILUSTRĒTIE SLUDINĀJUMI */}
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px 0' }}>Aktīvie sludinājumi</h2>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Ielādē sludinājumus...</p>
      ) : cars.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Nav atrasts neviens auto ar šādiem kritērijiem.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {cars.map((car) => (
            <div key={car.id} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: '100%', height: '180px', backgroundColor: '#f3f4f6' }}>
                {car.image ? (
                  <img src={car.image} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#9ca3af', fontSize: '13px' }}>Bez foto</div>
                )}
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{car.make} {car.model}</h3>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{car.year ? `${car.year} g.` : ''} {car.engine ? `• ${car.engine}` : ''} {car.fuel ? `• ${car.fuel}` : ''}</p>
                <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#16a34a' }}>{car.price ? `${car.price.toLocaleString()} €` : 'Cena nav norādīta'}</span>
                  <Link href={`/auto/${car.id}`} style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>Skatīt →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
