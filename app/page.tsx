'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

// Krāsu saraksts filtram
const COLORS = [
  { name: 'Balta', hex: '#FFFFFF', border: '#D1D5DB' },
  { name: 'Melna', hex: '#000000', border: '#000000' },
  { name: 'Pelēka', hex: '#6B7280', border: '#6B7280' },
  { name: 'Sudraba', hex: '#E5E7EB', border: '#9CA3AF' },
  { name: 'Zila', hex: '#2563EB', border: '#2563EB' },
  { name: 'Sarkana', hex: '#DC2626', border: '#DC2626' },
  { name: 'Zaļa', hex: '#16A34A', border: '#16A34A' },
  { name: 'Brūna', hex: '#92400E', border: '#92400E' },
  { name: 'Bēša', hex: '#F5F5DC', border: '#D1D5DB' },
  { name: 'Oranža', hex: '#EA580C', border: '#EA580C' },
  { name: 'Dzeltena', hex: '#CA8A04', border: '#CA8A04' },
  { name: 'Violeta', hex: '#7C3AED', border: '#7C3AED' }
];

export default function Sakumlapa() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtru stāvokļi
  const [make, setMake] = useState('');
  const [krasa, setKrasa] = useState('');
  const [searchModel, setSearchModel] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Datu ielāde tieši no Supabase
  useEffect(() => {
    async function fetchCars() {
      try {
        const { data, error } = await supabase.from('cars').select('*');
        if (error) {
          console.error('Kļūda ielādējot auto no Supabase:', error);
        } else if (data) {
          setCars(data);
        }
      } catch (error) {
        console.error('Nezināma kļūda:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // Filtrēšanas loģika
  const filteredCars = cars.filter((car) => {
    const matchMake = make ? car.make?.toLowerCase() === make.toLowerCase() : true;
    const matchKrasa = krasa ? car.color?.toLowerCase().includes(krasa.toLowerCase()) || car.krasa?.toLowerCase().includes(krasa.toLowerCase()) : true;
    const matchModel = searchModel ? car.model?.toLowerCase().includes(searchModel.toLowerCase()) : true;
    return matchMake && matchKrasa && matchModel;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '40px', fontFamily: 'sans-serif' }}>
      
      {/* Augšējā daļa / Meklētājs */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            
            {/* Marka filter */}
            <div style={{ position: 'relative', flex: '1', minWidth: '110px' }}>
              <input
                type="text"
                placeholder="Visas markas"
                value={make}
                onChange={(e) => { setMake(e.target.value); setActiveDropdown('make'); }}
                onClick={() => toggleDropdown('make')}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', backgroundColor: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}
              />
              {activeDropdown === 'make' && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <div onClick={() => { setMake(''); setActiveDropdown(null); }} style={{ padding: '8px 10px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>Visas markas</div>
                  {Array.from(new Set(cars.map(c => c.make))).filter(Boolean).map((m: any) => (
                    <div 
                      key={m} 
                      onClick={() => { setMake(m); setActiveDropdown(null); }} 
                      style={{ padding: '8px 10px', fontSize: '13px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Krāsa filter */}
            <div style={{ position: 'relative', flex: '1', minWidth: '110px' }}>
              <input
                type="text"
                placeholder="Krāsa"
                value={krasa}
                onChange={(e) => { setKrasa(e.target.value); setActiveDropdown('krasa'); }}
                onClick={() => toggleDropdown('krasa')}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', backgroundColor: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}
              />
              {activeDropdown === 'krasa' && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <div onClick={() => { setKrasa(''); setActiveDropdown(null); }} style={{ padding: '8px 10px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>Visas krāsas</div>
                  {COLORS.filter(c => c.name.toLowerCase().includes(krasa.toLowerCase())).map((col) => (
                    <div 
                      key={col.name} 
                      onClick={() => { setKrasa(col.name); setActiveDropdown(null); }} 
                      style={{ padding: '8px 10px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} 
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} 
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: col.hex, border: `1px solid ${col.border}` }}></span>
                      {col.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modelis input */}
            <div style={{ flex: '1', minWidth: '110px' }}>
              <input
                type="text"
                placeholder="Modelis"
                value={searchModel}
                onChange={(e) => setSearchModel(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', backgroundColor: '#fff', boxSizing: 'border-box' }}
              />
            </div>

          </div>
        </div>

        {/* SLUDINĀJUMU SARAKSTS - HORIZONTĀLAIS IZKĀRTOJUMS UZ LEJU */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Notiek sludinājumu ielāde...</div>
        ) : filteredCars.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', color: '#6b7280' }}>
            Atvainojiet, nav atrasts neviens auto, kas atbilstu izvēlētajiem kritērijiem.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredCars.map((car) => (
              <Link 
                href={`/auto/${car.id}`} 
                key={car.id} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px', 
                    overflow: 'hidden', 
                    padding: '12px 16px',
                    gap: '20px',
                    transition: 'transform 0.2s, box-shadow 0.2s', 
                    cursor: 'pointer' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* 1. FOTOGRĀFIJA */}
                  <div style={{ width: '150px', height: '95px', backgroundColor: '#e5e7eb', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                    {car.image_url || (car.images && car.images[0]) ? (
                      <img 
                        src={car.image_url || car.images[0]} 
                        alt={`${car.make} ${car.model}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '12px' }}>
                        Nav attēla
                      </div>
                    )}
                  </div>

                  {/* DATU RINDA (Precīzā secībā: Marka Modelis ➔ Izlaiduma gads ➔ Virsbūves tips ➔ Krāsa ➔ Nobraukums ➔ Cena) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '16px', flexWrap: 'wrap' }}>
                    
                    {/* 2. MARKA MODELIS */}
                    <div style={{ flex: '1.5', minWidth: '130px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                        {car.make} {car.model}
                      </div>
                    </div>

                    {/* 3. IZLAIDUMA GADS */}
                    <div style={{ flex: '0.8', minWidth: '70px', fontSize: '14px', color: '#4b5563' }}>
                      {car.year || car.gads || '—'}
                    </div>

                    {/* 4. VIRSBŪVES TIPS */}
                    <div style={{ flex: '1', minWidth: '110px', fontSize: '14px', color: '#4b5563' }}>
                      {car.body_type || car.virsbuve || '—'}
                    </div>

                    {/* 5. KRĀSA */}
                    <div style={{ flex: '0.8', minWidth: '80px', fontSize: '14px', color: '#4b5563' }}>
                      {car.color || car.krasa || '—'}
                    </div>

                    {/* 6. NOBRAUKUMS */}
                    <div style={{ flex: '1', minWidth: '95px', fontSize: '14px', color: '#4b5563' }}>
                      {car.mileage ? `${Number(car.mileage).toLocaleString()} km` : car.nobraukums || '—'}
                    </div>

                    {/* 7. CENA */}
                    <div style={{ flex: '1', minWidth: '90px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: '#0284c7' }}>
                      {car.price ? `${Number(car.price).toLocaleString()} €` : '—'}
                    </div>

                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
