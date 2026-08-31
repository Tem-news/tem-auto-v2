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
        
        {/* Virs bildes: Marka / Modelis + Publicēšanas datums un skatījumi */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-gray-400 mb-1">
            <span>Publicēts: {car.created_at ? new Date(car.created_at).toLocaleDateString() : 'N/A'}</span>
            <span>Skatījumi: {car.views || 0}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {car.brand} {car.model}
          </h1>
        </div>

        {/* Galvenais satura bloks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* KREISAIS STABIŅŠ: Mašīnas dati un kontakti */}
          <div className="lg:col-span-4 bg-gray-800 p-5 rounded-xl border border-gray-700 space-y-4">
            <h3 className="text-xl font-semibold border-b border-gray-700 pb-2 text-green-400">
              Galvenie dati
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <span className="text-gray-400">Izlaiduma gads:</span>
                <span className="font-medium">{car.year || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <span className="text-gray-400">Motors:</span>
                <span className="font-medium">{car.engine || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <span className="text-gray-400">Ātrumkārba:</span>
                <span className="font-medium">{car.transmission || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <span className="text-gray-400">Krāsa:</span>
                <span className="font-medium">{car.color || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <span className="text-gray-400">Virsbūves tips:</span>
                <span className="font-medium">{car.body_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <span className="text-gray-400">Nobraukums:</span>
                <span className="font-medium">{car.mileage ? `${car.mileage} km` : 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <span className="text-gray-400">Tehniskā apskate:</span>
                <span className="font-medium">{car.tech_inspection || 'N/A'}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-gray-400">VIN kods:</span>
                <span className="font-mono text-xs bg-gray-900 px-2 py-1 rounded text-gray-300">
                  {car.vin || 'N/A'}
                </span>
              </div>
            </div>

            {/* KONTAKTI */}
            <div className="mt-6 pt-4 border-t border-gray-700 space-y-3">
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Kontaktinformācija
              </h4>
              
              <div className="bg-green-950/40 border border-green-600/60 p-3 rounded-lg text-center">
                <span className="block text-xs text-green-400 mb-1">Telefona numurs</span>
                <a href={`tel:${car.phone}`} className="text-lg font-bold text-white hover:underline">
                  {car.phone || 'Nav norādīts'}
                </a>
              </div>

              <div className="bg-blue-950/40 border border-blue-600/60 p-3 rounded-lg text-center">
                <span className="block text-xs text-blue-400 mb-1">E-pasts</span>
                <a href={`mailto:${car.email}`} className="text-sm font-semibold text-white hover:underline break-all">
                  {car.email || 'Nav norādīts'}
                </a>
              </div>
            </div>

            {/* Rediģēt poga */}
            <div className="pt-2">
              <button
                onClick={() => router.push(`/auto/${id}/edit`)}
                className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition duration-200 text-center"
              >
                Rediģēt sludinājumu
              </button>
            </div>

          </div>

          {/* LABETAIS STABIŅŠ: Bildes un apraksts */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg h-[400px] md:h-[500px] flex items-center justify-center bg-black/40">
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

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(img)}
                    className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition ${
                      activeImage === img ? 'border-green-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mt-6">
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
