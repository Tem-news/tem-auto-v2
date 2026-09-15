'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const formatPrice = (price: unknown) => {
  if (price === null || price === undefined || price === '') return '–'
  const number = Number(String(price).replace(/\s/g, ''))
  if (Number.isNaN(number)) return String(price)
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €'
}

export default function KabinetsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadCabinet() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        sessionStorage.setItem('redirectAfterLogin', '/kabinets')
        router.replace('/login')
        return
      }

      setUser(session.user)

      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setErrorMessage('Neizdevās ielādēt tavus sludinājumus.')
      } else {
        setCars(data || [])
      }

      setLoading(false)
    }

    loadCabinet()
  }, [router])

  const handleLogout = async () => {
    const shouldLogout = window.confirm('Vai tiešām izlogoties?')
    if (!shouldLogout) return

    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif', color: '#64748b' }}>Ielādē lietotāja kabinetu...</div>
  }

  const accountName = user?.user_metadata?.nickname || user?.email || 'Lietotājs'

  return (
    <main style={{ width: 'calc(100% - 40px)', maxWidth: '1100px', margin: '32px auto', fontFamily: 'sans-serif' }}>
      <section style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: '0 0 6px', color: '#111827', fontSize: '24px' }}>Mans kabinets</h1>
            <div style={{ color: '#64748b', fontSize: '14px' }}>{accountName}</div>
          </div>
          <button type="button" onClick={handleLogout} style={{ padding: '9px 16px', border: '1px solid #dc2626', borderRadius: '7px', backgroundColor: '#ffffff', color: '#dc2626', fontWeight: '700', cursor: 'pointer' }}>
            Izlogoties
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '18px' }}>Mani sludinājumi ({cars.length})</h2>
          <Link href="/pievienot" style={{ padding: '9px 14px', borderRadius: '7px', backgroundColor: '#16a34a', color: '#ffffff', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>
            + Pievienot auto
          </Link>
        </div>

        {errorMessage ? (
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#b91c1c' }}>{errorMessage}</div>
        ) : cars.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
            Tev pašlaik nav neviena sludinājuma.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cars.map((car) => {
              const imageUrl = car.image || (Array.isArray(car.images) ? car.images[0] : '')
              return (
                <div key={car.id} style={{ display: 'grid', gridTemplateColumns: '100px minmax(0, 1fr) auto', gap: '14px', alignItems: 'center', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                  <div style={{ width: '100px', height: '66px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#e5e7eb' }}>
                    {imageUrl && <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: '700', color: '#111827', marginBottom: '5px' }}>{car.make} {car.model}</div>
                    <div style={{ fontSize: '14px', color: '#4b5563' }}>{formatPrice(car.price)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link href={`/auto/${car.id}`} style={{ padding: '8px 11px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Apskatīt</Link>
                    <Link href={`/auto/${car.id}/edit`} style={{ padding: '8px 11px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Rediģēt</Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
