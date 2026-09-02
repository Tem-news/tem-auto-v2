'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PievienotPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: '',
    price: '',
    location: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Šeit nāk tava auto pievienošanas loģika (piemēram, Supabase datubāzei)
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 1000);
  };

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h1>Pievienot jaunu sludinājumu</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Virsraksts</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Marka</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Modelis</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Gads</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Cena (€)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Atrašanās vieta / Reģions</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Apraksts</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {/* Attēlu galerijas režģis, kur iepriekš bija kļūda ar dubulto platumu */}
        <div
          style={{ 
            width: '100%', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', 
            gap: '12px' 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <div key={idx} style={{ position: 'relative', aspectRatio: '1', background: '#eee', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={img} alt={`Upload ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '16px'
          }}
        >
          {loading ? 'Pievieno...' : 'Pievienot sludinājumu'}
        </button>
      </form>
    </main>
  );
}
