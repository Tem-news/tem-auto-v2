type InfoPageHeaderProps = {
  title: string
}

export default function InfoPageHeader({ title }: InfoPageHeaderProps) {
  return (
    <header
      style={{
        display: 'grid',
        gridTemplateColumns: '88px minmax(0, 1fr) 88px',
        alignItems: 'center',
        minHeight: '88px',
        marginBottom: '16px',
        padding: '10px 12px',
        color: '#ffffff',
        background: '#0f172a',
        borderRadius: '12px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
        <span style={{ fontSize: '18px', lineHeight: 1, fontWeight: 700, whiteSpace: 'nowrap' }}>TemAuto</span>
        <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '58px', height: '34px', marginTop: '4px', transform: 'rotate(-3deg)' }}>
          <svg viewBox="0 0 64 32" width="56" height="30" role="img" aria-hidden="true">
            <path d="M5 21.5 C8 20.8 8.8 16.4 11.7 14.3 C14 12.7 18.1 13 21 12.4 C24.4 8.1 27.4 6.7 33.3 6.8 C40.8 6.9 43.3 7.8 47.6 13.2 C52.4 14.2 56.5 15.8 59 18.1 C60.2 19.2 59.8 21 58.7 22" fill="none" stroke="#16a34a" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.8 22.2 C13.5 23.1 20.4 22.7 27.6 22.8 C37.8 23 48.8 22.4 58.2 22.2" fill="none" stroke="#22c55e" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M6.7 20.5 C10.4 18.9 9.8 15.5 13.1 13.7 M22 11.5 C26.1 7.4 29 7.2 34 7.4 C42 7.5 43.7 9.1 47 13.7" fill="none" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
            <circle cx="16" cy="23" r="3.6" fill="#0f172a" stroke="#f8fafc" strokeWidth="2.1" />
            <circle cx="49" cy="23" r="3.6" fill="#0f172a" stroke="#f8fafc" strokeWidth="2.1" />
            <path d="M25.5 11.8 C29.8 11.1 35.2 11.2 39.7 12 M32.9 11.8 C32.5 15 32.3 18.3 31.8 21.2" fill="none" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" />
            <path d="M26.2 12.5 C30.3 11.8 35.5 11.9 39 12.5" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
          </svg>
        </span>
      </div>

      <h1 style={{ margin: 0, textAlign: 'center', fontSize: 'clamp(17px, 4.6vw, 25px)', lineHeight: 1.2, fontWeight: 700 }}>
        {title}
      </h1>

      <span aria-hidden="true" />
    </header>
  )
}
