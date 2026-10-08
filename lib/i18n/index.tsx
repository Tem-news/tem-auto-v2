'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import english from './en.json'
import russian from './ru.json'
import lithuanian from './lt.json'
import estonian from './et.json'
import german from './de.json'
import french from './fr.json'
import spanish from './es.json'
import portuguese from './pt.json'
import italian from './it.json'
import finnish from './fi.json'

export type Language = 'LV' | 'EN' | 'RU' | 'LT' | 'EE' | 'DE' | 'FR' | 'ES' | 'PT' | 'IT' | 'FI'
const dictionaries: Record<Exclude<Language, 'LV'>, Record<string, string>> = { EN: english, RU: russian, LT: lithuanian, EE: estonian, DE: german, FR: french, ES: spanish, PT: portuguese, IT: italian, FI: finnish }
const STORAGE_KEY = 'temauto-language'
const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void }>({ language: 'LV', setLanguage: () => {} })

// Only platform-owned labels are translated. Listing content is never passed here.
export function translateText(text: string, language: Language): string {
  if (language === 'LV') return text
  const messages = dictionaries[language]
  if (messages[text] !== undefined) return messages[text]
  const trimmed = text.trim()
  if (messages[trimmed] !== undefined) return text.replace(trimmed, messages[trimmed])
  const currency = text.match(/^(.*?) (\([A-Z]{3}\))$/)
  if (currency) return `${translateText(currency[1], language)} ${currency[2]}`
  return text
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, updateLanguage] = useState<Language>('LV')
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const preferred = navigator.language.toLowerCase()
    updateLanguage(saved === 'EN' || saved === 'RU' || saved === 'LT' || saved === 'EE' || saved === 'DE' || saved === 'FR' || saved === 'ES' || saved === 'PT' || saved === 'IT' || saved === 'FI' || saved === 'LV' ? saved : !saved && preferred.startsWith('fi') ? 'FI' : !saved && preferred.startsWith('it') ? 'IT' : !saved && preferred.startsWith('pt') ? 'PT' : !saved && preferred.startsWith('es') ? 'ES' : !saved && preferred.startsWith('fr') ? 'FR' : !saved && preferred.startsWith('de') ? 'DE' : !saved && preferred.startsWith('et') ? 'EE' : !saved && preferred.startsWith('lt') ? 'LT' : !saved && preferred.startsWith('ru') ? 'RU' : !saved && preferred.startsWith('en') ? 'EN' : 'LV')
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) updateLanguage(event.newValue === 'EN' || event.newValue === 'RU' || event.newValue === 'LT' || event.newValue === 'EE' || event.newValue === 'DE' || event.newValue === 'FR' || event.newValue === 'ES' || event.newValue === 'PT' || event.newValue === 'IT' || event.newValue === 'FI' ? event.newValue : 'LV')
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  useEffect(() => { document.documentElement.lang = language === 'EE' ? 'et' : language.toLowerCase() }, [language])
  const setLanguage = useCallback((value: Language) => {
    localStorage.setItem(STORAGE_KEY, value)
    updateLanguage(value)
  }, [])
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function useI18n() {
  const { language, setLanguage } = useContext(LanguageContext)
  const t = useCallback((text: string) => translateText(text, language), [language])
  const matches = useCallback((value: string, query: string) => {
    const needle = query.toLocaleLowerCase().trim()
    return value.toLocaleLowerCase().includes(needle) || translateText(value, language).toLocaleLowerCase().includes(needle)
  }, [language])
  // Resolve a translated suggestion back to its existing stored value.
  const canonical = useCallback((value: string, options: readonly string[]) =>
    options.find(option => option === value || translateText(option, language).toLocaleLowerCase() === value.toLocaleLowerCase()) ?? value,
  [language])
  return { language, setLanguage, t, matches, canonical }
}
