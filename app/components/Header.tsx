'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [visitCount, setVisitCount] = useState<number>(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    async function fetchVisits() {
      const twentyFourHoursAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString()
      const { count, error } = await supabase
        .from('site_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo)

      if (!error && count !== null) {
        setVisitCount(count)
      }
    }
    fetchVisits()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const handleAddCarClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      sessionStorage.setItem('redirectAfterLogin', '/pievienot')
      router.push('/login')
    } else {
      router.push('/pievienot')
    }
  }

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
        boxSizing: 'border-box'
      }}
    >
      {/* Centrētais konteiners, kas visu stumj precīzi pa vidu */}
      <div 
        style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          width: '100%',
          flexWrap: 'wrap', 
          gap: '12px' 
        }}
      >
        
        {/* Kreisā puse: Logo un Skaitītājs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link 
            href="/" 
            style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e', textDecoration: 'none' }}
          >
            TemAuto
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '20px',
              fontSize: '13px',
              color: '#e2e8f0',
              fontWeight: '500'
            }}
          >
            <span>👥</span>
            <span>Apmeklētāji 24h: <strong style={{ color: '#22c55e' }}>{visitCount}</strong></span>
          </div>
        </div>

        {/* Labā puse: Navigācija */}
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
            style={{ backgroundColor: '#16a34a', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
          >
            + Pievienot auto
          </a>
        </nav>

      </div>
    </header>
  )
}
