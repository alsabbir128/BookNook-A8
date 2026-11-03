import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import SiteNavigation from '@/components/site-navigation'
import './globals.css'
import './auth.css'
import './catalog.css'
import './book-management.css'

export const metadata: Metadata = {
  title: 'BookNook | A small online library',
  description: 'Share books with a community of readers, explore new arrivals, and manage your own library shelf at BookNook.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#f3f2fb',
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="light" data-scroll-behavior="smooth"><body className="antialiased"><SiteNavigation /><Toaster position="top-right" richColors closeButton theme="system" />{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
