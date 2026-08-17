'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link href="/" style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e', textDecoration: 'none' }}>
        TemAuto
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link href="/" style={{ color: '#ffffff', textDecoration: 'none' }}>
          Sākums
        </Link>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#cbd5e1', backgroundColor: '#1e293b', padding: '4px 12px', borderRadius: '16px' }}>
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
          <Link href="/login" style={{ color: '#ffffff', textDecoration: 'none' }}>
            Ielogoties
          </Link>
        )}

        <Link
          href={user ? "/pievienot" : "/login"}
          style={{ backgroundColor: '#16a34a', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}
        >
          + Pievienot auto
        </Link>
      </nav>
    </header>
  )
}
