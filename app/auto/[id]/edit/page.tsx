'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'

const formatPriceInput = (value: string) => {
  const digits = value.replace(/\D/g, '')
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function RedigetAuto() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const hasUnsavedChangesRef = useRef(false)
  const allowNavigationRef = useRef(false)
  const skipNextPopRef = useRef(false)

  const markUnsaved = () => {
    hasUnsavedChangesRef.current = true
  }


  // Visi lauki
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // Bilžu state
  const [images, setImages] = useState<{ url: string; isNew: boolean; file?: File }[]>([])

  useEffect(() => {
    const confirmExit = () => window.confirm('Ir nesaglabātas izmaiņas. Vai tiešām iziet, tās nesaglabājot?')

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChangesRef.current || allowNavigationRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }

    const handleLinkClick = (event: MouseEvent) => {
      if (!hasUnsavedChangesRef.current || allowNavigationRef.current) return
      const target = event.target as Element | null
      const anchor = target?.closest('a')
      if (!anchor || anchor.target === '_blank' || !anchor.href) return
      if (!confirmExit()) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      allowNavigationRef.current = true
    }

    const handlePopState = () => {
      if (skipNextPopRef.current) {
        skipNextPopRef.current = false
        return
      }
      if (!hasUnsavedChangesRef.current || allowNavigationRef.current) return
      if (!confirmExit()) {
        skipNextPopRef.current = true
        window.history.forward()
      } else {
        allowNavigationRef.current = true
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    document.addEventListener('click', handleLinkClick, true)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [])

  useEffect(() => {
    if (!id) return

    async function checkAuthAndLoadCar() {
      // 1. Pārbaudām, vai lietotājs ir ielogojies
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
        router.push('/login')
        return
      }

      // 2. Ielādējam sludinājumu
      const { data, error } = await supabase.from('cars').select('*').eq('id', id).single()

      if (error || !data) {
        setErrorMsg('Sludinājums nav atrasts.')
        setLoading(false)
        return
      }

      // 3. Pārbaudām, vai ielogotais lietotājs ir šī sludinājuma īpašnieks
      if (data.user_id && data.user_id !== session.user.id) {
        setErrorMsg('Tev nav tiesību rediģēt šo sludinājumu!')
        setLoading(false)
        return
      }

      // Ja viss kārtībā, aizpildām datus
      setMake(data.make || '')
      setModel(data.model || '')
      setPrice(data.price ? formatPriceInput(String(data.price)) : '')
      setDescription(data.description || '')
      setPhone(data.phone || '')
      setEmail(data.email || '')
      
      const existing = Array.isArray(data.images) ? data.images : (data.images ? [data.images] : [])
      setImages(existing.map((url: string) => ({ url, isNew: false })))
      
      setLoading(false)
    }

    checkAuthAndLoadCar()
  }, [id, router])

  // Pārvietot bildi ar bultiņām
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= images.length) return
    const updated = [...images]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)
    setImages(updated)
    markUnsaved()
  }

  // Dzēst bildi
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    markUnsaved()
  }

  // Saglabāt izmaiņas
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!window.confirm('Vai saglabāt izmaiņas?')) return
    setSaving(true)
    
    let finalUrls = []
    for (const img of images) {
      if (img.isNew && img.file) {
        const fileName = `${Date.now()}-${Math.random()}.jpg`
        await supabase.storage.from('car-images').upload(fileName, img.file)
        const { data } = supabase.storage.from('car-images').getPublicUrl(fileName)
        finalUrls.push(data.publicUrl)
      } else {
        finalUrls.push(img.url)
      }
    }

    await supabase.from('cars').update({
      price: price ? Number(price.replace(/\s/g, '')) : null,
      description,
      phone,
      email,
      images: finalUrls,
      image: finalUrls[0] || null
    }).eq('id', id)

    hasUnsavedChangesRef.current = false
    allowNavigationRef.current = true
    router.push(`/auto/${id}`)
  }

  // Dzēst visu sludinājumu no rediģēšanas lapas
  const handleDeleteCar = async () => {
    const confirmDelete = window.confirm('Vai tiešām vēlaties neatgriezeniski dzēst šo sludinājumu?')
    if (!confirmDelete) return

    setDeleting(true)
    const { error } = await supabase.from('cars').delete().eq('id', id)
    setDeleting(false)

    if (error) {
      alert('Kļūda dzēšot sludinājumu: ' + error.message)
    } else {
      hasUnsavedChangesRef.current = false
      allowNavigationRef.current = true
      alert('Sludinājums veiksmīgi izdzēsts!')
      router.push('/')
      router.refresh()
    }
  }

  if (loading) return <div style={{textAlign: 'center', padding: '50px', fontSize: '18px'}}>Pārbauda piekļuves tiesības...</div>

  if (errorMsg) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '30px', background: '#fff', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '15px' }}>Piekļuve liegta</h2>
        <p style={{ color: '#334155', marginBottom: '20px' }}>{errorMsg}</p>
        <button onClick={() => router.push('/')} style={{ padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Atgriezties sākumā
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1150px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', justifyContent: 'center' }}>
        
        {/* Kreisā puse: Rediģēšanas forma */}
        <div style={{ flex: 1, maxWidth: '800px', backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          <h1 style={{ marginBottom: '20px', color: '#111', fontSize: '24px' }}>Rediģēt sludinājumu: {make} {model}</h1>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Cena (€)</label>
              <input type="text" inputMode="numeric" placeholder="Piem. 12 500" value={price} onChange={(e) => { setPrice(formatPriceInput(e.target.value)); markUnsaved() }} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Apraksts</label>
              <textarea placeholder="Papildus informācija par auto..." value={description} onChange={(e) => { setDescription(e.target.value); markUnsaved() }} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '240px', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Telefona numurs</label>
              <input type="text" placeholder="Piem. +371 29000000" value={phone} onChange={(e) => { setPhone(e.target.value); markUnsaved() }} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>E-pasts</label>
              <input type="email" placeholder="Piem. epasts@inbox.lv" value={email} onChange={(e) => { setEmail(e.target.value); markUnsaved() }} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>

            {/* BILŽU SADAĻA */}
            <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Bildes (pirmā ir galvenā titulbilde):</label>
              <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '10px' }}>
                Izmanto bultiņas <b>← →</b>, lai mainītu bilžu secību.
              </span>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {images.map((img, i) => {
                  const previewUrl = img.isNew && img.file ? URL.createObjectURL(img.file) : img.url
                  const isMain = i === 0

                  return (
                    <div key={i} style={{ position: 'relative', width: '120px', height: '120px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', border: isMain ? '3px solid #2563eb' : '1px solid #cbd5e1' }}>
                      <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      
                      <button 
                        type="button" 
                        onClick={() => removeImage(i)} 
                        style={{ 
                          position: 'absolute', top: '4px', right: '4px', 
                          background: '#ef4444', color: 'white', border: 'none', 
                          borderRadius: '50%', width: '22px', height: '22px', 
                          cursor: 'pointer', fontWeight: 'bold', display: 'flex', 
                          alignItems: 'center', justifyContent: 'center', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                        }}
                      >
                        ×
                      </button>

                      <div style={{ 
                        position: 'absolute', bottom: '0', left: '0', right: '0', 
                        background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'space-between', padding: '3px 6px', alignItems: 'center' 
                      }}>
                        <button 
                          type="button" 
                          onClick={() => moveImage(i, 'left')} 
                          disabled={i === 0}
                          style={{ background: 'none', border: 'none', color: i === 0 ? '#64748b' : '#fff', cursor: i === 0 ? 'default' : 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                        >
                          ◀
                        </button>
                        
                        <span style={{ color: '#fff', fontSize: '10px', fontWeight: '600' }}>
                          {isMain ? 'Tituls' : `${i + 1}.`}
                        </span>

                        <button 
                          type="button" 
                          onClick={() => moveImage(i, 'right')} 
                          disabled={i === images.length - 1}
                          style={{ background: 'none', border: 'none', color: i === images.length - 1 ? '#64748b' : '#fff', cursor: i === images.length - 1 ? 'default' : 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <input 
                type="file" 
                multiple 
                onChange={(e) => {
                  if (e.target.files) {
                    const addedFiles = Array.from(e.target.files).map(file => ({ url: '', isNew: true, file }))
                    setImages([...images, ...addedFiles])
                    markUnsaved()
                  }
                }} 
                style={{ padding: '8px 0' }} 
              />
            </div>

            {/* Saglabāšanas un Dzēšanas pogas */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" disabled={saving} style={{ flex: 1, padding: '15px', background: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>
                {saving ? 'Saglabā izmaiņas...' : 'Saglabāt izmaiņas'}
              </button>

              <button type="button" onClick={handleDeleteCar} disabled={deleting} style={{ padding: '15px 20px', background: deleting ? '#9ca3af' : '#dc2626', color: 'white', borderRadius: '8px', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600' }}>
                {deleting ? 'Dzēš...' : '🗑️ Dzēst sludinājumu'}
              </button>
            </div>

          </form>
        </div>

        {/* Labā puse: divi nekustīgi, vienāda izmēra reklāmas baneri */}
        <div style={{ width: '260px', flexShrink: 0 }}>
          <div style={{ position: 'fixed', top: '100px', width: '260px', height: 'calc(100dvh - 120px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2].map((placement) => (
              <div key={placement} style={{ flex: '1 1 0', minHeight: 0, boxSizing: 'border-box', backgroundColor: '#f9fafb', border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Reklāma</span>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Ekskluzīvs baneris šeit!<br/><span style={{ fontSize: '12px' }}>(Maksimāla uzmanība)</span></p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
