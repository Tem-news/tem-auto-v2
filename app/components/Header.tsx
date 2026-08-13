import Link from 'next/link'

export default function Header() {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#1e293b',
      color: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', color: '#ffffff', fontSize: '1.5rem', fontWeight: 'bold' }}>
        Tem<span style={{ color: '#22c55e' }}>Auto</span>
      </Link>

      {/* Navigācija */}
      <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link href="/" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: '500' }}>
          Sākums
        </Link>
        <Link href="/sludinajumi" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: '500' }}>
          Sludinājumi
        </Link>
        <Link href="/pievienot" style={{
          backgroundColor: '#22c55e',
          color: '#ffffff',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: '600'
        }}>
          + Pievienot auto
        </Link>
      </nav>
    </header>
  )
}
