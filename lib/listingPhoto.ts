// Limit listing photos before transferring them to Storage, on both device layouts.
export const LISTING_PHOTO_MAX_EDGE = 1920
export const LISTING_PHOTO_MAX_BYTES = 400 * 1024

export async function prepareListingPhoto(file: File): Promise<File> {
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const scale = Math.min(1, LISTING_PHOTO_MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight))
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('Invalid photo')
    if (scale === 1 && file.size <= LISTING_PHOTO_MAX_BYTES && /^image\/(jpeg|png|webp)$/.test(file.type)) return file
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Photo processing unavailable')
    const encode = (quality: number) => new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Photo encoding failed')), 'image/jpeg', quality)
    })
    let quality = 0.85
    let blob: Blob
    while (true) {
      context.fillStyle = '#fff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      blob = await encode(quality)
      if (blob.size <= LISTING_PHOTO_MAX_BYTES) break
      if (quality > 0.6) quality -= 0.1
      else {
        canvas.width = Math.max(1, Math.floor(canvas.width * 0.8))
        canvas.height = Math.max(1, Math.floor(canvas.height * 0.8))
      }
    }
    return new File([blob], file.name.replace(/\.[^.]*$/, '') + '.jpg', { type: 'image/jpeg' })
  } finally { URL.revokeObjectURL(url) }
}
