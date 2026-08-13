export default function Home() {
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
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        alignItems: 'end',
        marginBottom: '3rem'
      }}>
        {/* Marka */}
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

        {/* Modelis */}
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

        {/* Cena līdz */}
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

        {/* Meklēt poga */}
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
    </main>
  )
}
