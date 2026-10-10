'use client'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { useI18n } from '../../lib/i18n'
import { mediaUrl, publishedAds, safeAdLink, type AdSlot, type Advertisement } from '../../lib/advertising'

export default function AdvertisingSlot({ slot, as: Tag = 'div', children, style, ...attributes }: {
  slot: AdSlot; as?: 'div' | 'aside'; children: ReactNode; style?: CSSProperties;
  [key: string]: unknown;
}) {
  const { t } = useI18n()
  const [ad, setAd] = useState<Advertisement | null>(null)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    let alive = true
    const refresh = () => publishedAds().then(ads => { if (alive) setAd(ads.find(item => item.slot === slot) || null) })
    void refresh()
    const timer = window.setInterval(refresh, 30000)
    window.addEventListener('temauto-ads-updated', refresh)
    return () => { alive = false; clearInterval(timer); window.removeEventListener('temauto-ads-updated', refresh) }
  }, [slot])
  const href = ad && safeAdLink(ad.target_url)
  const mobile = slot.startsWith('mobile_')
  return <Tag {...attributes} style={{ ...style, ...(ad && href ? { position: 'relative', overflow: 'hidden', ...(mobile ? { height: 100, minHeight: 100 } : {}) } : {}) }}>
    {ad && href ? <>
      <a href={href} target="_blank" rel="noopener noreferrer sponsored" aria-label={ad.title}
        style={{ position: 'absolute', inset: 0, display: 'block', color: 'inherit' }}>
        {ad.media_type === 'video' ? <video key={ad.media_path} ref={element => {
          if (!element) return
          if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) element.pause()
          else void element.play().catch(() => {})
        }} src={mediaUrl(ad.media_path)} muted playsInline loop preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          : <img src={mediaUrl(ad.media_path)} alt={ad.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />}
      </a>
      <span style={{ position: 'absolute', top: 3, left: 5, background: 'rgba(0,0,0,.65)', color: 'white', fontSize: 10, padding: '2px 4px', pointerEvents: 'none' }}>{t('Reklāma')}</span>
      {ad.media_type === 'video' && <button type="button" aria-label={paused ? 'Atskaņot video' : 'Apturēt video'} onClick={() => setPaused(!paused)} style={{ position: 'absolute', right: 5, bottom: 5, zIndex: 1, cursor: 'pointer' }}>{paused ? '▶' : 'Ⅱ'}</button>}
    </> : children}
  </Tag>
}
