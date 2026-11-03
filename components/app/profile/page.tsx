import Link from 'next/link'
import { ArrowRight, UserRound } from 'lucide-react'
import { requireJwtPrincipal } from '@/lib/jwt-server'

export const metadata = { title: 'My Profile | BookNook' }

export default async function ProfilePage() {
  const principal = await requireJwtPrincipal('/profile')

  return (
    <main className="book-management-page">
      <section className="catalog-intro">
        <div className="eyebrow">Your reading life</div>
        <h1>My profile</h1>
        <p>Your BookNook account details.</p>
      </section>
      <section className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar-large">
            {principal.image ? <img src={principal.image} alt={`${principal.name || 'Your'} profile`} /> : <UserRound size={28} aria-hidden="true" />}
          </div>
          <div>
            <span className="profile-card-label">Name</span>
            <strong>{principal.name || 'Reader'}</strong>
          </div>
          <div>
            <span className="profile-card-label">Email</span>
            <strong>{principal.email}</strong>
          </div>
          <Link className="primary-button" href="/my-books">Manage my books <ArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  )
}
