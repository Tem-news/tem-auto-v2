import previewCarsFixture from '../data/preview-cars.anonymized.json'

export const DEVELOPMENT_SUPABASE_REF = 'pwmwckjavolrjyfiobgp'
export const PREVIEW_LISTING_FLAG = 'isPreviewListing' as const

const PUBLIC_IMAGE_PATH_PREFIX = '/storage/v1/object/public/car-images'
const LEGACY_PUBLIC_IMAGE_REF = 'ukzuybqfuvhmygyivcnp'

type FixtureCar = {
  id: number
  make: string | null
  model: string | null
  year: number | null
  price: number | null
  engine: string | null
  volume: number | null
  gearbox: string | null
  body_type: string | null
  color: string | null
  mileage: number | null
  tech_inspection: string | null
  steering_wheel: string | null
  interior_color: string | null
  country: string | null
  region: string | null
  city: string | null
  images: string[]
  image: string | null
  image_url: string | null
  created_at: string | null
  views: number
}

export type PreviewListing = FixtureCar & {
  [PREVIEW_LISTING_FLAG]: true
  user_id: null
}

function legacyPublicImageOrigin(): string {
  return ['https://', LEGACY_PUBLIC_IMAGE_REF, '.supabase.co'].join('')
}

export function canUseDevPreviewFallback(
  supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL
): boolean {
  if (!supabaseUrl) return false
  const match = supabaseUrl.trim().match(/^https:\/\/([a-z0-9]+)\.supabase\.co\/?$/)
  return match?.[1] === DEVELOPMENT_SUPABASE_REF
}

function expandPublicImagePath(path: string | null | undefined): string | null {
  if (!path || typeof path !== 'string') return null
  const value = path.trim()
  if (!value.startsWith(PUBLIC_IMAGE_PATH_PREFIX + '/') && value !== PUBLIC_IMAGE_PATH_PREFIX) {
    return null
  }
  if (value.includes('..') || value.includes('?') || value.includes('#') || value.includes('://')) {
    return null
  }
  const ext = value.split('.').pop()?.toLowerCase()
  if (!ext || !['jpg', 'jpeg', 'webp', 'png', 'gif'].includes(ext)) {
    return null
  }
  return legacyPublicImageOrigin() + value
}

function adaptPreviewCar(row: FixtureCar): PreviewListing {
  const images = (row.images || [])
    .map((item) => expandPublicImagePath(item))
    .filter((item): item is string => Boolean(item))
  const cover = expandPublicImagePath(row.image) || expandPublicImagePath(row.image_url) || images[0] || null

  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    price: row.price,
    engine: row.engine,
    volume: row.volume,
    gearbox: row.gearbox,
    body_type: row.body_type,
    color: row.color,
    mileage: row.mileage,
    tech_inspection: row.tech_inspection,
    steering_wheel: row.steering_wheel,
    interior_color: row.interior_color,
    country: row.country,
    region: row.region,
    city: row.city,
    images,
    image: cover,
    image_url: cover,
    created_at: row.created_at,
    views: row.views ?? 0,
    [PREVIEW_LISTING_FLAG]: true,
    user_id: null,
  }
}

export function isPreviewListing(car: unknown): boolean {
  return Boolean(car && typeof car === 'object' && (car as PreviewListing)[PREVIEW_LISTING_FLAG] === true)
}

export function loadAdaptedPreviewCars(): PreviewListing[] {
  return (previewCarsFixture as FixtureCar[]).map(adaptPreviewCar)
}

export function getAdaptedPreviewCarById(id: string | number): PreviewListing | null {
  const numericId = typeof id === 'number' ? id : Number(id)
  if (!Number.isFinite(numericId)) return null
  const row = (previewCarsFixture as FixtureCar[]).find((item) => item.id === numericId)
  return row ? adaptPreviewCar(row) : null
}
