import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import AuthForm from '@/components/auth-form'
import { BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/')
  return <main className="auth-page"><Link className="auth-brand" href="/"><span className="brand-mark" aria-hidden="true"><BookOpen size={17} strokeWidth={2.2} /></span><span>Book<span className="brand-accent">Nook</span></span></Link><section className="auth-card"><div className="eyebrow">Your reading life</div><h1>Welcome back</h1><p>Log in to borrow books and keep your personal reading shelf.</p><AuthForm mode="sign-in" /><div className="auth-switch">New to BookNook? <Link href="/sign-up">Create an account</Link></div></section></main>
}
