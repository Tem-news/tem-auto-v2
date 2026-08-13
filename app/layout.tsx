import React from 'react'

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
      <body>{children}</body>
    </html>
  )
}
