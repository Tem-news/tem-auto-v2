'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) // Acs stāvoklis
  const [isRegistering, setIsRegistering] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage({
          type: 'success',
          text: 'Reģistrācija veiksmīga! Tagad varat ielogoties.',
        })
        setIsRegistering(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Kaut kas nogāja greizi' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px', marginBottom: '20px', display: 'inline-block' }}>
          ← Atpakaļ uz sākumlapu
        </Link>

        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>
          {isRegistering ? 'Reģistrēties' : 'Ielogoties'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
          {isRegistering ? 'Izveido savu TemAuto kontu' : 'Ienāc savā kontā'}
        </p>

        {message && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: message.type === 'error' ? '#dc2626' : '#15803d'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
              E-pasts
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vards@epasts.lv"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
              Parole
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                title={showPassword ? 'Paslēpt paroli' : 'Rādīt paroli'}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            {loading ? 'Lūdzu, uzgaidiet...' : isRegistering ? 'Reģistrēties' : 'Ielogoties'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          <button
            onClick={() => {
              setIsRegistering(!isRegistering)
              setMessage(null)
            }}
            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}
          >
            {isRegistering ? 'Jau ir konts? Ielogoties' : 'Nav konta? Reģistrēties'}
          </button>
        </div>
      </div>
    </div>
  )
}
