import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import SiteNavigation from '@/components/site-navigation'
import './globals.css'
import './auth.css'
import './catalog.css'

export const metadata: Metadata = {
  title: 'BookNook | A small online library',
  description: 'Discover thoughtful stories, curious ideas, and your next favorite read at BookNook.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: '#101a17',
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="dark" data-scroll-behavior="smooth"><body className="antialiased"><SiteNavigation />{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
