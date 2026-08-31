import Header from './components/Header'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
