import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SIP-HP SDN 2 TUNJUNGTIRTO',
  description: 'Sistem Informasi Penghapusan Sarana dan Prasarana SD Negeri 2 Tanjung Tirto',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  )
}