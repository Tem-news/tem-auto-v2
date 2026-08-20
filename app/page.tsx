return (
    // Šis div nodrošina, ka visa lapa ir centrēta ekrānā
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      
      {/* Šis ir galvenais bloks, kas satur abus - sarakstu un reklāmu */}
      <div style={{ maxWidth: '1150px', width: '100%', display: 'flex', gap: '32px', alignItems: 'flex-start', justifyContent: 'center' }}>
        
        {/* Kreisā puse: Saraksts */}
        <div style={{ flex: 1, maxWidth: '800px' }}>
           {/* ... viss Tavs esošais saraksta saturs paliek šeit ... */}
           <div style={{ marginBottom: '24px' }}>
             <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Auto Tirgus</h1>
           </div>
           
           {/* (Tālāk meklētājs un pārējais, ko jau bijām salikuši) */}
           {/* ... (pārējais kods tāpat kā iepriekš) ... */}
        </div>

        {/* Labā puse: Reklāma */}
        <div style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '20px' }}>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Globālais baneris šeit!</p>
          </div>
        </div>

      </div>
    </div>
  )
