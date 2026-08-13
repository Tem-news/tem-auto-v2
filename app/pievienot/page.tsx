export default function AddCar() {
  return (
    <main style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h1 style={{ fontSize: '1.75rem', color: '#0f172a', marginBottom: '1.5rem', textAlign: 'center' }}>
        Pievienot jaunu auto sludinājumu
      </h1>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Nosaukums / Modelis</label>
          <input type="text" placeholder="Piem., BMW 530d M-Sport" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Cena (€)</label>
            <input type="number" placeholder="21500" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Izlaiduma gads</label>
            <input type="number" placeholder="2018" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Nobraukums (km)</label>
            <input type="text" placeholder="185 000 km" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Motors</label>
            <input type="text" placeholder="3.0 Dīzelis" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Attēla saite (URL)</label>
          <input type="url" placeholder="https://..." style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
        </div>

        <button type="submit" style={{ backgroundColor: '#22c55e', color: '#fff', padding: '0.875rem', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '1rem' }}>
          Publicēt sludinājumu
        </button>
      </form>
    </main>
  )
}
