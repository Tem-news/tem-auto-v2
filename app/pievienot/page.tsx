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

          // Augšupielādējam, izmantojot 'CAR-IMAGES'
          const { error: uploadError } = await supabase.storage
            .from('CAR-IMAGES')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('Kļūda augšupielādējot:', uploadError)
            continue
          }

          // Iegūstam publisko saiti
          const { data } = supabase.storage
            .from('CAR-IMAGES')
            .getPublicUrl(fileName)

          if (data?.publicUrl) {
            uploadedUrls.push(data.publicUrl)
          }
        }
      }

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
