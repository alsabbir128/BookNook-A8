'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, ChevronDown, Library, Menu, Moon, Sun, UserRound, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export default function SiteNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [failedImage, setFailedImage] = useState<string | null>(null)

  const userName = session?.user.name || session?.user.email || 'Reader'
  const imageUrl = session?.user.image || null
  const showImage = imageUrl && failedImage !== imageUrl

  function closeNavigation() {
    setMenuOpen(false)
    setProfileOpen(false)
  }

  function toggleTheme() {
    const nextTheme = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    document.documentElement.dataset.theme = nextTheme
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/" onClick={closeNavigation} aria-label="BookNook home">
          <span className="brand-mark"><Library size={18} strokeWidth={2.4} /></span>
          <span>Book<span className="brand-accent">Nook</span></span>
        </Link>

        <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} id="primary-navigation" aria-label="Primary navigation">
          <Link className={pathname === '/' ? 'active' : ''} aria-current={pathname === '/' ? 'page' : undefined} href="/" onClick={closeNavigation}>Home</Link>
          <Link className={pathname === '/all-books' ? 'active' : ''} aria-current={pathname === '/all-books' ? 'page' : undefined} href="/all-books" onClick={closeNavigation}>All books</Link>
          <Link href="/#how-it-works" onClick={closeNavigation}>How it works</Link>
          {session && <Link className={pathname === '/borrows' ? 'active' : ''} aria-current={pathname === '/borrows' ? 'page' : undefined} href="/borrows" onClick={closeNavigation}>My borrows</Link>}
        </nav>

        <div className="header-actions">
          <button className="icon-button theme-button" type="button" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isPending ? <span className="nav-session-placeholder" aria-hidden="true" /> : session ? (
            <div className="profile-wrap">
              <button className="profile-button" type="button" aria-label={`${userName} account menu`} aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)}>
                <span className="avatar" aria-hidden="true">
                  {showImage ? <img className="avatar-image" src={imageUrl} alt="" referrerPolicy="no-referrer" onError={() => setFailedImage(imageUrl)} /> : <UserRound className="avatar-fallback" size={16} />}
                </span>
                <span className="profile-name">{userName}</span>
                <ChevronDown size={15} />
              </button>
              {profileOpen && (
                <div className="profile-menu" aria-label="Account menu">
                  <strong>{userName}</strong>
                  {session.user.email && <span>{session.user.email}</span>}
                  <div className="profile-menu-divider" />
                  <Link href="/borrows" onClick={closeNavigation}>Borrowed books <ArrowRight size={14} /></Link>
                  <button type="button" onClick={async () => { await authClient.signOut(); closeNavigation(); router.refresh() }}>Log out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="guest-actions">
              <Link href="/sign-in">Log in</Link>
              <Link className="header-signup" href="/sign-up">Sign up</Link>
            </div>
          )}

          <button className="menu-button" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  )
}
