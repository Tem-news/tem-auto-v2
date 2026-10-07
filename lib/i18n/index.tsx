'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import english from './en.json'

export type Language = 'LV' | 'EN'
const messages: Record<string, string> = english
const STORAGE_KEY = 'temauto-language'
const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void }>({ language: 'LV', setLanguage: () => {} })

// Only platform-owned labels are translated. Listing content is never passed here.
export function translateText(text: string, language: Language): string {
  if (language === 'LV') return text
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
    updateLanguage(saved === 'EN' ? 'EN' : saved === 'LV' ? 'LV' : !saved && navigator.language.toLowerCase().startsWith('en') ? 'EN' : 'LV')
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) updateLanguage(event.newValue === 'EN' ? 'EN' : 'LV')
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  useEffect(() => { document.documentElement.lang = language.toLowerCase() }, [language])
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
