'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AutoLapa({ params }: { params: { id: string } }) {
  const id = params.id;
  const router = useRouter();

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showVin, setShowVin] = useState(false);
  const [showContactMenu, setShowContactMenu] = useState(false);

  useEffect(() => {
    async function fetchCarData() {
      if (!id) return;

      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Kļūda ielādējot auto:', error);
      } else {
        setCar(data);
        supabase.rpc('increment_view', { car_id: id });
      }
      setLoading(false);
    }

    fetchCarData();
  }, [id]);

  // Droša atpakaļ pogas funkcija, kas garantēti nostrādā
  const handleBack = () => {
    try {
      if (window.history.length > 2) {
        router.back();
      } else {
        router.push('/');
      }
    } catch (e) {
      window.location.href = '/';
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Ielādē datus...</div>;
  }

  if (!car) {
    return <div className="min-h-screen flex items-center justify-center">Auto nav atrasts.</div>;
  }

  const images = car.images && car.images.length > 0 ? car.images : ['/placeholder.jpg'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button 
        onClick={handleBack}
        className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition cursor-pointer"
      >
        ← Atpakaļ
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attēlu galerija ar ierobežotu augstumu un object-contain, lai bilde nekropļotos un neizietu ārā */}
        <div>
          <div className="relative h-[400px] sm:h-[450px] rounded-xl overflow-hidden shadow-lg bg-gray-900 flex items-center justify-center">
            <img 
              src={images[currentImageIndex]} 
              alt={car.title || 'Auto attēls'} 
              className="w-full h-full object-contain"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer ${currentImageIndex === index ? 'border-blue-600' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{car.make} {car.model}</h1>
          <p className="text-2xl font-semibold text-blue-600 mb-4">{car.price} €</p>

          <div className="bg-gray-50 p-4 rounded-xl space-y-3 mb-6">
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>Gads: <span className="font-semibold text-gray-900">{car.year}</span></div>
              <div>Dzinējs: <span className="font-semibold text-gray-900">{car.engine}</span></div>
              <div>Ātrumkārba: <span className="font-semibold text-gray-900">{car.gearbox}</span></div>
              <div>Nobraukums: <span className="font-semibold text-gray-900">{car.mileage} km</span></div>
            </div>

            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">VIN:</span>
              {showVin ? (
                <span className="font-mono font-semibold text-gray-900">{car.vin}</span>
              ) : (
                <button onClick={() => setShowVin(true)} className="text-sm text-blue-600 hover:underline cursor-pointer">
                  Parādīt VIN
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Pārdevēja kontakti</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Telefons:</span>
              {showPhone ? (
                <a href={`tel:${car.phone}`} className="font-semibold text-blue-600">{car.phone}</a>
              ) : (
                <button onClick={() => setShowPhone(true)} className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 cursor-pointer">
                  Parādīt numuru
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">E-pasts:</span>
              {showEmail ? (
                <a href={`mailto:${car.email}`} className="font-semibold text-blue-600">{car.email}</a>
              ) : (
                <button onClick={() => setShowEmail(true)} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer">
                  Parādīt e-pastu
                </button>
              )}
            </div>

            <div className="relative pt-2">
              <button 
                onClick={() => setShowContactMenu(!showContactMenu)}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition text-center cursor-pointer"
              >
                Sazināties ar pārdevēju
              </button>

              {showContactMenu && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-xl z-10 p-2 space-y-1">
                  <a href={`https://wa.me/${car.phone}`} target="_blank" rel="noreferrer" className="block px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-800">WhatsApp</a>
                  <a href={`https://t.me/${car.phone}`} target="_blank" rel="noreferrer" className="block px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-800">Telegram</a>
                  <a href={`viber://chat?number=${car.phone}`} className="block px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-800">Viber</a>
                  <a href={`sms:${car.phone}`} className="block px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-800">SMS</a>
                  <a href={`tel:${car.phone}`} className="block px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-800">Zvanīt tieši</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
