'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

interface Car {
  id: number
  title: string
  price: number
  year: number
  mileage: string
  engine: string
  fuelType?: string
  image?: string
  images?: string[]
}

export default function AutoSaraksts() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  // Filtru stāvokļi (states)
  const [searchQuery, setSearchQuery] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minYear, setMinYear] = useState('')
  const [selectedFuel, setSelectedFuel] = useState('Visi')

  useEffect(() => {
    async function fetchCars() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('Kļūda iegūstot sludinājumus:', error)
      } else {
        setCars(data || [])
      }
      setLoading(false)
    }

    fetchCars()
  }, [])

  // Attēla ieguve
  const getDisplayImage = (car: Car) => {
    if (car.image && car.image.trim() !== '') {
      return car.image
    }
    if (car.images && Array.isArray(car.images) && car.images.length > 0) {
      const firstExtra = car.images[0]
      if (firstExtra && firstExtra.trim() !== '') {
        return firstExtra
      }
    }
    return null
  }

  // Filtrēšanas loģika
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // 1. Meklēšanas frāze nosaukumā
      if (
        searchQuery &&
        !car.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // 2. Maksomālā cena
      if (maxPrice && car.price > Number(maxPrice)) {
        return false
      }

      // 3. Minimālais gads
      if (minYear && car.year < Number(minYear)) {
        return false
      }

      // 4. Degvielas tips (ja norādīts sludinājumā vai dzinēja aprakstā)
      if (selectedFuel !== 'Visi') {
        const fuel = (car.fuelType || car.engine || '').toLowerCase()
        if (!fuel.includes(selectedFuel.toLowerCase())) {
          return false
        }
      }

      return true
    })
  }, [cars, searchQuery, maxPrice, minYear, selectedFuel])

  // Filtru notīrīšana
  const handleClearFilters = () => {
    setSearchQuery('')
    setMaxPrice('')
    setMinYear('')
    setSelectedFuel('Visi')
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <p>Ielādē sludinājumus...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      {/* Galvene */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>TemAuto Sludinājumi</h1>
        <Link
          href="/auto/new"
          style={{
            padding: '10px 18px',
            backgroundColor: '#28a745',
            color: '#fff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          ➕ Pievienot sludinājumu
        </Link>
      </div>

      {/* Meklēšanas un filtrēšanas josla */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '30px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px', color: '#333' }}>
          🔍 Meklēt un filtrēt
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            alignItems: 'end'
          }}
        >
          {/* Meklēšana pēc nosaukuma */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Marka / Modelis
            </label>
            <input
              type="text"
              placeholder="Pim., Audi A4..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Maksomālā cena */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Cena līdz (€)
            </label>
            <input
              type="number"
              placeholder="Pim., 5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Minimālais gads */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Gads no
            </label>
            <input
              type="number"
              placeholder="Pim., 2015"
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Degviela */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Degviela
            </label>
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '14px',
                backgroundColor: '#fff',
                boxSizing: 'border-box'
              }}
            >
              <option value="Visi">Visi dzinēji</option>
              <option value="Dīzelis">Dīzelis</option>
              <option value="Benzīns">Benzīns</option>
              <option value="Hibrīds">Hibrīds</option>
              <option value="Elektro">Elektro</option>
            </select>
          </div>

          {/* Pogas resetam */}
          <div>
            <button
              type="button"
              onClick={handleClearFilters}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                backgroundColor: '#e9ecef',
                color: '#333',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Notīrīt
            </button>
          </div>
        </div>

        <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
          Atrodis {filteredCars.length} no {cars.length} sludinājumiem
        </div>
      </div>

      {/* Sludinājumu saraksts */}
      {filteredCars.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
          <p style={{ fontSize: '18px', margin: '0 0 10px 0' }}>Saskaņā ar izvēlētajiem filtriem neviens auto netika atrasts.</p>
          <button
            onClick={handleClearFilters}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0066cc',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Rādīt visus sludinājumus
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredCars.map((car) => {
            const displayImg = getDisplayImage(car)

            return (
              <Link
                key={car.id}
                href={`/auto/${car.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer'
                }}
              >
                {/* Attēls */}
                <div style={{ height: '180px', width: '100%', backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
                  {displayImg ? (
                    <img
                      src={displayImg}
                      alt={car.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                      Nav attēla
                    </div>
                  )}
                </div>

                {/* Dati */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#111' }}>{car.title}</h3>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745', marginBottom: '12px' }}>
                    {car.price} €
                  </div>

                  <div style={{ fontSize: '14px', color: '#555', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                    <div><strong>Gads:</strong> {car.year}</div>
                    <div><strong>Nobraukums:</strong> {car.mileage}</div>
                    <div><strong>Dzinējs:</strong> {car.engine}</div>
                  </div>

                  <div
                    style={{
                      marginTop: 'auto',
                      padding: '10px',
                      backgroundColor: '#0066cc',
                      color: '#fff',
                      textAlign: 'center',
                      borderRadius: '6px',
                      fontWeight: 'bold'
                    }}
                  >
                    Apskatīt
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
