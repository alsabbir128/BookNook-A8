'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowRight, Search, X } from 'lucide-react'
import { jwtFetch, useJwtSession } from '@/lib/jwt-client'
import { books, type Book } from '@/lib/book-catalog'
import BookCoverImage from '@/components/book-cover-image'

type BorrowedBook = { id: number; title: string; author: string; image: string; borrowDate: string; returnDate: string }
type BorrowApiResult = { error?: string; code?: string; borrow?: BorrowedBook; copiesRemaining?: number }

async function fetchBorrowedBooks(url: string): Promise<BorrowedBook[]> {
  const response = await jwtFetch(url)
  if (!response.ok) throw new Error('Could not load your borrowed books')
  return response.json()
}

export default function AllBooksPage({ catalogBooks = books, initialCopies = {} }: { catalogBooks?: Book[]; initialCopies?: Record<string, number> }) {
  const router = useRouter()
  const { data: session, isPending: sessionPending } = useJwtSession()
  const { data: borrowedBooks = [], isLoading: borrowListLoading, mutate: mutateBorrowedBooks } = useSWR<BorrowedBook[]>(session?.user ? '/api/borrows' : null, fetchBorrowedBooks)
  const borrowedTitles = useMemo(() => new Set(borrowedBooks.map((borrowedBook) => borrowedBook.title)), [borrowedBooks])
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [activeBook, setActiveBook] = useState<Book | null>(null)
  const [borrowError, setBorrowError] = useState<string | null>(null)
  const [borrowingTitle, setBorrowingTitle] = useState<string | null>(null)
  const [availableCopies, setAvailableCopies] = useState<Record<string, number>>(() => ({ ...Object.fromEntries(catalogBooks.map((book) => [book.title, book.copies])), ...initialCopies }))
  const categories = ['All', ...Array.from(new Set(catalogBooks.map((book) => book.category)))]
  const filteredBooks = useMemo(() => catalogBooks.filter((book) => (category === 'All' || book.category === category) && `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(query.toLowerCase())), [catalogBooks, category, query])

  const borrowBook = async (book: Book) => {
    if (sessionPending || (session?.user && borrowListLoading) || borrowingTitle === book.title) return
    if (!session?.user) { router.push('/sign-in'); return }

    setBorrowError(null)
    setBorrowingTitle(book.title)
    try {
      const response = await jwtFetch('/api/borrows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: book.title }) })
      const result = await response.json().catch(() => ({})) as BorrowApiResult

      if (response.status === 409 && result.code === 'ALREADY_BORROWED') {
        setBorrowError('This book is already on your borrow list.')
        await mutateBorrowedBooks()
        return
      }
      if (!response.ok) {
        if (result.code === 'BOOK_UNAVAILABLE') setAvailableCopies((copies) => ({ ...copies, [book.title]: 0 }))
        setBorrowError(result.error ?? 'Unable to borrow this book right now.')
        return
      }
      if (!result.borrow || typeof result.copiesRemaining !== 'number') {
        setBorrowError('The borrow could not be confirmed. Please try again.')
        return
      }

      setAvailableCopies((copies) => ({ ...copies, [book.title]: result.copiesRemaining! }))
      await mutateBorrowedBooks((current) => [result.borrow!, ...(current ?? [])], { revalidate: false })
      setBorrowError(`${book.title} is on your shelf. You have 14 days to return it.`)
      router.refresh()
    } catch {
      setBorrowError('We could not connect to the library. Please try again.')
    } finally {
      setBorrowingTitle(null)
    }
  }

  const activeBookCopies = activeBook ? availableCopies[activeBook.title] ?? activeBook.copies : 0
  const activeBookIsBorrowed = activeBook ? borrowedTitles.has(activeBook.title) : false
  const activeBorrowPending = Boolean(activeBook && borrowingTitle === activeBook.title)
  const borrowStatusPending = Boolean(session?.user && borrowListLoading)

  return (
    <main className="catalog-page">
      <section className="catalog-intro">
        <div className="eyebrow">The complete shelf</div>
        <h1>All books</h1>
        <p>Take your time. There is always another story waiting.</p>
      </section>
      <section className="catalog-content">
        <div className="catalog-toolbar">
          <div className="category-bar" role="group" aria-label="Book categories">
            {categories.map((item) => <button key={item} type="button" className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <div className="catalog-search">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the full shelf" aria-label="Search all books" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}
          </div>
        </div>
        <div className="catalog-count">{filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} {category !== 'All' ? `in ${category}` : 'in the collection'}</div>
        {borrowError && <p className="borrow-error catalog-borrow-feedback" role="status">{borrowError}</p>}
        <div className="book-grid">
          {filteredBooks.map((book) => {
            const copies = availableCopies[book.title] ?? book.copies
            const alreadyBorrowed = borrowedTitles.has(book.title)
            const buttonLabel = alreadyBorrowed ? 'Already borrowed' : sessionPending ? 'Checking account…' : borrowStatusPending ? 'Checking status…' : borrowingTitle === book.title ? 'Borrowing…' : session?.user ? copies > 0 ? 'Borrow book' : 'Unavailable' : 'Sign in to borrow'
            const buttonDisabled = alreadyBorrowed || sessionPending || borrowStatusPending || borrowingTitle === book.title || copies <= 0

            return (
              <article className="book-card" key={book.title}>
                <div className="book-cover">
                  <BookCoverImage src={book.image} fallbackSrc={book.fallbackImage} alt={`${book.title} book cover`} />
                  <span className="cover-tag" style={{ backgroundColor: book.accent }}>{book.category}</span>
                </div>
                <div className="book-info catalog-book-info">
                  <div className="catalog-book-details">
                    <div>
                      <h3>{book.title}</h3>
                      <p>{book.author}</p>
                      <p className="book-owner-preview">Added by {book.addedByName} · {book.addedByEmail}</p>
                      <span className={`availability ${copies === 0 ? 'sold-out' : ''}`}>{alreadyBorrowed ? 'Already borrowed' : copies === 0 ? 'All copies borrowed' : `${copies} ${copies === 1 ? 'copy' : 'copies'} available`}</span>
                    </div>
                    <button type="button" className="round-arrow" onClick={() => { setBorrowError(null); setActiveBook(book) }} aria-label={`View details for ${book.title}`}><ArrowRight size={17} /></button>
                  </div>
                  <button type="button" className="catalog-borrow-button" disabled={buttonDisabled} onClick={() => borrowBook(book)}>{buttonLabel}</button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
      {activeBook && <div className="modal-backdrop" role="presentation" onClick={() => setActiveBook(null)}>
        <div className="book-modal" role="dialog" aria-modal="true" aria-label={`${activeBook.title} details`} onClick={(event) => event.stopPropagation()}>
          <button type="button" className="modal-close" onClick={() => setActiveBook(null)} aria-label="Close details"><X size={20} /></button>
          <BookCoverImage key={activeBook.title} src={activeBook.image} fallbackSrc={activeBook.fallbackImage} alt={`${activeBook.title} cover`} loading="eager" />
          <div className="modal-copy">
            <div className="eyebrow">{activeBook.category}{activeBook.year ? ` · ${activeBook.year}` : ''}</div>
            <h2>{activeBook.title}</h2>
            <p className="modal-author">by {activeBook.author}</p>
            <p>{activeBook.description}</p>
            <div className="book-added-by"><span>Added by</span><strong>{activeBook.addedByName}</strong><span>{activeBook.addedByEmail}</span>{activeBook.addedAt && <time dateTime={activeBook.addedAt}>Added {new Date(activeBook.addedAt).toLocaleDateString()}</time>}</div>
            <div className="modal-availability">{activeBookIsBorrowed ? 'Already borrowed' : activeBookCopies > 0 ? `${activeBookCopies} ${activeBookCopies === 1 ? 'copy' : 'copies'} available` : 'All copies are currently borrowed'}</div>
            {borrowError && <p className="borrow-error" role="status">{borrowError}</p>}
            <button type="button" className="primary-button" disabled={activeBookIsBorrowed || sessionPending || borrowStatusPending || activeBorrowPending || activeBookCopies === 0} onClick={() => borrowBook(activeBook)}>{activeBookIsBorrowed ? 'Already borrowed' : sessionPending ? 'Checking sign-in…' : borrowStatusPending ? 'Checking status…' : activeBorrowPending ? 'Borrowing…' : session?.user ? activeBookCopies > 0 ? 'Borrow this book' : 'Unavailable' : 'Sign in to borrow'} <ArrowRight size={16} /></button>
          </div>
        </div>
      </div>}
    </main>
  )
}
