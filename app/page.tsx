'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Home() {
  const router = useRouter()
  const [cars, setCars] = useState<any[]>([])
  const [makes, setMakes] = useState<string[]>([])
  const [selectedMake, setSelectedMake] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // 1. Ielādējam markas un auto datus, kā arī atjaunojam iepriekšējo izvēli no sessionStorage
  useEffect(() => {
    async function initData() {
      setLoading(true)

      // Iegūstam visus auto no Supabase
      const { data, error } = await supabase.from('cars').select('*')

      if (error) {
        console.error('Kļūda ielādējot auto:', error)
      } else if (data) {
        setCars(data)
        // Savācam unikālās markas sarakstam
        const uniqueMakes = Array.from(new Set(data.map((car: any) => car.make).filter(Boolean))) as string[]
        setMakes(uniqueMakes)
      }

      // Pārbaudām, vai sessionStorage nav saglabāta iepriekšējā marka
      if (typeof window !== 'undefined') {
        const savedMake = sessionStorage.getItem('selectedMake')
        if (savedMake) {
          setSelectedMake(savedMake)
        }
      }

      setLoading(false)
    }

    initData()
  }, [])

  // 2. Kad lietotājs izvēlas marku, saglabājam to sessionStorage
  const handleMakeChange = (make: string) => {
    setSelectedMake(make)
    if (typeof window !== 'undefined') {
      if (make) {
        sessionStorage.setItem('selectedMake', make)
      } else {
        sessionStorage.removeItem('selectedMake')
      }
    }
  }

  // Filtrējam auto pēc izvēlētās markas
  const filteredCars = selectedMake
    ? cars.filter((car) => car.make?.toLowerCase() === selectedMake.toLowerCase())
    : cars

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '40px auto', textAlign: 'center', fontFamily: 'sans-serif', color: '#6b7280' }}>
        Ielādē sludinājumus...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>
        Auto Sludinājumi
      </h1>

      {/* Marku izvēles josla / pogas */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => handleMakeChange('')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            backgroundColor: selectedMake === '' ? '#2563eb' : '#f9fafb',
            color: selectedMake === '' ? '#fff' : '#374151',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Visas markas
        </button>

        {makes.map((make) => (
          <button
            key={make}
            onClick={() => handleMakeChange(make)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: selectedMake === make ? '#2563eb' : '#f9fafb',
              color: selectedMake === make ? '#fff' : '#374151',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {make}
          </button>
        ))}
      </div>

      {/* Auto saraksts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredCars.map((car) => {
          const mainImage = car.image || (car.images && car.images[0]) || 'https://via.placeholder.com/300x200?text=Nav+bildes'
          
          return (
            <Link
              key={car.id}
              href={`/auto/${car.id}`}
              onClick={() => {
                // Pirms pārejas uz auto lapu, drošības pēc vēlreiz saglabājam izvēlēto marku
                if (typeof window !== 'undefined' && selectedMake) {
                  sessionStorage.setItem('selectedMake', selectedMake)
                }
              }}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ width: '100%', height: '180px', backgroundColor: '#f3f4f6' }}>
                <img src={mainImage} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                  {car.make} {car.model}
                </h3>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#16a34a' }}>
                  {car.price ? `${car.price} €` : 'Cena nav norādīta'}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                  {car.year ? `${car.year}.g.` : ''} {car.engine ? `• ${car.engine}` : ''}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {filteredCars.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Šai markai pagaidām nav sludinājumu.
        </div>
      )}
    </div>
  )
}
