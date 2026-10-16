import { COUNTRIES, findCountry } from './countries'

export function catalogueCountryCode(value: string): string | undefined {
  const country = findCountry(value) || COUNTRIES.find(item =>
    item.code === value.toLowerCase() || item.name.toLowerCase() === value.toLowerCase() || item.headerRegions.includes(value))
  return country?.code
}

export function listingBelongsToCountry(car: { country?: string; valsts?: string; country_code?: string }, code: string): boolean {
  const listingCode = catalogueCountryCode(car.country || car.valsts || '') || car.country_code?.trim().toLowerCase()
  return listingCode === code
}

export function listingVisibleInCountry(car: { country?: string; valsts?: string; country_code?: string; visibility_country_codes?: string[] | null }, code: string): boolean {
  if (Array.isArray(car.visibility_country_codes)) {
    return car.visibility_country_codes.includes('*') || car.visibility_country_codes.includes(code.toLowerCase())
  }
  return listingBelongsToCountry(car, code)
}
