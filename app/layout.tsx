import './catalogue-mobile.css'
import Header from './components/Header'
import { LanguageProvider } from '../lib/i18n'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc' }}>
        <LanguageProvider>
        <Header />
        <main style={{ width: '100%', margin: 0, padding: 0, boxSizing: 'border-box' }}>
          {children}
        </main>
        </LanguageProvider>
      </body>
    </html>
  )
}

