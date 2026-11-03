'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { BookOpen, Check, RotateCcw } from 'lucide-react'
import { books } from '@/lib/book-catalog'
import BookCoverImage from '@/components/book-cover-image'
import { jwtFetch } from '@/lib/jwt-client'

type BorrowedBook = { id: number; title: string; author: string; image: string; borrowDate: string; returnDate: string }

async function fetchBorrowedBooks(url: string): Promise<BorrowedBook[]> {
  const response = await jwtFetch(url)
  if (!response.ok) throw new Error('Could not load your borrowed books')
  return response.json()
}

export default function BorrowsView({ initialBooks }: { initialBooks: BorrowedBook[] }) {
  const { data: borrowedBooks = initialBooks, mutate } = useSWR<BorrowedBook[]>('/api/borrows', fetchBorrowedBooks, { fallbackData: initialBooks })
  const [returningId, setReturningId] = useState<number | null>(null)
  const [returnError, setReturnError] = useState<string | null>(null)

  async function returnBook(id: number) {
    if (returningId === id) return
    setReturningId(id)
    setReturnError(null)
    try {
      const response = await jwtFetch('/api/borrows', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string }
        setReturnError(result.error ?? 'Could not return this book. Please try again.')
        return
      }
      await mutate((current) => (current ?? []).filter((book) => book.id !== id), { revalidate: false })
    } catch {
      setReturnError('We could not connect to the library. Please try again.')
    } finally {
      setReturningId(null)
    }
  }

  return <main className="borrows-page"><section className="borrows-intro"><div className="borrows-eyebrow"><BookOpen size={13} /> Your reading life</div><h1>My Borrows</h1><p>Books you are reading right now.</p></section><section className="borrows-content" aria-labelledby="borrows-title">{returnError && <p className="borrow-error" role="status">{returnError}</p>}<div className="borrows-table-wrap"><div className="borrows-table-head"><span>Image</span><span>Title</span><span>Borrow Date</span><span>Return Date</span><span>Action</span></div>{borrowedBooks.length ? borrowedBooks.map((book) => <div className="borrow-row" key={book.id}><div className="borrow-cover"><BookCoverImage key={book.id} src={books.find((catalogBook) => catalogBook.title === book.title)?.image ?? book.image} fallbackSrc={books.find((catalogBook) => catalogBook.title === book.title)?.fallbackImage} alt={`${book.title} cover`} /></div><div className="borrow-title"><strong>{book.title}</strong><small>{book.author}</small></div><span>{new Date(`${book.borrowDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span><span>{new Date(`${book.returnDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span><button type="button" className="return-button" disabled={returningId === book.id} onClick={() => returnBook(book.id)}><RotateCcw size={12} /> {returningId === book.id ? 'Returning…' : 'Return Book'}</button></div>) : <div className="empty-borrows"><Check size={20} /><strong>All caught up.</strong><span>You have returned every book on your list.</span><Link href="/">Browse the collection</Link></div>}</div><p className="borrow-note">You can keep each book for 14 days. Thank you for passing stories forward.</p></section></main>
}
