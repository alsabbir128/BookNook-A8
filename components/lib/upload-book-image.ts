import { jwtFetch } from '@/lib/jwt-client'

export async function uploadBookImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.set('file', file)

  const response = await jwtFetch('/api/images', { method: 'POST', body: formData })
  const result = await response.json().catch(() => null) as { url?: unknown; error?: unknown } | null

  if (!response.ok) {
    throw new Error(typeof result?.error === 'string' ? result.error : 'Could not upload this image. Please try again.')
  }
  if (typeof result?.url !== 'string') throw new Error('The image upload could not be confirmed. Please try again.')

  return result.url
}
