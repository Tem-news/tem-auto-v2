'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Sakumlapa() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [visitCount, setVisitCount] = useState<number>(0)

  // Globālie stāvokļi valodai un reģionam
  const [currentLang, setCurrentLang] = useState('LV')
  const [currentRegion, setCurrentRegion] = useState('Eiropa (EUR)')

  // Filtri
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    async function fetchData() {
      // 1. Reģistrējam pašreizējo apmeklējumu
      await supabase.from('site_visits').insert([{ region: currentRegion }])

      // 2. Ielādējam auto sludinājumus
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false })

      if (carsError) {
        console.error('Kļūda ielādējot auto:', carsError)
      } else {
        setCars(carsData || [])
      }

      // 3. Saskaitām apmeklējumus pēdējajās 24 stundās
      const twentyFourHoursAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString()
      const { count, error: countError } = await supabase
        .from('site_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo)

      if (!countError && count !== null) {
        setVisitCount(count)
      }

      setLoading(false)
    }

    fetchData()
  }, [currentRegion])

  // Valodas un Reģiona maiņas funkcijas (pagaidu paraugs ar izvēlni)
  const handleLanguageChange = () => {
    const langs = ['LV', 'EN', 'ES', 'ZH', 'JA', 'HI']
    const nextLang = langs[(langs.indexOf(currentLang) + 1) % langs.length]
    setCurrentLang(nextLang)
  }

  const handleRegionChange = () => {
    const regions = [
      { name: 'Eiropa (EUR)', code: 'Eiropa' },
      { name: 'ASV & Ziemeļamerika (USD)', code: 'ASV' },
      { name: 'Āzija / Ķīna / Japāna', code: 'Āzija' },
      { name: 'Dienvidamerika', code: 'Dienvidamerika' }
    ]
    const currentIndex = regions.findIndex(r => r.name === currentRegion)
    const nextRegion = regions[(currentIndex + 1) % regions.length]
    setCurrentRegion(nextRegion.name)
  }

  // Filtrēšanas loģika
  const filteredCars = cars.filter((car) => {
    const fullTitle = `${car.make || ''} ${car.model || ''}`.toLowerCase()
    const matchesSearch = fullTitle.includes(search.toLowerCase())
    const matchesPrice = maxPrice ? Number(car.price) <= Number(maxPrice) : true

    return matchesSearch && matchesPrice
  })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Augšējā josla ar skaitītāju un globālajām izvēlnēm */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Auto Tirgus</h1>
          
          {/* Apmeklētāju skaitītāja poga */}
          <button
            onClick={() => alert(`Kopējie unikālie apmeklējumi pēdējajās 24h: ${visitCount}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#374151',
              fontWeight: '500'
            }}
          >
            <span style={{ width: '8px', height: '8px', backgroundColor: '#16a34a', borderRadius: '50%', display: 'inline-block' }}></span>
            <span>24h: <strong>{visitCount}</strong></span>
          </button>
        </div>

        {/* Globālās vadības pogas: Valoda un Reģions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleLanguageChange}
            style={{
              padding: '6px 12px',
              backgroundColor: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#374151'
            }}
            title="Mainīt valodu"
          >
            🌐 Valoda: {currentLang}
          </button>

          <button
            onClick={handleRegionChange}
            style={{
              padding: '6px 12px',
              backgroundColor: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#374151'
            }}
            title="Mainīt reģionu"
          >
            🌍 Reģions: {currentRegion}
          </button>
        </div>
      </div>

      {/* Galvenais izkārtojums: Saturs pa kreisi, Reklāma pa labi */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Kreisā puse: Meklētājs un Sludinājumi */}
        <div style={{ flex: 1, minWidth: 0 }}>
          
          {/* Meklēšanas un Filtru josla */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            <div style={{ flex: '1', minWidth: '180px' }}>
              <input
                type="text"
                placeholder="Meklēt pēc markas vai modeļa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ width: '140px' }}>
              <input
                type="number"
                placeholder="Maks. cena (€)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
              />
            </div>
            {(search || maxPrice) && (
              <button
                onClick={() => { setSearch(''); setMaxPrice(''); }}
                style={{ padding: '10px 14px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Notīrīt
              </button>
            )}
          </div>

          {/* Sludinājumu Saraksts */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Ielādē sludinājumus...</div>
          ) : filteredCars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Nav atrasts neviens auto.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {filteredCars.map((car) => (
                <Link
                  key={car.id}
                  href={`/auto/${car.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      backgroundColor: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ height: '160px', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
                      {car.image ? (
                        <img src={car.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>Nav attēla</div>
                      )}
                    </div>
                    <div style={{ padding: '14px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#111827' }}>
                        {car.make} {car.model}
                      </h2>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>
                        {car.year} g. {car.engine ? `• ${car.engine}` : ''}
                      </p>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>
                        €{car.price}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Labā puse: Reklāmas josla */}
        <div style={{ width: '260px', position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Globālais baneris šeit!<br/><span style={{ fontSize: '12px' }}>(Pielāgots reģionam)</span></p>
          </div>
        </div>

      </div>
    </div>
  )
}
