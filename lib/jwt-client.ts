'use client'

import useSWR from 'swr'

export const JWT_SESSION_KEY = 'booknook-jwt-session'

type JwtSessionUser = {
  id: string
  name: string
  email: string
  image: string | null
}

type AccessTokenResponse = {
  token: string
  expiresAt: number
  user: JwtSessionUser
}

type JwtSession = { user: JwtSessionUser }

let cachedAccessToken: AccessTokenResponse | null = null

function isAccessTokenResponse(value: unknown): value is AccessTokenResponse {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  const user = record.user
  if (!user || typeof user !== 'object') return false

  const userRecord = user as Record<string, unknown>
  return (
    typeof record.token === 'string' &&
    record.token.length > 0 &&
    typeof record.expiresAt === 'number' &&
    typeof userRecord.id === 'string' &&
    typeof userRecord.name === 'string' &&
    typeof userRecord.email === 'string' &&
    (typeof userRecord.image === 'string' || userRecord.image === null)
  )
}

async function getAccessTokenResponse(): Promise<AccessTokenResponse | null> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 15_000) return cachedAccessToken
  cachedAccessToken = null

  try {
    const response = await fetch('/api/auth/access-token', {
      cache: 'no-store',
      credentials: 'same-origin',
    })
    if (!response.ok) return null

    const value: unknown = await response.json()
    if (!isAccessTokenResponse(value) || value.expiresAt <= Date.now() + 5_000) return null

    cachedAccessToken = value
    return value
  } catch {
    return null
  }
}

export function clearJwtAccessToken() {
  cachedAccessToken = null
}

export async function getJwtAccessToken(): Promise<string | null> {
  return (await getAccessTokenResponse())?.token ?? null
}

export async function jwtFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = await getJwtAccessToken()
  const requestHeaders = new Headers(init.headers)
  if (token) requestHeaders.set('Authorization', `Bearer ${token}`)

  return fetch(input, {
    ...init,
    headers: requestHeaders,
    credentials: init.credentials ?? 'same-origin',
  })
}

async function fetchJwtSession(): Promise<JwtSession | null> {
  const accessToken = await getAccessTokenResponse()
  return accessToken ? { user: accessToken.user } : null
}

export function useJwtSession() {
  const { data, error, isLoading, mutate } = useSWR<JwtSession | null>(JWT_SESSION_KEY, fetchJwtSession, {
    shouldRetryOnError: false,
    revalidateOnFocus: true,
  })

  return { data: data ?? null, error, isPending: isLoading, mutate }
}
