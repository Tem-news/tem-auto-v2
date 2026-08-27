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
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '10px' }}>
      
      {/* Galvenais izkārtojums trīs kolonnās */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 220px', gap: '12px', alignItems: 'start' }}>
        
        {/* KREISĀ MALA: Markas */}
        <div style={{ background: '#fff', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0044cc', cursor: 'pointer' }} onClick={() => { setFilterMake(''); fetchCars(); }}>Visas markas</span>
            <span style={{ fontSize: '12px', color: '#666' }}>(130)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '700px', overflowY: 'auto' }}>
            {makesList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleMakeSelect(item.name)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  padding: '3px 4px',
                  cursor: 'pointer',
                  background: filterMake === item.name ? '#e6f0ff' : 'transparent',
                  color: filterMake === item.name ? '#0044cc' : '#333'
                }}
              >
                <span>{item.name}</span>
                <span style={{ color: '#888' }}>({item.count})</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '6px' }}>
            <div style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', marginBottom: '4px' }}>CITS</div>
            <Link href="#" style={{ fontSize: '11px', color: '#0044cc', textDecoration: 'none' }}>Nestandarta pakalpojumi, maiņa, remonts u.c.</Link>
          </div>
        </div>

        {/* VIDUS: Standarta filtrs un sludinājumi (bez sticky, skrollējas kopā ar lapu) */}
        <div>
          
          {/* Virsraksts un parastais filtrs */}
          <div style={{ background: '#f5f5f5', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '12px' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Auto Tirgus</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Meklēt marku..."
                value={filterMake}
                onChange={(e) => setFilterMake(e.target.value)}
                style={{ padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff' }}
              />
              <input
                type="text"
                placeholder="Meklēt modeli..."
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                style={{ padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff' }}
              />
              <select
                value={filterFuel}
                onChange={(e) => setFilterFuel(e.target.value)}
                style={{ padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff' }}
              >
                <option value="">Degvielas tips</option>
                <option value="Dīzelis">Dīzelis</option>
                <option value="Benzīns">Benzīns</option>
                <option value="Hibrīds">Hibrīds</option>
                <option value="Elektrība">Elektrība</option>
              </select>
              <input
                type="text"
                placeholder="Ātrumkārba"
                value={filterTransmission}
                onChange={(e) => setFilterTransmission(e.target.value)}
                style={{ padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Virsbūves tips"
                value={filterBodyType}
                onChange={(e) => setFilterBodyType(e.target.value)}
                style={{ padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <input type="number" placeholder="Gads no" value={filterYearMin} onChange={(e) => setFilterYearMin(e.target.value)} style={{ padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff' }} />
                <input type="number" placeholder="līdz" value={filterYearMax} onChange={(e) => setFilterYearMax(e.target.value)} style={{ padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <input type="number" placeholder="Min €" value={filterPriceMin} onChange={(e) => setFilterPriceMin(e.target.value)} style={{ padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff' }} />
                <input type="number" placeholder="Maks €" value={filterPriceMax} onChange={(e) => setFilterPriceMax(e.target.value)} style={{ padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff' }} />
              </div>
              <input
                type="number"
                placeholder="Maks. nobraukums"
                value={filterMileageMax}
                onChange={(e) => setFilterMileageMax(e.target.value)}
                style={{ padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff' }}
              />
            </div>

            <button
              onClick={handleSearchClick}
              style={{
                width: '100%',
                background: '#ff9900',
                color: '#fff',
                border: 'none',
                padding: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderRadius: '3px'
              }}
            >
              Meklēt ({cars.length})
            </button>
          </div>

          {/* Sludinājumu režģis */}
          {loading ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Ielādē...</p>
          ) : cars.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Nav atrasti sludinājumi.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {cars.map((car) => (
                <div key={car.id} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '130px', background: '#eee' }}>
                    {car.image ? (
                      <img src={car.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', fontSize: '11px' }}>Foto nav</div>
                    )}
                  </div>
                  <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#111' }}>{car.make} {car.model}</div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>{car.year ? `${car.year} g.` : ''} {car.engine ? `• ${car.engine}` : ''}</div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#00aa00' }}>{car.price ? `${car.price} €` : ''}</span>
                      <Link href={`/auto/${car.id}`} style={{ fontSize: '11px', color: '#0044cc', textDecoration: 'none' }}>Skatīt</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* LABĀ MALA: Baneri */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: '#f9f9f9', border: '1px dashed #ccc', padding: '20px', textAlign: 'center', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '12px', borderRadius: '4px' }}>
            Reklāmas baneris
          </div>
          <div style={{ background: '#f9f9f9', border: '1px dashed #ccc', padding: '20px', textAlign: 'center', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '12px', borderRadius: '4px' }}>
            Reklāmas baneris
          </div>
        </div>

      </div>
    </div>
  )
}
