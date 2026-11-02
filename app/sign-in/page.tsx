import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import AuthForm from '@/components/auth-form'

export const dynamic = 'force-dynamic'

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/')
  return <main className="auth-page"><Link className="auth-brand" href="/"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Va9uA9xUgRR8bmRkeQQJZOuKt08Jvf.png" alt="BookNook" /></Link><section className="auth-card"><div className="eyebrow">Your reading life</div><h1>Welcome back</h1><p>Log in to borrow books and keep your personal reading shelf.</p><AuthForm mode="sign-in" /><div className="auth-switch">New to BookNook? <Link href="/sign-up">Create an account</Link></div></section></main>
}
