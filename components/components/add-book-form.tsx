'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import BookImageField from '@/components/book-image-field'
import { ADD_BOOK_CATEGORIES } from '@/lib/book-validation'
import { uploadBookImage } from '@/lib/upload-book-image'
import { jwtFetch } from '@/lib/jwt-client'

type AddBookFormProps = { userName: string; userEmail: string }

export default function AddBookForm({ userName, userEmail }: AddBookFormProps) {
  const router = useRouter()
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const form = event.currentTarget
    const formData = new FormData(form)
    if (!coverFile && !imageUrl.trim()) {
      setError('Upload a cover image or paste a hosted HTTPS image URL.')
      return
    }
    if (coverFile && coverFile.size > 5 * 1024 * 1024) {
      setError('The cover image must be 5 MB or smaller.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const image = coverFile ? await uploadBookImage(coverFile) : imageUrl.trim()
      const response = await jwtFetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          author: formData.get('author'),
          category: formData.get('category'),
          totalCopies: Number(formData.get('totalCopies')),
          description: formData.get('description'),
          image,
        }),
      })
      const result = await response.json().catch(() => null) as { error?: string } | null
      if (!response.ok) throw new Error(result?.error ?? 'Could not add this book. Please try again.')

      toast.success('Your book is now on the shared shelf.')
      form.reset()
      setCoverFile(null)
      setImageUrl('')
      router.push('/my-books')
      router.refresh()
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Could not add this book. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="book-form-card">
      <div className="book-form-heading">
        <div>
          <div className="eyebrow">A few details</div>
          <h2>Book details</h2>
        </div>
        <p>Your book will appear in New Arrivals and the full collection.</p>
      </div>
      <form className="book-form" onSubmit={handleSubmit}>
        <div className="book-form-grid">
          <label className="book-form-field">
            <span>Book title <b aria-hidden="true">*</b></span>
            <input name="title" required maxLength={160} placeholder="The book title" autoComplete="off" />
          </label>
          <label className="book-form-field">
            <span>Author name <b aria-hidden="true">*</b></span>
            <input name="author" required maxLength={120} placeholder="Author name" autoComplete="name" />
          </label>
          <label className="book-form-field">
            <span>Category <b aria-hidden="true">*</b></span>
            <select name="category" defaultValue="Fiction" required>
              {ADD_BOOK_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="book-form-field">
            <span>Total copies <b aria-hidden="true">*</b></span>
            <input name="totalCopies" type="number" min={1} max={100} defaultValue={4} required />
          </label>
          <div className="book-form-field book-form-wide">
            <BookImageField file={coverFile} onFileChange={setCoverFile} imageUrl={imageUrl} onImageUrlChange={setImageUrl} required />
          </div>
          <label className="book-form-field book-form-wide">
            <span>Short description <b aria-hidden="true">*</b></span>
            <textarea name="description" required maxLength={1000} rows={4} placeholder="What makes this book worth sharing?" />
          </label>
        </div>

        <div className="book-owner-fields">
          <div className="eyebrow">Added by</div>
          <div className="book-form-grid">
            <label className="book-form-field">
              <span>Your name</span>
              <input name="addedByName" value={userName} readOnly aria-readonly="true" />
            </label>
            <label className="book-form-field">
              <span>Your email</span>
              <input name="addedByEmail" value={userEmail} readOnly aria-readonly="true" />
            </label>
          </div>
        </div>

        {error && <p className="book-form-error" role="alert">{error}</p>}
        <div className="book-form-actions">
          <span>Fields marked with * are required.</span>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><LoaderCircle size={16} className="spin" /> Adding book…</> : <>Add Book <ArrowRight size={16} /></>}
          </button>
        </div>
      </form>
    </div>
  )
}
