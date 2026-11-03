import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import AuthForm from '@/components/auth-form'
import { BookOpen } from 'lucide-react'
import { getJwtPrincipalFromCookie } from '@/lib/jwt-server'

export const dynamic = 'force-dynamic'

export default async function SignUpPage() {
  const principal = await getJwtPrincipalFromCookie()
  if (principal) redirect('/')

  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/api/auth/access-token?returnTo=%2F')
  return <main className="auth-page"><Link className="auth-brand" href="/"><span className="brand-mark" aria-hidden="true"><BookOpen size={17} strokeWidth={2.2} /></span><span>Book<span className="brand-accent">Nook</span></span></Link><section className="auth-card"><div className="eyebrow">Join the library</div><h1>Make a little room</h1><p>Create an account to borrow, return, and keep track of your books.</p><AuthForm mode="sign-up" /><div className="auth-switch">Already a member? <Link href="/sign-in">Log in</Link></div></section></main>
}
