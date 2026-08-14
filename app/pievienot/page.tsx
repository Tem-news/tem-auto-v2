'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function PievienotAuto() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    year: '',
    mileage: '',
    engine: ''
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Lūdzu, izvēlies vismaz vienu foto attēlu!')
      return
    }

    setLoading(true)

    try {
      const imageUrls: string[] = []

      // Augšupielādējam katru izvēlēto bildi uz Supabase Storage
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${i}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('car-images')
          .upload(fileName, file)

        if (uploadError) {
          throw new Error('Kļūda augšupielādējot bildi: ' + uploadError.message)
        }

        // Iegūstam publisko saiti
        const { data: publicUrlData } = supabase.storage
          .from('car-images')
          .getPublicUrl(fileName)

        imageUrls.push(publicUrlData.publicUrl)
      }

      // Saglabājam sludinājumu datubāzē
      const { error: dbError } = await supabase
        .from('cars')
        .insert([
          {
            title: formData.title,
            price: Number(formData.price),
            year: Number(formData.year),
            mileage: formData.mileage,
            engine: formData.engine,
            image: imageUrls[0], // Galvenā bilde
            images: imageUrls    // Visas bildes
          }
        ])

      if (dbError) {
        alert('Kļūda saglabājot datubāzē: ' + dbError.message)
      } else {
        alert('Sludinājums veiksmīgi pievienots!')
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      alert('Kļūda: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', textAlign: 'center', marginBottom: '1.5rem' }}>
        Pievienot jaunu auto sludinājumu
      </h1>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155' }}>Nosaukums / Modelis</label>
          <input 
            type="text" 
            required 
            placeholder="Piem., BMW 530d M-Sport" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155' }}>Cena (€)</label>
            <input 
              type="number" 
              required 
              placeholder="21500" 
              value={formData.price} 
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155' }}>Izlaiduma gads</label>
            <input 
              type="number" 
              required 
              placeholder="2018" 
              value={formData.year} 
              onChange={(e) => setFormData({...formData, year: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155' }}>Nobraukums (km)</label>
            <input 
              type="text" 
              required 
              placeholder="185 000 km" 
              value={formData.mileage} 
              onChange={(e) => setFormData({...formData, mileage: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155' }}>Motors</label>
            <input 
              type="text" 
              required 
              placeholder="3.0 Dīzelis" 
              value={formData.engine} 
              onChange={(e) => setFormData({...formData, engine: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155' }}>Pievienot fotogrāfijas (no ierīces)</label>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={(e) => setSelectedFiles(e.target.files)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
          />
          <small style={{ color: '#64748b', marginTop: '0.25rem', display: 'block' }}>Var izvēlēties vairākas bildes uzreiz.</small>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ backgroundColor: loading ? '#94a3b8' : '#22c55e', color: '#ffffff', padding: '0.875rem', borderRadius: '8px', border: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '1rem' }}
        >
          {loading ? 'Augšupielādē bildes un saglabā...' : 'Publicēt sludinājumu'}
        </button>

      </form>
    </main>
  )
}
