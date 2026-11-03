'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { ArrowRight, BookOpen, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import BookImageField from '@/components/book-image-field'
import { ADD_BOOK_CATEGORIES } from '@/lib/book-validation'
import { uploadBookImage } from '@/lib/upload-book-image'
import BookCoverImage from '@/components/book-cover-image'
import DeleteBookDialog from '@/components/delete-book-dialog'
import { jwtFetch } from '@/lib/jwt-client'

type ManagedBook = {
  id: number
  title: string
  author: string
  category: string
  image: string
  description: string
  totalCopies: number
  addedByName: string
  addedByEmail: string
  addedAt: string | Date
}

async function fetchMyBooks(url: string): Promise<ManagedBook[]> {
  const response = await jwtFetch(url)
  if (!response.ok) throw new Error('Could not load your books.')
  return response.json()
}

export default function MyBooksView({ initialBooks }: { initialBooks: ManagedBook[] }) {
  const { data: myBooks = initialBooks, error: listError, mutate } = useSWR<ManagedBook[]>('/api/books', fetchMyBooks, { fallbackData: initialBooks })
  const [editingBook, setEditingBook] = useState<ManagedBook | null>(null)
  const [deletingBook, setDeletingBook] = useState<ManagedBook | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function deleteBook() {
    if (!deletingBook || deletingId) return
    setDeletingId(deletingBook.id)
    setDeleteError(null)

    try {
      const response = await jwtFetch(`/api/books/${deletingBook.id}`, { method: 'DELETE' })
      const result = await response.json().catch(() => null) as { error?: string } | null
      if (!response.ok) throw new Error(result?.error ?? 'Could not delete this book.')

      await mutate((current) => (current ?? []).filter((book) => book.id !== deletingBook.id), { revalidate: false })
      toast.success('Book removed from the collection.')
      setDeletingBook(null)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Could not delete this book.'
      setDeleteError(message)
      toast.error(message)
    } finally {
      setDeletingId(null)
    }
  }

  async function updateBook(updatedBook: ManagedBook) {
    await mutate((current) => (current ?? []).map((book) => book.id === updatedBook.id ? updatedBook : book), { revalidate: false })
    setEditingBook(null)
  }

  return (
    <>
      <div className="managed-books-toolbar">
        <div>
          <span className="managed-books-count" role="status">{myBooks.length} {myBooks.length === 1 ? 'book' : 'books'} in your collection</span>
          <p>Only books you added are shown here.</p>
        </div>
        <Link className="primary-button" href="/add-book"><Plus size={16} /> Add a book</Link>
      </div>

      {listError && <p className="book-form-error" role="alert">We couldn&apos;t refresh your books. Showing the latest saved list.</p>}
      <div className="managed-books-table-wrap">
        {myBooks.length ? (
          <table className="managed-books-table">
            <thead><tr><th scope="col">Book</th><th scope="col">Category</th><th scope="col">Total copies</th><th scope="col">Actions</th></tr></thead>
            <tbody>
              {myBooks.map((book) => (
                <tr key={book.id}>
                  <td data-label="Book">
                    <div className="managed-book-cell">
                      <span className="managed-book-cover"><BookCoverImage src={book.image} fallbackSrc={book.image} alt={`${book.title} cover`} /></span>
                      <span className="managed-book-copy"><strong>{book.title}</strong><small>{book.author}</small></span>
                    </div>
                  </td>
                  <td data-label="Category"><span className="managed-book-category">{book.category}</span></td>
                  <td data-label="Total copies"><span className="managed-book-copies">{book.totalCopies} {book.totalCopies === 1 ? 'copy' : 'copies'}</span></td>
                  <td data-label="Actions">
                    <div className="managed-book-actions">
                      <button type="button" className="book-action-button" onClick={() => setEditingBook(book)} aria-label={`Edit ${book.title}`}><Pencil size={14} /> Edit</button>
                      <button type="button" className="book-action-button danger" onClick={() => { setDeletingBook(book); setDeleteError(null) }} aria-label={`Delete ${book.title}`}><Trash2 size={14} /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="managed-books-empty">
            <span className="managed-empty-icon"><BookOpen size={22} /></span>
            <h2>Your shelf is ready.</h2>
            <p>Add a book to share it with readers across the library.</p>
            <Link className="text-link" href="/add-book">Add your first book <ArrowRight size={15} /></Link>
          </div>
        )}
      </div>

      <EditBookDialog book={editingBook} onClose={() => setEditingBook(null)} onSaved={updateBook} />
      <DeleteBookDialog
        book={deletingBook}
        isDeleting={deletingId !== null}
        error={deleteError}
        onClose={() => { setDeletingBook(null); setDeleteError(null) }}
        onConfirm={deleteBook}
      />
    </>
  )
}

function EditBookDialog({ book, onClose, onSaved }: { book: ManagedBook | null; onClose: () => void; onSaved: (book: ManagedBook) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (book && !dialog.open) dialog.showModal()
    if (!book && dialog.open) dialog.close()
  }, [book])

  useEffect(() => {
    setCoverFile(null)
    setImageUrl('')
    setError(null)
  }, [book?.id])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!book || isSaving) return

    const formData = new FormData(event.currentTarget)
    setIsSaving(true)
    setError(null)

    try {
      const image = coverFile ? await uploadBookImage(coverFile) : imageUrl.trim() || book.image
      const response = await jwtFetch(`/api/books/${book.id}`, {
        method: 'PUT',
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
      const result = await response.json().catch(() => null) as (ManagedBook & { error?: string }) | null
      if (!response.ok || !result) throw new Error(result?.error ?? 'Could not save these changes.')

      toast.success('Book details updated.')
      onSaved(result)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Could not save these changes.'
      setError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const categories = book ? Array.from(new Set([...ADD_BOOK_CATEGORIES, book.category])) : ADD_BOOK_CATEGORIES

  return (
    <dialog
      ref={dialogRef}
      className="book-management-dialog edit-book-dialog"
      aria-labelledby="edit-book-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close() }}
    >
      {book && <div className="dialog-content">
        <div className="eyebrow">Your collection</div>
        <h2 id="edit-book-title">Edit book</h2>
        <p className="dialog-description">Update the details readers see on the shared shelf.</p>
        <form className="book-form edit-book-form" onSubmit={handleSubmit} key={book.id}>
          <label className="book-form-field">
            <span>Book title *</span>
            <input name="title" required maxLength={160} defaultValue={book.title} />
          </label>
          <label className="book-form-field">
            <span>Author name *</span>
            <input name="author" required maxLength={120} defaultValue={book.author} />
          </label>
          <div className="book-form-grid">
            <label className="book-form-field">
              <span>Category *</span>
              <select name="category" defaultValue={book.category} required>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label className="book-form-field">
              <span>Total copies *</span>
              <input name="totalCopies" type="number" min={1} max={100} defaultValue={book.totalCopies} required />
            </label>
          </div>
          <BookImageField file={coverFile} onFileChange={setCoverFile} currentImage={book.image} imageUrl={imageUrl} onImageUrlChange={setImageUrl} />
          <label className="book-form-field">
            <span>Short description *</span>
            <textarea name="description" required maxLength={1000} rows={4} defaultValue={book.description} />
          </label>
          {error && <p className="book-form-error" role="alert">{error}</p>}
          <div className="dialog-actions">
            <button type="button" className="secondary-action-button" disabled={isSaving} onClick={() => dialogRef.current?.close()}>Cancel</button>
            <button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? <><LoaderCircle size={15} className="spin" /> Saving…</> : 'Save changes'}</button>
          </div>
        </form>
      </div>}
    </dialog>
  )
}
