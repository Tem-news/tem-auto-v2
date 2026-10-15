'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { COUNTRIES } from '../../lib/countries'
import { useI18n } from '../../lib/i18n'

export default function ListingCountries({ codes, onChange }: { codes: string[] | null; onChange: (codes: string[] | null) => void }) {
  const { t, matches } = useI18n()
  const [phase, setPhase] = useState<0 | 1 | 2>(0)
  const [search, setSearch] = useState('')
  const container = useRef<HTMLFieldSetElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const id = useId()
  useEffect(() => {
    if (!phase) return
    const close = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) { setPhase(0); setSearch(''); input.current?.blur() }
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [phase])
  useEffect(() => {
    if (phase !== 2) return
    const keepVisible = () => input.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    window.visualViewport?.addEventListener('resize', keepVisible)
    return () => window.visualViewport?.removeEventListener('resize', keepVisible)
  }, [phase])
  const toggle = () => {
    const mobile = window.matchMedia('(max-width: 767px)').matches
    if (!phase) {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
      setPhase(mobile ? 1 : 2)
      if (!mobile && input.current) { input.current.readOnly = false; input.current.focus() }
    } else if (mobile && phase === 1) {
      if (input.current) { input.current.readOnly = false; input.current.focus({ preventScroll: true }) }
      setPhase(2)
    } else { setPhase(0); setSearch(''); input.current?.blur() }
  }
  const summary = codes === null ? t('Visas valstis') : COUNTRIES.filter(country => codes.includes(country.code)).map(country => t(country.name)).join(', ')
  return <fieldset ref={container} data-listing-countries style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}>
    <legend style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 6 }}>{t('Valstis, kurās rādīt sludinājumu')}</legend>
    <input ref={input} aria-label={t('Meklēt valsti')} aria-controls={id} aria-expanded={phase > 0} type="search" readOnly={phase !== 2}
      value={search} placeholder={phase ? t('Meklēt valsti') : summary || t('Meklēt valsti')}
      onPointerDown={event => { event.preventDefault(); event.stopPropagation() }} onClick={toggle}
      onChange={event => setSearch(event.target.value)}
      onKeyDown={event => { if (event.key === 'Escape') { setPhase(0); setSearch(''); input.current?.blur() } else if (event.key === 'Enter') { event.preventDefault(); toggle() } }}
      style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
    {phase > 0 && <div id={id} style={{ maxHeight: 220, overflowY: 'auto', overscrollBehavior: 'contain', border: '1px solid #d1d5db', borderRadius: 6, padding: 6 }}>
      <label><input type="checkbox" checked={codes === null} onChange={event => onChange(event.target.checked ? null : [])} />{t('Visas valstis')}</label>
      {COUNTRIES.filter(country => matches(country.name, search)).map(country => <label key={country.code}>
        <input type="checkbox" checked={codes === null || codes.includes(country.code)} onChange={event => {
          const current = codes === null ? COUNTRIES.map(item => item.code) : codes
          const next = event.target.checked ? Array.from(new Set([...current, country.code])) : current.filter(code => code !== country.code)
          onChange(next.length === COUNTRIES.length ? null : next)
        }} /><img src={country.flagUrl} alt="" width={20} height={15} /><span>{t(country.name)}</span>
      </label>)}
    </div>}
    <style jsx global>{`
      [data-listing-countries] legend { color:#374151 }
      @media(max-width:767px){html[data-temauto-theme=night] [data-listing-countries] legend { color:#e5e7eb }}
      @media(min-width:768px){html[data-temauto-desktop-theme=night] [data-listing-countries] legend { color:#e5e7eb }}
      [data-add-car-form] [data-listing-countries] label { display:flex;align-items:center;gap:8px;padding:7px 4px;cursor:pointer;font-size:14px }
      [data-add-car-form] [data-listing-countries] input[type=checkbox] { width:16px!important;height:16px!important;min-height:16px!important;padding:0!important;flex:0 0 16px;appearance:auto }
    `}</style>
  </fieldset>
}
