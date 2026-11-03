'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, Library, Menu, Moon, Sun, UserRound, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { clearJwtAccessToken, useJwtSession } from '@/lib/jwt-client'

export default function SiteNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending, mutate: mutateJwtSession } = useJwtSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
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

  async function logout() {
    clearJwtAccessToken()
    await Promise.allSettled([
      fetch('/api/auth/access-token', { method: 'DELETE', cache: 'no-store' }),
      authClient.signOut(),
    ])
    await mutateJwtSession(null, { revalidate: false })
    closeNavigation()
    router.replace('/')
    router.refresh()
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
          <Link className={pathname === '/all-books' ? 'active' : ''} aria-current={pathname === '/all-books' ? 'page' : undefined} href="/all-books" onClick={closeNavigation}>All Books</Link>
          {session && <>
            <Link className={pathname === '/add-book' ? 'active' : ''} aria-current={pathname === '/add-book' ? 'page' : undefined} href="/add-book" onClick={closeNavigation}>Add Book</Link>
            <Link className={pathname === '/my-books' ? 'active' : ''} aria-current={pathname === '/my-books' ? 'page' : undefined} href="/my-books" onClick={closeNavigation}>My Books</Link>
            <Link className={pathname === '/borrows' ? 'active' : ''} aria-current={pathname === '/borrows' ? 'page' : undefined} href="/borrows" onClick={closeNavigation}>My Borrows</Link>
          </>}
        </nav>

        <div className="header-actions">
          <button className="icon-button theme-button" type="button" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isPending ? <span className="nav-session-placeholder" aria-hidden="true" /> : session ? (
            <div className="profile-wrap" onKeyDown={(event) => { if (event.key === 'Escape') setProfileOpen(false) }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setProfileOpen(false) }}>
              <button className="profile-button" type="button" aria-label={`${userName} account menu`} aria-haspopup="menu" aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)}>
                <span className="avatar" aria-hidden="true">
                  {showImage ? <img className="avatar-image" src={imageUrl} alt="" referrerPolicy="no-referrer" onError={() => setFailedImage(imageUrl)} /> : <UserRound className="avatar-fallback" size={16} />}
                </span>
                <span className="profile-name">{userName}</span>
                <ChevronDown size={15} />
              </button>
              {profileOpen && (
                <div className="profile-menu" role="menu" aria-label="Account menu">
                  <strong>{userName}</strong>
                  {session.user.email && <span>{session.user.email}</span>}
                  <div className="profile-menu-divider" />
                  <Link role="menuitem" href="/profile" onClick={closeNavigation}>My Profile</Link>
                  <button role="menuitem" type="button" onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="guest-actions">
              <Link href="/sign-in">Login</Link>
              <Link className="header-signup" href="/sign-up">Register</Link>
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
