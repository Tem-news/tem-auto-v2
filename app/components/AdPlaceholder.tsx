'use client'

import type { CSSProperties } from 'react'

/** Homepage upper-banner treatment from the approved baseline. */
export const AD_PLACEHOLDER_MIN_HEIGHT_PX = 300

const bannerStyle: CSSProperties = {
  border: '2px dashed #d1d5db',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  backgroundColor: '#f9fafb',
  minHeight: `${AD_PLACEHOLDER_MIN_HEIGHT_PX}px`,
  minWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#6b7280',
  fontSize: '13px',
  flexShrink: 0,
  boxSizing: 'content-box'
}

export default function AdPlaceholder() {
  return (
    <div data-ad-placeholder="true" style={bannerStyle}>
      <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>REKLĀMA</span>
      <span>Globālais baneris šeit!</span>
    </div>
  )
}
