'use client'

import type { CSSProperties } from 'react'

const PLACEMENT_HEIGHT_PX = 300

const placementStyle: CSSProperties = {
  width: '100%',
  height: `${PLACEMENT_HEIGHT_PX}px`,
  minHeight: `${PLACEMENT_HEIGHT_PX}px`,
  boxSizing: 'border-box',
  border: '2px dashed #d1d5db',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  backgroundColor: '#f9fafb',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#6b7280',
  fontSize: '13px',
  flexShrink: 0
}

export default function TemAutoSponsorPlacement({ stretch = false }: { stretch?: boolean }) {
  const style: CSSProperties = stretch
    ? {
        ...placementStyle,
        height: 'auto',
        minHeight: '280px',
        flex: '1 1 0',
        maxHeight: '52vh'
      }
    : placementStyle

  return (
    <aside
      data-temauto-sponsor-placement="true"
      aria-label="REKLĀMA"
      style={style}
    >
      <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA</span>
      <span>REKLĀMA — vieta reklāmas devējam</span>
    </aside>
  )
}
