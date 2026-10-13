'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../lib/i18n'

export default function DesktopAdCarousel({ children, onPageChange }: { children: ReactNode; onPageChange: (shown: boolean) => void }) {
  const { t } = useI18n()
  const [page, setPage] = useState(0)
  const [motion, setMotion] = useState<{ from: number; direction: 'left' | 'right' } | null>(null)
  const animating = useRef(false)
  const [informationOpen, setInformationOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const gesture = useRef<{ x: number; y: number; id: number } | null>(null)
  const blockClick = useRef(false)
  const text = t('Ja vēlies šeit savu reklāmu, spied!')
  useEffect(() => {
    if (!informationOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.showModal()
    return () => { document.body.style.overflow = previous }
  }, [informationOpen])
  useEffect(() => { onPageChange(page === 1) }, [page, onPageChange])
  useEffect(() => {
    if (!motion) return
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240
    const timer = window.setTimeout(() => { setMotion(null); animating.current = false }, duration)
    return () => window.clearTimeout(timer)
  }, [motion])
  const paneStyle = (index: number) => ({
    transform: page === index ? 'translateX(0)' : 'translateX(100%)',
    visibility: (page === index || motion ? 'visible' : 'hidden') as 'visible' | 'hidden',
    animation: motion ? `desktopAd${index === motion.from ? 'Out' : 'In'}${motion.direction === 'left' ? 'Left' : 'Right'} 220ms ease both` : undefined,
  })
  return <>
    <div data-desktop-ad-carousel="true" onDragStart={event => event.preventDefault()}
      onTouchStart={event => { if (window.matchMedia('(max-width: 767px)').matches) event.stopPropagation() }}
      onTouchMove={event => { if (window.matchMedia('(max-width: 767px)').matches) event.stopPropagation() }}
      onPointerDown={event => {
        if (animating.current || event.button !== 0 || !window.matchMedia('(min-width: 768px)').matches) return
        event.stopPropagation()
        blockClick.current = false
        gesture.current = { x: event.clientX, y: event.clientY, id: event.pointerId }
      }}
      onPointerMove={event => {
        const start = gesture.current
        if (!start || start.id !== event.pointerId) return
        const x = Math.abs(event.clientX - start.x), y = Math.abs(event.clientY - start.y)
        if (x > 10 && x > y) {
          blockClick.current = true
          event.preventDefault()
          event.stopPropagation()
          event.currentTarget.setPointerCapture(event.pointerId)
        }
      }}
      onPointerUp={event => {
        const start = gesture.current
        gesture.current = null
        if (!start || start.id !== event.pointerId) return
        const x = Math.abs(event.clientX - start.x), y = Math.abs(event.clientY - start.y)
        if (x >= 35 && x > y) {
          event.preventDefault()
          event.stopPropagation()
          blockClick.current = true
          animating.current = true
          setMotion({ from: page, direction: event.clientX < start.x ? 'left' : 'right' })
          setPage(value => 1 - value)
        }
      }}
      onPointerCancel={() => { gesture.current = null }}
      onClickCapture={event => {
        if (blockClick.current) { event.preventDefault(); event.stopPropagation() }
      }}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'pan-y', borderRadius: 'inherit', userSelect: 'none', cursor: 'grab' }}>
      <style>{`
        [data-desktop-ad-track="true"] { position:relative; width:100%; height:100%; }
        [data-desktop-ad-pane="true"] { position:absolute; inset:0; width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:3px; overflow:hidden; }
        [data-desktop-ad-cta="true"] { width:100%; height:100%; border:0; padding:16px; background:#eff6ff; color:#1e40af; font-family:inherit;font-weight:700;font-size:16px;line-height:1.4; cursor:pointer; }
        html[data-temauto-desktop-theme="night"] [data-desktop-ad-cta="true"] { background:#172554; color:#dbeafe; }
        [data-desktop-ad-cta="true"] [data-ad-unavailable="true"] { display:block; margin-top:8px; color:#9a3412; font-size:13px; font-weight:500; font-style:italic; }
        html[data-temauto-desktop-theme="night"] [data-desktop-ad-cta="true"] [data-ad-unavailable="true"] { color:#fdba74; }
        @keyframes desktopAdInLeft { from {transform:translateX(100%)} to {transform:translateX(0)} }
        @keyframes desktopAdOutLeft { from {transform:translateX(0)} to {transform:translateX(-100%)} }
        @keyframes desktopAdInRight { from {transform:translateX(-100%)} to {transform:translateX(0)} }
        @keyframes desktopAdOutRight { from {transform:translateX(0)} to {transform:translateX(100%)} }
        @media(prefers-reduced-motion:reduce){[data-desktop-ad-pane="true"]{animation:none!important}}

      `}</style>
      <div data-desktop-ad-track="true">
        <div data-desktop-ad-pane="true" style={paneStyle(0)} ref={element => { element?.toggleAttribute('inert', page === 1) }} aria-hidden={page === 1 ? true : undefined}>{children}</div>
        <div data-desktop-ad-pane="true" style={paneStyle(1)} ref={element => { element?.toggleAttribute('inert', page === 0) }} aria-hidden={page === 0 ? true : undefined}>
          <button type="button" data-desktop-ad-cta="true" onClick={() => setInformationOpen(true)}><span>{text}</span><span data-ad-unavailable="true">{t('Pagaidām nav pieejams')}</span></button>
        </div>
      </div>
    </div>
    {informationOpen && createPortal(
      <dialog ref={dialog} aria-label={text} data-desktop-ad-information="true"
        onClose={() => setInformationOpen(false)} onCancel={() => setInformationOpen(false)}
        style={{ width:'calc(100% - 32px)', maxWidth:600, minHeight:180, boxSizing:'border-box', border:'1px solid #94a3b8', borderRadius:12, padding:'54px 20px 20px', background:'#ffffff', color:'#1e293b' }}>
        <style>{`html[data-temauto-desktop-theme="night"] [data-desktop-ad-information="true"]{background:#0f172a!important;color:#f1f5f9!important}`}</style>
        <strong>{t('Reklāma')}</strong>
        <button type="button" autoFocus aria-label={t('Aizvērt')} onClick={() => setInformationOpen(false)}
          style={{ position:'absolute', top:10, right:10, width:34, height:34, border:'1px solid #94a3b8', borderRadius:6, background:'transparent', color:'inherit', fontSize:24 }}>×</button>
      </dialog>, document.body)}
  </>
}
