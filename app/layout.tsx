import './catalogue-mobile.css'
import { headers } from 'next/headers'
import { COUNTRIES } from '../lib/countries'
import Header from './components/Header'
import { LanguageProvider } from '../lib/i18n'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const countryCode = (await headers()).get('x-vercel-ip-country')?.toLowerCase()
  const country = COUNTRIES.find(item => item.code === countryCode)
  const initialLanguage = country?.language ?? 'LV'
  const initialRegion = country ? `${country.name} (${country.currency})` : undefined
  return (
    <html lang={initialLanguage === 'EE' ? 'et' : initialLanguage.toLowerCase()}>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc' }}>
        <LanguageProvider initialCountry={country?.code}>
        <Header initialRegion={initialRegion} />
        <main style={{ width: '100%', margin: 0, padding: 0, boxSizing: 'border-box' }}>
          {children}
        </main>
        </LanguageProvider>
      </body>
    </html>
  )
}

