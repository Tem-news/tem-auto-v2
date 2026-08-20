return (
    <header 
      style={{ 
        backgroundColor: '#0f172a', 
        color: '#ffffff', 
        padding: '12px 24px', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div style={{ width: '100%', maxWidth: '1150px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Kreisā puse: Logo un Skaitītājs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a 
            href="/" 
            style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e', textDecoration: 'none', cursor: 'pointer' }}
            onClick={(e) => {
              e.preventDefault()
              window.location.href = '/'
            }}
          >
            TemAuto
          </a>

          <button
            onClick={() => alert(`Kopējie unikālie apmeklējumi pēdējajās 24h: ${visitCount}`)}
            title="Apmeklētāju skaits pēdējo 24 stundu laikā"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#e2e8f0',
              fontWeight: '500'
            }}
          >
            <span style={{ fontSize: '14px' }}>👥</span>
            <span>Apmeklētāji 24h: <strong style={{ color: '#22c55e' }}>{visitCount}</strong></span>
          </button>
        </div>

        {/* Labā puse: Valoda, Reģions un Navigācija */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* 1. VALODAS IZVĒLNE AR SVG KAROGIEM */}
          <div style={{ position: 'relative' }} ref={langRef}>
            <button
              onClick={() => { setLangOpen(!langOpen); setRegionOpen(false); }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {currentLangObj && (
                <img 
                  src={`https://flagcdn.com/20x15/${currentLangObj.flagCode}.png`} 
                  alt="" 
                  style={{ width: '18px', height: '13px', borderRadius: '2px', objectFit: 'cover' }} 
                />
              )}
              Valoda: {currentLang} ▾
            </button>

            {langOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', width: '230px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', padding: '8px', zIndex: 100 }}>
                <input
                  type="text"
                  placeholder="Sāc rakstīt valodu..."
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  autoFocus
                  style={{ width: '100%', padding: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff', fontSize: '12px', boxSizing: 'border-box', marginBottom: '6px' }}
                />
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {filteredLanguages.map((l) => (
                    <div
                      key={l.code}
                      onClick={() => { setCurrentLang(l.code); setLangOpen(false); setLangSearch(''); }}
                      style={{ padding: '6px 8px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: currentLang === l.code ? '#22c55e' : '#e2e8f0', backgroundColor: currentLang === l.code ? '#334155' : 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentLang === l.code ? '#334155' : 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={`https://flagcdn.com/20x15/${l.flagCode}.png`} 
                          alt="" 
                          style={{ width: '18px', height: '13px', borderRadius: '2px', objectFit: 'cover' }} 
                        />
                        <span>{l.name}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#94a3b8', backgroundColor: '#0f172a', padding: '2px 5px', borderRadius: '3px' }}>{l.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. REĢIONA IZVĒLNE AR SVG KAROGIEM */}
          <div style={{ position: 'relative' }} ref={regionRef}>
            <button
              onClick={() => { setRegionOpen(!regionOpen); setLangOpen(false); }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {currentRegionObj && (
                <img 
                  src={`https://flagcdn.com/20x15/${currentRegionObj.flagCode}.png`} 
                  alt="" 
                  style={{ width: '18px', height: '13px', borderRadius: '2px', objectFit: 'cover' }} 
                />
              )}
              Reģions: {currentRegion} ▾
            </button>

            {regionOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', width: '260px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', padding: '8px', zIndex: 100 }}>
                <input
                  type="text"
                  placeholder="Meklēt reģionu / valsti..."
                  value={regionSearch}
                  onChange={(e) => setRegionSearch(e.target.value)}
                  autoFocus
                  style={{ width: '100%', padding: '6px', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff', fontSize: '12px', boxSizing: 'border-box', marginBottom: '6px' }}
                />
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {filteredRegions.map((r) => (
                    <div
                      key={r.name}
                      onClick={() => { setCurrentRegion(r.name); setRegionOpen(false); setRegionSearch(''); }}
                      style={{ padding: '6px 8px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: currentRegion === r.name ? '#22c55e' : '#e2e8f0', backgroundColor: currentRegion === r.name ? '#334155' : 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentRegion === r.name ? '#334155' : 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={`https://flagcdn.com/20x15/${r.flagCode}.png`} 
                          alt="" 
                          style={{ width: '18px', height: '13px', borderRadius: '2px', objectFit: 'cover' }} 
                        />
                        <span>{r.name}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{r.group}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigācija */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#cbd5e1', backgroundColor: '#1e293b', padding: '3px 10px', borderRadius: '12px', border: '1px solid #334155' }}>
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px' }}
                >
                  Izlogoties
                </button>
              </div>
            ) : (
              <Link href="/login" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px' }}>
                Ielogoties
              </Link>
            )}

            <a
              href="/pievienot"
              onClick={handleAddCarClick}
              style={{ backgroundColor: '#16a34a', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', display: 'inline-block', cursor: 'pointer' }}
            >
              + Pievienot auto
            </a>
          </nav>
        </div>

      </div>
    </header>
  )
