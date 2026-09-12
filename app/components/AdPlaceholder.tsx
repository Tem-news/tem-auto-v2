'use client'

import type { CSSProperties } from 'react'

/** Existing homepage upper-banner treatment. Keep both slots identical. */
export const AD_PLACEHOLDER_MIN_HEIGHT_PX = 300

const bannerStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '2px dashed #d1d5db',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  backgroundColor: '#f9fafb',
  minHeight: `${AD_PLACEHOLDER_MIN_HEIGHT_PX}px`,
  height: `${AD_PLACEHOLDER_MIN_HEIGHT_PX}px`,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#6b7280',
  fontSize: '13px'
}

export default function AdPlaceholder() {
  return (
    <div data-ad-placeholder="true" style={bannerStyle}>
      <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA</span>
      <span>Globālais baneris šeit!</span>
    </div>
  )
}
