'use client'

import type { ImgHTMLAttributes } from 'react'

export default function DemoPhoto({ src, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const source = typeof src === 'string' ? src : ''
  const match = source.match(/^\/demo-photos\/([a-f0-9]{20}(?:-v2)?\.jpg)$/)
    || source.match(/^https:\/\/pwmwckjavolrjyfiobgp\.supabase\.co\/storage\/v1\/object\/public\/car-images\/demo-2026-10-06\/([a-f0-9]{20}(?:-v2)?\.jpg)$/)

  return <img {...props} src={match ? `/api/demo-photo/v2/${match[1]}` : src} />
}
