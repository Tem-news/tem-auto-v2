import Header from './components/Header'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv" style={{ overflowY: 'scroll', width: '100%' }}>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', width: '100%', overflowX: 'hidden' }}>
        <Header />
        <main style={{ width: '100%', margin: 0, padding: 0, boxSizing: 'border-box' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
