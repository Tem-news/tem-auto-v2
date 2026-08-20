'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  // Šeit ir saglabāta visa tava loģika, ko sūtīji iepriekš
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  return (
    <header 
      style={{ 
        backgroundColor: '#0f172a', 
        color: '#ffffff', 
        padding: '12px 24px', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        width: '100%' // Header stiepjas pa visu ekrānu
      }}
    >
      {/* Šis ir tas konteiners, kas centrē saturu */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', // <--- TAS NOSTĀDA SATURU PA VIDU
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: '100%'
      }}>
        
        {/* Logo */}
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>
          TemAuto
        </div>

        {/* Labā puse */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user ? (
            <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              Izlogoties
            </button>
          ) : (
            <Link href="/login" style={{ color: '#fff', textDecoration: 'none' }}>Ielogoties</Link>
          )}
          
          <Link href="/pievienot" style={{ backgroundColor: '#16a34a', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', color: '#fff' }}>
            + Pievienot auto
          </Link>
        </nav>

      </div>
    </header>
  )
}
