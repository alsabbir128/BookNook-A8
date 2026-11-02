'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isSignUp = mode === 'sign-up'
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true)
    const result = isSignUp ? await authClient.signUp.email({ name, email, password }) : await authClient.signIn.email({ email, password })
    setLoading(false)
    if (result.error) { setError('We could not complete that request. Check your details and try again.'); return }
    router.push('/'); router.refresh()
  }
  return <form className="auth-form" onSubmit={submit}>
    {isSignUp && <label>Name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" /></label>}
    <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@gmail.com" /></label>
    <label>Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <button className="primary-button auth-submit" disabled={loading}>{loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Log in'}</button>
  </form>
}
