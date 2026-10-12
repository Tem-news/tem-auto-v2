'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../lib/i18n'

export default function MobileAdCarousel({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const [page, setPage] = useState(0)
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
  return <>
    <div data-mobile-ad-carousel="true"
      onTouchStart={event => { if (window.matchMedia('(max-width: 767px)').matches) event.stopPropagation() }}
      onTouchMove={event => { if (window.matchMedia('(max-width: 767px)').matches) event.stopPropagation() }}
      onPointerDown={event => {
        if (event.pointerType !== 'touch' || !window.matchMedia('(max-width: 767px)').matches) return
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
          setPage(value => 1 - value)
        }
      }}
      onPointerCancel={() => { gesture.current = null }}
      onClickCapture={event => {
        if (blockClick.current) { event.preventDefault(); event.stopPropagation() }
      }}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'pan-y', borderRadius: 'inherit' }}>
      <style>{`
        [data-mobile-ad-track="true"] { display:flex; width:200%; height:100%; transition:transform 220ms ease; }
        [data-mobile-ad-pane="true"] { position:relative; flex:0 0 50%; width:50%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:3px; overflow:hidden; }
        [data-mobile-ad-cta="true"] { width:100%; height:100%; border:0; padding:16px; background:#eff6ff; color:#1e40af; font-family:inherit;font-weight:700;font-size:16px;line-height:1.4; cursor:pointer; }
        html[data-temauto-theme="night"] [data-mobile-ad-cta="true"] { background:#172554; color:#dbeafe; }
        @media(prefers-reduced-motion:reduce){[data-mobile-ad-track="true"]{transition:none}}
        @media(min-width:768px){
          [data-mobile-ad-track="true"]{width:100%;transform:none!important}
          [data-mobile-ad-pane="true"]{width:100%;flex-basis:100%}
          [data-mobile-ad-pane="true"] + [data-mobile-ad-pane="true"]{display:none}
        }
      `}</style>
      <div data-mobile-ad-track="true" style={{ transform: `translateX(-${page * 50}%)` }}>
        <div data-mobile-ad-pane="true" ref={element => { element?.toggleAttribute('inert', page === 1) }} aria-hidden={page === 1 ? true : undefined}>{children}</div>
        <div data-mobile-ad-pane="true" ref={element => { element?.toggleAttribute('inert', page === 0) }} aria-hidden={page === 0 ? true : undefined}>
          <button type="button" data-mobile-ad-cta="true" onClick={() => setInformationOpen(true)}>{text}</button>
        </div>
      </div>
    </div>
    {informationOpen && createPortal(
      <dialog ref={dialog} aria-label={text} data-mobile-ad-information="true"
        onClose={() => setInformationOpen(false)} onCancel={() => setInformationOpen(false)}
        style={{ width:'calc(100% - 32px)', maxWidth:600, minHeight:180, boxSizing:'border-box', border:'1px solid #94a3b8', borderRadius:12, padding:'54px 20px 20px', background:'#ffffff', color:'#1e293b' }}>
        <style>{`html[data-temauto-theme="night"] [data-mobile-ad-information="true"]{background:#0f172a!important;color:#f1f5f9!important}`}</style>
        <strong>{t('Reklāma')}</strong>
        <button type="button" autoFocus aria-label={t('Aizvērt')} onClick={() => setInformationOpen(false)}
          style={{ position:'absolute', top:10, right:10, width:34, height:34, border:'1px solid #94a3b8', borderRadius:6, background:'transparent', color:'inherit', fontSize:24 }}>×</button>
      </dialog>, document.body)}
  </>
}
