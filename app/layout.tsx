import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import { ORGANIZATION_TITLE } from '@/lib/site-title'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${ORGANIZATION_TITLE} — Las Flores`,
  description: `Sistema de gestión de expedientes de la ${ORGANIZATION_TITLE} del Municipio de Las Flores`,
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased bg-background">
        <Header />
        <Navbar />
        <main className="min-w-0">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  )
}
