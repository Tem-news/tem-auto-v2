export default function Home() {
  // Pagaidu dati auto kartītēm
  const cars = [
    {
      id: 1,
      title: 'BMW 530d M-Sport',
      year: 2018,
      mileage: '185 000 km',
      engine: '3.0 Dīzelis',
      price: '21 500 €',
      image: 'https://images.unsplash.com/photo-1555215695-3004980adade?w=600&q=80'
    },
    {
      id: 2,
      title: 'Audi A6 Avant S-Line',
      year: 2019,
      mileage: '142 000 km',
      engine: '2.0 Dīzelis',
      price: '23 900 €',
      image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=600&q=80'
    },
    {
      id: 3,
      title: 'Volkswagen Passat B8',
      year: 2017,
      mileage: '198 000 km',
      engine: '2.0 Dīzelis',
      price: '13 800 €',
      image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80'
    }
  ]

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Virsraksts un apakšvirsraksts */}
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '0.5rem' }}>
          Atrodi savu nākamo auto
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Lielākais un uzticamākais auto sludinājumu portāls
        </p>
      </section>

      {/* Meklēšanas filtrs */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        alignItems: 'end',
        marginBottom: '4rem'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>
            Marka
          </label>
          <select style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
            <option value="">Visas markas</option>
            <option value="bmw">BMW</option>
            <option value="audi">Audi</option>
            <option value="vw">Volkswagen</option>
            <option value="mercedes">Mercedes-Benz</option>
            <option value="volvo">Volvo</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>
            Modelis
          </label>
          <input 
            type="text" 
            placeholder="Piem., 320, A4, Passat" 
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>
            Cena līdz (€)
          </label>
          <input 
            type="number" 
            placeholder="Piem., 10000" 
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <button style={{
          backgroundColor: '#22c55e',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          border: 'none',
          fontWeight: '600',
          fontSize: '1rem',
          cursor: 'pointer'
        }}>
          Meklēt auto
        </button>
      </div>

      {/* Jaunākie sludinājumi */}
      <section>
        <h2 style={{ fontSize: '1.75rem', color: '#0f172a', marginBottom: '1.5rem' }}>
          Jaunākie sludinājumi
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {cars.map((car) => (
            <div key={car.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <img 
                src={car.image} 
                alt={car.title} 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
              />
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#0f172a' }}>
                  {car.title}
                </h3>
                <p style={{ color: '#22c55e', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
                  {car.price}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.875rem' }}>
                  <span>{car.year}. g.</span>
                  <span>{car.mileage}</span>
                  <span>{car.engine}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
