import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Coinbase Clone',
  description: 'Cryptocurrency trading platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

