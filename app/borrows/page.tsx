'use client'

import { useState } from 'react'
import { ArrowLeft, BookOpen, Check, Library, RotateCcw } from 'lucide-react'

type BorrowedBook = { title: string; author: string; image: string; borrowDate: string; returnDate: string }

export default function BorrowsPage() {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(window.sessionStorage.getItem('booknook-borrows') ?? '[]') } catch { return [] }
  })
  const returnBook = (title: string) => {
    const nextBooks = borrowedBooks.filter((book) => book.title !== title)
    const copies = JSON.parse(window.sessionStorage.getItem('booknook-copies') ?? '{}')
    copies[title] = (copies[title] ?? 0) + 1
    window.sessionStorage.setItem('booknook-copies', JSON.stringify(copies))
    setBorrowedBooks(nextBooks)
    window.sessionStorage.setItem('booknook-borrows', JSON.stringify(nextBooks))
  }
  const activeBooks = borrowedBooks

  return (
    <main className="borrows-page">
      <header className="borrows-header">
        <a className="borrows-brand" href="/" aria-label="Back to BookNook home"><span><Library size={17} /></span>Book<span>Nook</span></a>
        <a className="back-link" href="/"><ArrowLeft size={15} /> Back to library</a>
      </header>
      <section className="borrows-intro">
        <div className="borrows-eyebrow"><BookOpen size={13} /> Your reading life</div>
        <h1>My Borrows</h1>
        <p>Books you are reading right now.</p>
      </section>
      <section className="borrows-content" aria-labelledby="borrows-title">
        <div className="borrows-table-wrap">
          <div className="borrows-table-head"><span>Image</span><span>Title</span><span>Borrow Date</span><span>Return Date</span><span>Action</span></div>
          {activeBooks.length ? activeBooks.map((book) => (
            <div className="borrow-row" key={book.title}>
              <div className="borrow-cover" aria-label={`${book.title} cover`}><img src={book.image} alt={`${book.title} cover`} /></div>
              <div className="borrow-title"><strong>{book.title}</strong><small>{book.author}</small></div>
              <span>{book.borrowDate}</span>
              <span>{book.returnDate}</span>
              <button className="return-button" onClick={() => returnBook(book.title)}><RotateCcw size={12} /> Return Book</button>
            </div>
          )) : <div className="empty-borrows"><Check size={20} /><strong>All caught up.</strong><span>You have returned every book on your list.</span><a href="/">Browse the collection</a></div>}
        </div>
        <p className="borrow-note">You can keep each book for 14 days. Thank you for passing stories forward.</p>
      </section>
    </main>
  )
}
