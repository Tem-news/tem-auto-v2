'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function HomePage() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCars() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setCars(data)
      }
      setLoading(false)
    }

    fetchCars()
  }, [])

  return (
    <div style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#ffffff', padding: '20px' }}>
      
      {/* Galvenais lapas konteiners trīs kolonnās */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '20px', maxWidth: '1400px', margin: '0 auto', alignItems: 'start' }}>
        
        {/* KREISAIS BLOKS (Marku filtrs / Navigācija) */}
        <aside 
          style={{ 
            position: 'sticky', 
            top: '80px', 
            backgroundColor: '#0f172a', 
            border: '1px solid #1e293b', 
            borderRadius: '12px', 
            padding: '16px',
            boxSizing: 'border-box'
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#22c55e' }}>
            Auto Markas
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <li><Link href="/?marka=audi" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Audi</Link></li>
            <li><Link href="/?marka=bmw" style={{ color: '#cbd5e1', textDecoration: 'none' }}>BMW</Link></li>
            <li><Link href="/?marka=volkswagen" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Volkswagen</Link></li>
            <li><Link href="/?marka=volvo" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Volvo</Link></li>
            <li><Link href="/?marka=toyota" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Toyota</Link></li>
            <li><Link href="/?marka=mercedes" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Mercedes-Benz</Link></li>
          </ul>
        </aside>

        {/* VIDĒJAIS BLOKS (Galvenais saturs / Sludinājumu saraksts) */}
        <main style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', minHeight: '800px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>
            Jaunākie auto sludinājumi
          </h1>

          {loading ? (
            <p style={{ color: '#94a3b8' }}>Notiek datu ielāde...</p>
          ) : cars.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Pagaidām nav pievienots neviens sludinājums.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {cars.map((car) => (
                <div key={car.id} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>{car.brand} {car.model}</h3>
                  <p style={{ fontSize: '14px', color: '#22c55e', fontWeight: 'bold' }}>{car.price} €</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>Gads: {car.year}</p>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* LABAIS BLOKS (Reklāmas / Papildus informācija) */}
        <aside 
          style={{ 
            position: 'sticky', 
            top: '80px', 
            backgroundColor: '#0f172a', 
            border: '1px solid #1e293b', 
            borderRadius: '12px', 
            padding: '16px',
            boxSizing: 'border-box'
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#22c55e' }}>
            Reklāma
          </h3>
          <div style={{ backgroundColor: '#1e293b', height: '250px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px' }}>
            Banera vieta
          </div>
        </aside>

      </div>
    </div>
  )
}
