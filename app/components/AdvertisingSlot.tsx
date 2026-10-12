'use client'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import MobileAdCarousel from './MobileAdCarousel'
import DesktopAdCarousel from './DesktopAdCarousel'
import { manageDesktopBannerVideo } from '../../lib/desktopBannerVideo'
import { useI18n } from '../../lib/i18n'
import { catalogueCountryCode } from '../../lib/catalogueCountry'
import { advertisementForCountry, mediaUrl, publishedAds, safeAdLink, type AdSlot, type Advertisement } from '../../lib/advertising'

export default function AdvertisingSlot({ slot, as: Tag = 'div', children, style, ...attributes }: {
  slot: AdSlot; as?: 'div' | 'aside'; children: ReactNode; style?: CSSProperties;
  [key: string]: unknown;
}) {
  const { t } = useI18n()
  const [ad, setAd] = useState<Advertisement | null>(null)
  const [paused, setPaused] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [invitationShown, setInvitationShown] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const bannerVideo = useRef<HTMLVideoElement | null>(null)
  useEffect(() => {
    if (ad?.media_type !== 'video' || !bannerVideo.current) return
    return manageDesktopBannerVideo(bannerVideo.current, mediaUrl(ad.media_path), paused || expanded || invitationShown, () => setPaused(true))
  }, [ad?.media_path, ad?.media_type, paused, expanded, invitationShown])
  useEffect(() => {
    if (!expanded) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.showModal()
    return () => { document.body.style.overflow = previous }
  }, [expanded])
  useEffect(() => {
    let alive = true
    let country = document.documentElement.dataset.temautoAdCountry || catalogueCountryCode(localStorage.getItem('temauto-region') || 'Latvija') || 'lv'
    const refresh = () => publishedAds().then(ads => { if (alive) setAd(advertisementForCountry(ads, slot, country)) })
    const selectCountry = (event: Event) => {
      country = (event as CustomEvent<string>).detail
      setExpanded(false)
      void refresh()
    }
    window.addEventListener('temauto-ad-country', selectCountry)
    void refresh()
    const timer = window.setInterval(refresh, 30000)
    window.addEventListener('temauto-ads-updated', refresh)
    return () => {
      alive = false
      clearInterval(timer)
      window.removeEventListener('temauto-ads-updated', refresh)
      window.removeEventListener('temauto-ad-country', selectCountry)
    }
  }, [slot])
  const href = ad && safeAdLink(ad.target_url)
  const mobile = slot.startsWith('mobile_')
  const bannerMedia = ad ? (ad.media_type === 'video' ? <video key={ad.media_path} ref={element => {
          bannerVideo.current = element
          if (!element || window.matchMedia('(min-width: 768px)').matches) return
          if (paused || expanded || window.matchMedia('(prefers-reduced-motion: reduce)').matches) element.pause()
          else void element.play().catch(() => {})
        }} src={mediaUrl(ad.media_path)} muted playsInline loop preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
          : <img src={mediaUrl(ad.media_path)} alt={ad.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />) : null
  const content =
    ad ? <>
      {href ? <a href={href} target="_blank" rel="noopener noreferrer sponsored" aria-label={ad.title}
        style={{ position: 'absolute', inset: 0, display: 'block', color: 'inherit' }}>
        {bannerMedia}
      </a> : <button type="button" onClick={() => setExpanded(true)} aria-label={ad.title}
        style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', padding: 0, margin: 0, border: 0, background: 'transparent', cursor: 'pointer' }}>
        {bannerMedia}
      </button>}
      <span style={{ position: 'absolute', top: 3, left: 5, background: 'rgba(0,0,0,.65)', color: 'white', fontSize: 10, padding: '2px 4px', pointerEvents: 'none' }}>{t('Reklāma')}</span>
      {ad.media_type === 'video' && <button type="button" aria-label={paused ? 'Atskaņot video' : 'Apturēt video'} onClick={() => setPaused(!paused)} style={{ position: 'absolute', right: 5, bottom: 5, zIndex: 1, cursor: 'pointer' }}>{paused ? '▶' : 'Ⅱ'}</button>}
      {expanded && createPortal(<dialog ref={dialog} aria-label={ad.title} onClose={() => setExpanded(false)} onCancel={() => setExpanded(false)}
        style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh', maxWidth: 'none', maxHeight: 'none', margin: 0, padding: 0, border: 0, background: '#020617', color: 'white', overflow: 'hidden' }}>
        {ad.media_type === 'video'
          ? <video src={mediaUrl(ad.media_path)} controls autoPlay muted playsInline loop style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          : <img src={mediaUrl(ad.media_path)} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />}
        <button type="button" autoFocus onClick={() => setExpanded(false)} aria-label={t('Aizvērt')}
          style={{ position: 'absolute', top: 'max(12px, env(safe-area-inset-top))', right: 12, width: 44, height: 44, border: '1px solid #94a3b8', borderRadius: 8, background: 'rgba(0,0,0,.75)', color: 'white', fontSize: 28, cursor: 'pointer' }}>×</button>
      </dialog>, document.body)}
    </> : children
  return <Tag {...attributes} style={{ ...style, ...(ad ? { position: 'relative', overflow: 'hidden', ...(mobile ? { height: 100, minHeight: 100 } : {}) } : {}), position: 'relative', overflow: 'hidden' }}>
    {mobile ? <MobileAdCarousel>{content}</MobileAdCarousel> : <DesktopAdCarousel onPageChange={setInvitationShown}>{content}</DesktopAdCarousel>}
  </Tag>
}
