'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

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

  // Marku saraksts ar skaitļiem kreisajai malai
  const makesList = [
    { name: 'Alfa Romeo', count: 6 },
    { name: 'Audi', count: 7 },
    { name: 'BMW', count: 11 },
    { name: 'Chevrolet', count: 4 },
    { name: 'Chrysler', count: 5 },
    { name: 'Citroen', count: 3 },
    { name: 'Cupra', count: 4 },
    { name: 'Dacia', count: 4 },
    { name: 'Dodge', count: 2 },
    { name: 'Fiat', count: 3 },
    { name: 'Ford', count: 4 },
    { name: 'Honda', count: 3 },
    { name: 'Hyundai', count: 3 },
    { name: 'Jaguar', count: 3 },
    { name: 'Jeep', count: 2 },
    { name: 'Kia', count: 2 },
    { name: 'Lancia', count: 2 },
    { name: 'Land Rover', count: 3 },
    { name: 'Lexus', count: 1 },
    { name: 'Mazda', count: 2 },
    { name: 'Mercedes-Benz', count: 3 },
    { name: 'Mini', count: 1 },
    { name: 'Mini Cooper', count: 1 },
    { name: 'Mitsubishi', count: 3 },
    { name: 'Nissan', count: 2 },
    { name: 'Opel', count: 4 },
    { name: 'Peugeot', count: 3 },
    { name: 'Porsche', count: 3 },
    { name: 'Renault', count: 2 },
    { name: 'Saab', count: 3 },
    { name: 'Seat', count: 1 },
    { name: 'Skoda', count: 3 },
    { name: 'Smart', count: 2 },
    { name: 'Subaru', count: 2 },
    { name: 'Suzuki', count: 2 },
    { name: 'Tesla', count: 3 },
    { name: 'Toyota', count: 3 },
    { name: 'Volkswagen', count: 4 },
    { name: 'Volvo', count: 3 },
    { name: 'Zaz', count: 1 }
  ]

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async (queryParams?: any) => {
    setLoading(true)
    let query = supabase.from('cars').select('*')

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

  const handleMakeSelect = (makeName: string) => {
    if (filterMake === makeName) {
      setFilterMake('')
      fetchCars()
    } else {
      setFilterMake(makeName)
      fetchCars({ make: makeName })
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '16px 12px', boxSizing: 'border-box' }}>
      
      {/* 3 KOLONNU STRUKTŪRA: Kreisā mala (Markas) | Vidus (Filtrs + Sludinājumi) | Labā mala (Baneri) */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 240px', gap: '16px', alignItems: 'start', width: '100%' }}>
        
        {/* KREISĀ MALA: Auto marku saraksts */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1d4ed8', cursor: 'pointer' }} onClick={() => { setFilterMake(''); fetchCars(); }}>Visas markas</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>(130)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '650px', overflowY: 'auto' }}>
            {makesList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleMakeSelect(item.name)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: filterMake === item.name ? '#eff6ff' : 'transparent',
                  color: filterMake === item.name ? '#1d4ed8' : '#374151',
                  fontWeight: filterMake === item.name ? 'bold' : 'normal'
                }}
                onMouseEnter={(e) => { if (filterMake !== item.name) e.currentTarget.style.backgroundColor = '#f9fafb' }}
                onMouseLeave={(e) => { if (filterMake !== item.name) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span>{item.name}</span>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>({item.count})</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '6px' }}>Cits</div>
            <Link href="#" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none' }}>Nestandarta pakalpojumi, maiņa, remonts u.c.</Link>
          </div>
        </div>

        {/* VIDUS: Nekustīgais filtrs + ilustrētie sludinājumi */}
        <div style={{ minWidth: 0 }}>
          
          {/* NEKUSTĪGAIS FILTRS (Virs ilustrētajiem sludinājumiem, bez virsrakstiem/zīmējumiem) */}
          <div style={{
            position: 'sticky',
            top: '10px',
            zIndex: 100,
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            boxSizing: 'border-box'
          }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Meklēt marku..."
                value={filterMake}
                onChange={(e) => setFilterMake(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
              />
              <input
                type="text"
                placeholder="Meklēt modeli..."
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
              />
              <select
                value={filterFuel}
                onChange={(e) => setFilterFuel(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
              >
                <option value="">Degvielas tips</option>
                <option value="Dīzelis">Dīzelis</option>
                <option value="Benzīns">Benzīns</option>
                <option value="Hibrīds">Hibrīds</option>
                <option value="Elektrība">Elektrība</option>
                <option value="Gāze / Benzīns">Gāze / Benzīns</option>
              </select>
              <input
                type="text"
                placeholder="Ātrumkārba"
                value={filterTransmission}
                onChange={(e) => setFilterTransmission(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Virsbūves tips"
                value={filterBodyType}
                onChange={(e) => setFilterBodyType(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <input type="number" placeholder="Gads no" value={filterYearMin} onChange={(e) => setFilterYearMin(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
                <input type="number" placeholder="līdz" value={filterYearMax} onChange={(e) => setFilterYearMax(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <input type="number" placeholder="Min €" value={filterPriceMin} onChange={(e) => setFilterPriceMin(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
                <input type="number" placeholder="Maks €" value={filterPriceMax} onChange={(e) => setFilterPriceMax(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
              <input
                type="number"
                placeholder="Maks. nobraukums km"
                value={filterMileageMax}
                onChange={(e) => setFilterMileageMax(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <button
                onClick={handleSearchClick}
                style={{
                  width: '100%',
                  backgroundColor: '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px',
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
          <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', boxSizing: 'border-box' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px 0' }}>Auto Tirgus</h2>

            {loading ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Ielādē sludinājumus...</p>
            ) : cars.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Nav atrasts neviens auto ar šādiem kritērijiem.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '14px' }}>
                {cars.map((car) => (
                  <div key={car.id} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ width: '100%', height: '140px', backgroundColor: '#f3f4f6' }}>
                      {car.image ? (
                        <img src={car.image} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#9ca3af', fontSize: '12px' }}>Bez foto</div>
                      )}
                    </div>
                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{car.make} {car.model}</h3>
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{car.year ? `${car.year} g.` : ''} {car.engine ? `• ${car.engine}` : ''}</p>
                      <div style={{ marginTop: 'auto', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#16a34a' }}>{car.price ? `${car.price.toLocaleString()} €` : 'Cena nav'}</span>
                        <Link href={`/auto/${car.id}`} style={{ fontSize: '11px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>Skatīt →</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* LABĀ MALA: Reklāmas baneri */}
        <div style={{ position: 'sticky', top: '10px', alignSelf: 'start', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
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
