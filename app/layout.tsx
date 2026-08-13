import React from 'react'
import Header from './components/Header'

export const metadata = {
  title: 'Tem-Auto Tirgus',
  description: 'Auto sludinājumu portāls',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="lv">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc' }}>
        <Header />
        {children}
      </body>
    </html>
  )
}
