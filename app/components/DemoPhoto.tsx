'use client'

import { useState, type ImgHTMLAttributes } from 'react'

const markedPhotos = new Map<string, string>()

function isDemoPhoto(src: string) {
  return src.startsWith('/demo-photos/') || src.includes('pwmwckjavolrjyfiobgp.supabase.co/storage/v1/object/public/car-images/demo-2026-10-06/')
}

export default function DemoPhoto({ src, onLoad, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const source = typeof src === 'string' ? src : ''
  const demo = isDemoPhoto(source)
  const [marked, setMarked] = useState<{ source: string; url: string } | null>(null)
  const displayedSource = demo ? (marked?.source === source ? marked.url : markedPhotos.get(source) || source) : src

  return (
    <img
      {...props}
      src={displayedSource}
      crossOrigin={demo ? 'anonymous' : props.crossOrigin}
      onLoad={(event) => {
        onLoad?.(event)
        if (!demo || displayedSource !== source) return
        const image = event.currentTarget
        if (!image.naturalWidth || !image.naturalHeight) return
        try {
          const canvas = document.createElement('canvas')
          canvas.width = image.naturalWidth
          canvas.height = image.naturalHeight
          const context = canvas.getContext('2d')
          if (!context) return
          context.drawImage(image, 0, 0)
          context.save()
          context.translate(canvas.width / 2, canvas.height / 2)
          context.rotate(-14 * Math.PI / 180)
          const fontSize = Math.min(canvas.width * 0.14, canvas.height * 0.25)
          context.font = `700 ${fontSize}px Arial, sans-serif`
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.lineJoin = 'round'
          context.lineWidth = Math.max(1, fontSize * 0.018)
          context.strokeStyle = 'rgba(0, 0, 0, 0.42)'
          context.fillStyle = 'rgba(255, 255, 255, 0.52)'
          context.strokeText('Paraugs', 0, 0)
          context.fillText('Paraugs', 0, 0)
          context.restore()
          const url = canvas.toDataURL('image/jpeg', 0.94)
          if (markedPhotos.size >= 60) markedPhotos.delete(markedPhotos.keys().next().value!)
          markedPhotos.set(source, url)
          setMarked({ source, url })
        } catch {
          // Keep the existing photo visible if the browser cannot process it.
        }
      }}
    />
  )
}
