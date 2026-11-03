'use client'

import { useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'

type DeleteBookDialogProps = {
  book: { id: number; title: string } | null
  isDeleting: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteBookDialog({ book, isDeleting, error, onClose, onConfirm }: DeleteBookDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (book && !dialog.open) dialog.showModal()
    if (!book && dialog.open) dialog.close()
  }, [book])

  return (
    <dialog
      ref={dialogRef}
      className="book-management-dialog delete-book-dialog"
      aria-labelledby="delete-book-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close() }}
    >
      {book && <div className="dialog-content">
        <div className="dialog-icon danger-icon"><Trash2 size={19} /></div>
        <div className="eyebrow">Remove from library</div>
        <h2 id="delete-book-title">Delete this book?</h2>
        <p><strong>{book.title}</strong> will be removed from your shelf, New Arrivals, and the full collection.</p>
        {error && <p className="book-form-error" role="alert">{error}</p>}
        <div className="dialog-actions">
          <button type="button" className="secondary-action-button" disabled={isDeleting} onClick={onClose}>Keep book</button>
          <button type="button" className="danger-action-button" disabled={isDeleting} onClick={onConfirm}>{isDeleting ? 'Deleting…' : 'Delete book'}</button>
        </div>
      </div>}
    </dialog>
  )
}
