import './globals.css'

import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { getTenantColorSchema } from '@/lib/actions/tenant'
import { ColorPreset, getHtmlStyleColors } from '@/theme/colors'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'InmoApp App',
  description: 'InmoApp application with theme support',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const colorSchema = await getTenantColorSchema()
  const htmlStyleColors = getHtmlStyleColors(colorSchema as ColorPreset)
  return (
    <html lang="en" style={htmlStyleColors as React.CSSProperties}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
