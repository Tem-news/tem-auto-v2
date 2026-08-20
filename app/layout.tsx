export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc' }}>
        <Header />
        {/* Šeit ietinam children centrējošā blokā */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
