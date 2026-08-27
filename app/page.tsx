'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Sākotnējais marku saraksts divās kolonnās kā oriģinālā
  const makesPairs = [
    [{ name: 'Alfa Romeo', count: 6 }, { name: 'Audi', count: 7 }],
    [{ name: 'BMW', count: 11 }, { name: 'Chevrolet', count: 4 }],
    [{ name: 'Chrysler', count: 5 }, { n'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Kļūda ielādējot auto:', error.message)
      } else {
        setCars(data || [])
      }
    } catch (err) {
      console.error('Negaidīta kļūda:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Auto Tirgus</h1>

      {loading ? (
        <p>Ielādē sludinājumus...</p>
      ) : cars.length === 0 ? (
        <p>Nav atrasts neviens sludinājums.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {cars.map((car) => (
            <Link 
              key={car.id} 
              href={`/auto/${car.id}`} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: '#fff', cursor: 'pointer', transition: 'transform 0.2s' }}>
                {car.image && (
                  <img 
                    src={car.image} 
                    alt={`${car.make} ${car.model}`} 
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
                  />
                )}
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{car.make} {car.model}</h3>
                  <p style={{ margin: '0 0 5px 0', color: '#666' }}>Gads: {car.year}</p>
                  <p style={{ margin: '0', fontWeight: 'bold', color: '#0070f3' }}>Cena: {car.price} €</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}ame: 'Citroen', count: 3 }],
    [{ name: 'Cupra', count: 4 }, { name: 'Dacia', count: 4 }],
    [{ name: 'Dodge', count: 2 }, { name: 'Fiat', count: 3 }],
    [{ name: 'Ford', count: 4 }, { name: 'Honda', count: 3 }],
    [{ name: 'Hyundai', count: 3 }, { name: 'Jaguar', count: 3 }],
    [{ name: 'Jeep', count: 2 }, { name: 'Kia', count: 2 }],
    [{ name: 'Lancia', count: 2 }, { name: 'Land Rover', count: 3 }],
    [{ name: 'Lexus', count: 1 }, { name: 'Mazda', count: 2 }],
    [{ name: 'Mercedes-Benz', count: 3 }, { name: 'Mini', count: 1 }],
    [{ name: 'Mini Cooper', count: 1 }, { name: 'Mitsubishi', count: 3 }],
    [{ name: 'Nissan', count: 2 }, { name: 'Opel', count: 4 }],
    [{ name: 'Peugeot', count: 3 }, { name: 'Porsche', count: 3 }],
    [{ name: 'Renault', count: 2 }, { name: 'Saab', count: 3 }],
    [{ name: 'Seat', count: 1 }, { name: 'Seet', count: 1 }],
    [{ name: 'Skoda', count: 3 }, { name: 'Smart', count: 2 }],
    [{ name: 'Subaru', count: 2 }, { name: 'Suzuki', count: 2 }],
    [{ name: 'Tesla', count: 3 }, { name: 'Toyota', count: 3 }],
    [{ name: 'Volkswagen', count: 4 }, { name: 'Volvo', count: 3 }],
    [{ name: 'Zaz', count: 1 }]
  ]

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false })

    if (error) {
      console.error('Kļūda ielādējot auto:', error)
    } else {
      setCars(data || [])
    }
    setLoading(false)
  }

  return (
    <div style={{ width: '100%', maxWidth: '1500px', margin: '0 auto', padding: '10px', boxSizing: 'border-box' }}>
      
      {/* 3 KOLONNU STRUKTŪRA */}
      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr 240px', gap: '12px', alignItems: 'start' }}>
        
        {/* KREISĀ MALA: Markas */}
        <div style={{ 
          background: '#fff', 
          border: '1px solid #dcdcdc', 
          borderRadius: '4px', 
          padding: '10px', 
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1a56db', cursor: 'pointer' }}>Visas markas</span>
            <span style={{ fontSize: '12px', color: '#666' }}>(130)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {makesPairs.map((pair, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {pair.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      padding: '2px 4px',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      color: '#333'
                    }}
                  >
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                    <span style={{ fontSize: '11px', color: '#888', marginLeft: '4px' }}>({item.count})</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Cits</div>
            <Link href="#" style={{ fontSize: '11px', color: '#1a56db', textDecoration: 'none', lineHeight: '1.2', display: 'block' }}>Nestandarta pakalpojumi, maiņa, remonts u.c.</Link>
          </div>
        </div>

        {/* VIDUS: Sākumlapas saturs / Sludinājumi */}
        <div style={{ minWidth: 0 }}>
          
          <div style={{ background: '#fff', border: '1px solid #dcdcdc', borderRadius: '4px', padding: '16px', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111', margin: '0 0 12px 0' }}>Auto Tirgus</h1>
          </div>

          {/* SLUDINĀJUMU REŽĢIS */}
          {loading ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Ielādē...</p>
          ) : cars.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Nav atrasti sludinājumi.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {cars.map((car) => (
                <div key={car.id} style={{ background: '#fff', border: '1px solid #dcdcdc', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
                      <Link href={`/auto/${car.id}`} style={{ fontSize: '11px', color: '#1a56db', textDecoration: 'none' }}>Skatīt</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* LABĀ MALA: Reklāmas baneri */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
          <div style={{ background: '#f9f9f9', border: '1px dashed #ccc', padding: '20px', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '11px', borderRadius: '4px', boxSizing: 'border-box' }}>
            <span style={{ textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Reklāma</span>
            Globālais baneris šeit!
          </div>
          <div style={{ background: '#f9f9f9', border: '1px dashed #ccc', padding: '20px', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '11px', borderRadius: '4px', boxSizing: 'border-box' }}>
            <span style={{ textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Reklāma</span>
            Globālais baneris šeit!
          </div>
        </div>

      </div>
    </div>
  )
}
