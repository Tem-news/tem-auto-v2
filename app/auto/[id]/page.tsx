'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default function AutoLapa() {
  const params = useParams()
  const id = params?.id

  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')

  useEffect(() => {
    if (!id) return

    async function fetchCar() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Kļūda ielādējot datus:', error)
      } else if (data) {
        setCar(data)
        const mainImg = data.image || (data.images && data.images[0]) || ''
        setSelectedImage(mainImg)
      }
      setLoading(false)
    }

    fetchCar()
  }, [id])

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Ielādē datus...</div>
  }

  if (!car) {
    return <div className="p-8 text-center text-red-500">Auto netika atrasts!</div>
  }

  // Izveidojam pilnu attēlu sarakstu (titulbilde + pārējās)
  const allImages: string[] = []
  if (car.image) allImages.push(car.image)
  if (Array.isArray(car.images)) {
    car.images.forEach((img: string) => {
      if (img && !allImages.includes(img)) {
        allImages.push(img)
      }
    })
  }

  const currentIndex = allImages.indexOf(selectedImage)

  const handlePrev = () => {
    if (allImages.length === 0) return
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length
    setSelectedImage(allImages[prevIndex])
  }

  const handleNext = () => {
    if (allImages.length === 0) return
    const nextIndex = (currentIndex + 1) % allImages.length
    setSelectedImage(allImages[nextIndex])
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <Link href="/" className="inline-block text-blue-600 hover:underline mb-2">
        ← Atpakaļ uz sarakstu
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {car.make} {car.model} ({car.year})
          </h1>
          <p className="text-gray-500">{car.location || 'Latvija'}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">€ {car.price}</div>
          <Link
            href={`/auto/${id}/edit`}
            className="inline-block mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
          >
            Rediģēt sludinājumu
          </Link>
        </div>
      </div>

      {/* Attēlu galerija ar bultiņām */}
      <div className="space-y-4">
        <div className="relative w-full h-[350px] md:h-[500px] bg-black rounded-xl overflow-hidden flex items-center justify-center group">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-gray-400">Nav attēla</div>
          )}

          {/* Sānu bultiņas */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition opacity-80 group-hover:opacity-100"
                aria-label="Iepriekšējais attēls"
              >
                ❮
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition opacity-80 group-hover:opacity-100"
                aria-label="Nākamais attēls"
              >
                ❯
              </button>
            </>
          )}
        </div>

        {/* Mazās bildes (iekļaujot titulbildi) */}
        {allImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition ${
                  selectedImage === img ? 'border-blue-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Sīktēls" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Informācija un apraksts */}
      <div className="grid md:grid-cols-3 gap-6 pt-4">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Apraksts</h2>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 p-4 rounded-xl border">
            {car.description || 'Apraksts nav pievienots.'}
          </p>
        </div>

        <div className="bg-gray-50 p-5 rounded-xl border space-y-3 h-fit">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Specifikācija</h3>
          <div className="text-sm space-y-2 text-gray-600">
            <div className="flex justify-between"><span>Nobraukums:</span> <span className="font-medium text-gray-900">{car.mileage ? `${car.mileage} km` : '-'}</span></div>
            <div className="flex justify-between"><span>Dzinējs:</span> <span className="font-medium text-gray-900">{car.engine || '-'}</span></div>
            <div className="flex justify-between"><span>Degviela:</span> <span className="font-medium text-gray-900">{car.fuelType || '-'}</span></div>
            <div className="flex justify-between"><span>Tālrunis:</span> <span className="font-medium text-gray-900">{car.phone || '-'}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
