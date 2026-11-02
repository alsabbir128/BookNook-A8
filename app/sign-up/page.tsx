import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import AuthForm from '@/components/auth-form'

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/')
  return <main className="auth-page"><Link className="auth-brand" href="/"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Va9uA9xUgRR8bmRkeQQJZOuKt08Jvf.png" alt="BookNook" /></Link><section className="auth-card"><div className="eyebrow">Join the library</div><h1>Make a little room</h1><p>Create an account to borrow, return, and keep track of your books.</p><AuthForm mode="sign-up" /><div className="auth-switch">Already a member? <Link href="/sign-in">Log in</Link></div></section></main>
}
