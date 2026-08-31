'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Header from '../../components/Header';

export default function AutoDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    if (id) {
      fetchCarDetails();
    }
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setCar(data);
        const images = data.images || (data.image_url ? [data.image_url] : []);
        setActiveImage(images[0] || '');
      }
    } catch (error) {
      console.error('Kļūda, ielādējot auto datus:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex justify-center items-center h-[80vh]">
          <p className="text-xl">Ielādē informāciju...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <p className="text-xl mb-4">Automašīna netika atrasta.</p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Atgriezties uz galveno lapu
          </button>
        </div>
      </div>
    );
  }

  const images = car.images || (car.image_url ? [car.image_url] : []);

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-12">
      <Header />

      <div className="max-w-7xl mx-auto px-4 pt-6">
        
        {/* Augšdaļa: Atpakaļ poga, Marka/Modelis, Datums, Skatījumi un Rediģēt poga */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <button 
              onClick={() => router.push('/')}
              className="text-sm text-gray-400 hover:text-white mb-2 inline-block"
            >
              ← Atpakaļ uz sarakstu
            </button>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-1">
              <span>Publicēts: {car.created_at ? new Date(car.created_at).toLocaleDateString() : 'N/A'}</span>
              <span>•</span>
              <span>Skatījumi: {car.views || 0}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {car.brand} {car.model}
            </h1>
          </div>

          <button
            onClick={() => router.push(`/auto/${id}/edit`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 flex items-center gap-2"
          >
            ✏️ Rediģēt
          </button>
        </div>

        {/* Galvenais divu kolonnu izkārtojums */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* KREISAIS STABIŅŠ: Visi mašīnas dati un izceltie kontakti */}
          <div className="lg:col-span-4 bg-gray-800 p-5 rounded-xl border border-gray-700 space-y-4">
            
            {/* Cena */}
            <div className="text-3xl font-extrabold text-green-400 border-b border-gray-700 pb-3">
              {car.price ? `€${car.price}` : 'Cena nav norādīta'}
            </div>

            <h3 className="text-lg font-semibold text-white">
              Galvenie dati
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <span className="text-gray-400">Izlaiduma gads:</span>
                <span className="font-medium text-white">{car.year || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <span className="text-gray-400">Motors:</span>
                <span className="font-medium text-white">{car.engine || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <span className="text-gray-400">Ātrumkārba:</span>
                <span className="font-medium text-white">{car.transmission || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <span className="text-gray-400">Krāsa:</span>
                <span className="font-medium text-white">{car.color || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <span className="text-gray-400">Virsbūves tips:</span>
                <span className="font-medium text-white">{car.body_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <span className="text-gray-400">Nobraukums:</span>
                <span className="font-medium text-white">{car.mileage ? `${car.mileage} km` : 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <span className="text-gray-400">Tehniskā apskate:</span>
                <span className="font-medium text-white">{car.tech_inspection || 'N/A'}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-gray-400">VIN kods:</span>
                <span className="font-mono text-xs bg-gray-900 px-2 py-1 rounded text-gray-300">
                  {car.vin || 'N/A'}
                </span>
              </div>
            </div>

            {/* KONTAKTI: Izcelti ar rāmi un krāsu */}
            <div className="mt-6 pt-4 border-t border-gray-700 space-y-3">
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Kontaktinformācija
              </h4>
              
              <div className="bg-green-950/60 border-2 border-green-500 p-3 rounded-lg text-center shadow-md">
                <span className="block text-xs text-green-400 mb-1 font-medium">Telefona numurs</span>
                <a href={`tel:${car.phone}`} className="text-lg font-bold text-white hover:underline">
                  {car.phone || 'Nav norādīts'}
                </a>
              </div>

              <div className="bg-blue-950/60 border-2 border-blue-500 p-3 rounded-lg text-center shadow-md">
                <span className="block text-xs text-blue-400 mb-1 font-medium">E-pasts</span>
                <a href={`mailto:${car.email}`} className="text-sm font-semibold text-white hover:underline break-all">
                  {car.email || 'Nav norādīts'}
                </a>
              </div>
            </div>

          </div>

          {/* LABETAIS STABIŅŠ: Lielā bilde, mazās bildes un apraksts apakšā */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Lielā bilde (korekti ierobežota augstumā, neiziet ārpus monitora) */}
            <div className="bg-black/60 rounded-xl overflow-hidden border border-gray-700 shadow-xl h-[400px] md:h-[480px] flex items-center justify-center relative">
              {activeImage ? (
                <img 
                  src={activeImage} 
                  alt={`${car.brand} ${car.model}`} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-500">Nav attēla</span>
              )}
            </div>

            {/* Mazās bildes (galerija) */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(img)}
                    className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition ${
                      activeImage === img ? 'border-green-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* APRAKSTS: Novietots apakšā */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-2">
                Apraksts
              </h3>
              <div className="text-gray-300 whitespace-pre-line leading-relaxed text-sm md:text-base">
                {car.description || 'Pārdevējs nav pievienojis aprakstu šim automobilim.'}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
