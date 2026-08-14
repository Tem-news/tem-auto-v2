'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function PievienotAuto() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    year: new Date().getFullYear().toString(),
    mileage: '',
    engine: '',
  })
  const [files, setFiles] = useState<FileList | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const uploadedUrls: string[] = []

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}_${i}.${fileExt}`

          // 1. Augšupielādējam failu
          const { error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('Kļūda augšupielādējot:', uploadError)
            continue
          }

          // 2. Iegūstam pilnu publisko saiti
          const { data } = supabase.storage
            .from('car-images')
            .getPublicUrl(fileName)

          if (data?.publicUrl) {
            uploadedUrls.push(data.publicUrl)
          }
        }
      }

      // 3. Saglabājam datubāzē
      const { error: insertError } = await supabase
        .from('cars')
        .insert([
          {
            title: formData.title,
            price: Number(formData.price),
            year: Number(formData.year),
            mileage: formData.mileage,
            engine: formData.engine,
            image: uploadedUrls[0] || '',
            images: uploadedUrls,
          },
        ])

      if (insertError) throw insertError

      alert('Sludinājums veiksmīgi pievienots!')
      router.push('/')
      router.refresh()
    } catch (err: any) {
      alert('Kļūda saglabājot: ' + (err.message || 'Nezināma kļūda'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/" style={{ color: '#64748b', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block', fontWeight: 'bold' }}>
        ← Atpakaļ uz sākumu
      </Link>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', marginTop: 0, marginBottom: '1.5rem' }}>
          Pievienot jaunu sludinājumu
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Nosaukums / Marka un Modelis</label>
            <input
              type="text"
              required
              placeholder="piem. Audi A6 3.0 TDI"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Cena (€)</label>
            <input
              type="number"
              required
              placeholder="piem. 4500"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Gads</label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Nobraukums</label>
              <input
                type="text"
                required
                placeholder="piem. 210 000 km"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Motors</label>
            <input
              type="text"
              required
              placeholder="piem. 3.0 Dīzelis"
              value={formData.engine}
              onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Pievienot attēlus</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#94a3b8' : '#22c55e',
              color: '#ffffff',
              padding: '0.875rem',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '1rem',
            }}
          >
            {loading ? 'Saglabā un ielādē bildes...' : 'Publicēt sludinājumu'}
          </button>
        </form>
      </div>
    </main>
  )
}
