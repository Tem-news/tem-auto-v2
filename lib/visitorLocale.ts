import { COUNTRIES } from './countries'
import type { Language } from './i18n'

// Resolve only a first visit; saved or newly selected preferences always win.
export async function initializeVisitorLocale(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  fallbackLanguage: Language,
  signal: AbortSignal,
  request: typeof fetch = fetch,
): Promise<{ region: string; language: Language } | null> {
  const hasPreferences = () => storage.getItem('temauto-region') !== null || storage.getItem('temauto-language') !== null
  if (hasPreferences() || signal.aborted) return null
  let country = COUNTRIES.find(item => item.code === 'lv')!
  let language = fallbackLanguage
  try {
    const response = await request('/api/visitor-country', { cache: 'no-store', signal })
    if (response.ok) {
      const data = await response.json()
      const detected = typeof data.country === 'string'
        ? COUNTRIES.find(item => item.code === data.country.toLowerCase())
        : undefined
      if (detected) {
        country = detected
        language = detected.language
      }
    }
  } catch {
    // If detection is unavailable, keep and save the existing browser defaults.
  }
  if (signal.aborted || hasPreferences()) return null
  const region = `${country.name} (${country.currency})`
  storage.setItem('temauto-region', region)
  storage.setItem('temauto-language', language)
  return { region, language }
}
