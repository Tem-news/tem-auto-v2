'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import '../catalogue-mobile.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get('mode')
    if (mode === 'register') setIsRegistering(true)
  }, [])

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

        // Pārbaudām, vai ir saglabāta lapa, uz kuru lietotājs gribēja iet
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin')
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin') // Notīrām, lai nepaliek atmiņā
          router.push(redirectUrl)
        } else {
          router.push('/')
        }
        router.refresh()
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Kaut kas nogāja greizi' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-login-page="true" style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <style>{`
        @media (max-width: 767px) {
          html,
          body {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow-x: hidden;
          }

          body:has([data-login-page="true"]) header[data-temauto-header="true"] {
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 87px !important;
            padding: 10px 12px !important;
            box-sizing: border-box !important;
          }

          body:has([data-login-page="true"]) [data-header-shell="true"] {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) !important;
            grid-template-rows: auto auto !important;
            gap: 9px 8px !important;
            width: 100% !important;
            min-width: 0 !important;
          }

          body:has([data-login-page="true"]) [data-header-brand="true"],
          body:has([data-login-page="true"]) [data-header-controls="true"] {
            display: contents !important;
          }

          body:has([data-login-page="true"]) [data-header-brand="true"] a {
            grid-column: 1;
            grid-row: 1;
            justify-self: start;
            font-size: 20px !important;
            white-space: nowrap;
          }

          body:has([data-login-page="true"]) [data-header-home-logo="true"] {
            display: none !important;
          }

          body:has([data-login-page="true"]) [data-header-visitor-wrap="true"] {
            grid-column: 1;
            grid-row: 1;
            justify-self: end;
          }

          body:has([data-login-page="true"]) [data-header-visitors="true"] {
            min-height: 32px !important;
            padding: 4px 10px !important;
            font-size: 13px !important;
            white-space: nowrap;
          }

          body:has([data-login-page="true"]) [data-header-controls="true"] > div:nth-child(1),
          body:has([data-login-page="true"]) [data-header-controls="true"] > div:nth-child(2) {
            display: contents !important;
          }

          body:has([data-login-page="true"]) [data-header-controls="true"] > div:nth-child(1) > button,
          body:has([data-login-page="true"]) [data-header-controls="true"] > div:nth-child(2) > button {
            display: none !important;
          }

          body:has([data-login-page="true"]) [data-header-controls="true"] > nav {
            grid-column: 1;
            grid-row: 2;
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) auto 44px !important;
            align-items: center !important;
            gap: 8px !important;
            width: 100% !important;
          }

          body:has([data-login-page="true"]) [data-header-controls="true"] > nav > a:first-child {
            justify-self: start;
            white-space: nowrap;
          }

          body:has([data-login-page="true"]) [data-header-add="true"] {
            margin: 0 !important;
            padding: 7px 11px !important;
            font-size: 13px !important;
            white-space: nowrap;
          }

          body:has([data-login-page="true"]) [data-mobile-menu-toggle="true"] {
            display: flex !important;
          }

          [data-login-page="true"] {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            margin: 0 auto !important;
            padding: 12px 10px 18px !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }

          [data-login-layout="true"] {
            display: block !important;
            width: 100% !important;
            min-width: 0 !important;
          }

          [data-login-card="true"] {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            padding: 18px 14px !important;
            border-radius: 9px !important;
            box-sizing: border-box !important;
          }

          [data-login-card="true"] h1 {
            margin-top: 0 !important;
            font-size: 21px !important;
          }

          [data-login-card="true"] form {
            gap: 12px !important;
          }

          [data-login-card="true"] input,
          [data-login-card="true"] button {
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }

          [data-login-ad="true"] {
            display: none !important;
          }
        }
      `}</style>
      
      {/* Divu kolonnu izkārtojums: Kreisajā pusē ielogošanās forma, labajā - reklāma */}
      <div data-login-layout="true" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', justifyContent: 'center' }}>
        
        {/* Kreisā puse: Forma */}
        <div data-login-card="true" style={{ flex: 1, maxWidth: '480px', backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px', marginBottom: '20px', display: 'inline-block' }}>
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
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
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
                  style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
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

        {/* Labā puse: Reklāmas baneris */}
        <div data-login-ad="true" style={{ width: '260px', flexShrink: 0 }}>
          <div style={{ backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', textAlign: 'center', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Reklāma</span>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Ekskluzīvs baneris šeit!<br/><span style={{ fontSize: '12px' }}>(Maksimāla uzmanība)</span></p>
          </div>
        </div>

      </div>
    </div>
  )
}
