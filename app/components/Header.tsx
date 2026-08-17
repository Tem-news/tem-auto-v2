'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Pārbaudām, vai lietotājs ir ielogojies
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Klausāmies autorizācijas statusa izmaiņas
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
    <header className="bg-slate-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-green-500 hover:text-green-400">
          TemAuto
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className="hover:text-green-400 transition">
            Sākums
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-400 hover:text-red-300 transition"
              >
                Izlogoties
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium hover:text-green-400 transition"
            >
              Ielogoties
            </Link>
          )}

          <Link
            href={user ? "/pievienot" : "/login"}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Pievienot auto
          </Link>
        </nav>
      </div>
    </header>
  )
}
