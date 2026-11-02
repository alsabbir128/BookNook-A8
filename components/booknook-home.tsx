'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import { ArrowRight, BookOpen, Clock3, Library, Search, Sparkles, X } from 'lucide-react'
import { books, type Book } from '@/lib/book-catalog'
import BookCoverImage from '@/components/book-cover-image'

type BorrowedBook = { id: number; title: string; author: string; image: string; borrowDate: string; returnDate: string }
type BorrowApiResult = { error?: string; code?: string; borrow?: BorrowedBook; copiesRemaining?: number }

async function fetchBorrowedBooks(url: string): Promise<BorrowedBook[]> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Could not load your borrowed books')
  return response.json()
}

const slides = [
  { eyebrow: 'The quiet corner', title: 'A good book is a place to go.', copy: 'Borrow a little wonder. Discover thoughtful stories, curious ideas, and your next favorite read.', image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1800&q=85' },
  { eyebrow: 'Fresh on the shelf', title: 'Make room for new ideas.', copy: 'Our shelves change with the seasons. Find something unexpected among this week’s arrivals.', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1800&q=85' },
  { eyebrow: 'Read together', title: 'Stories are better shared.', copy: 'Join a small, generous community of readers and keep your personal shelf moving.', image: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=1800&q=85' },
]

export default function BooknookHome({ initialCopies = {} }: { initialCopies?: Record<string, number> }) {
  const [query, setQuery] = useState('')
  const [activeBook, setActiveBook] = useState<Book | null>(null)
  const [borrowError, setBorrowError] = useState<string | null>(null)
  const [borrowingTitle, setBorrowingTitle] = useState<string | null>(null)
  const router = useRouter()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const { data: borrowedBooks = [], isLoading: borrowListLoading, mutate: mutateBorrowedBooks } = useSWR<BorrowedBook[]>(session?.user ? '/api/borrows' : null, fetchBorrowedBooks)
  const borrowedTitles = useMemo(() => new Set(borrowedBooks.map((borrowedBook) => borrowedBook.title)), [borrowedBooks])
  const [availableCopies, setAvailableCopies] = useState<Record<string, number>>(() => ({ ...Object.fromEntries(books.map((book) => [book.title, book.copies])), ...initialCopies }))
  const filteredBooks = useMemo(() => books.slice(0, 12).filter((book) => `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(query.toLowerCase())), [query])

  const borrowBook = async (book: Book) => {
    if (sessionPending || borrowingTitle === book.title || borrowListLoading) return
    if (!session?.user) { router.push('/sign-in'); return }

    setBorrowError(null)
    setBorrowingTitle(book.title)
    try {
      const response = await fetch('/api/borrows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: book.title }) })
      const result = await response.json().catch(() => ({})) as BorrowApiResult

      if (response.status === 409 && result.code === 'ALREADY_BORROWED') {
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
      router.refresh()
    } catch {
      setBorrowError('We could not connect to the library. Please try again.')
    } finally {
      setBorrowingTitle(null)
    }
  }

  return (
    <div className="booknook">
      <main id="top">
        <section className="hero-wrap">
          <Swiper modules={[Autoplay, EffectFade, Pagination]} effect="fade" autoplay={{ delay: 5500, disableOnInteraction: false }} pagination={{ clickable: true }} loop className="hero-swiper">
            {slides.map((slide) => <SwiperSlide key={slide.title}><div className="hero-slide" style={{ backgroundImage: `linear-gradient(90deg, rgba(24,33,31,.9) 0%, rgba(24,33,31,.66) 42%, rgba(24,33,31,.08) 100%), url(${slide.image})` }}><div className="hero-content"><div className="eyebrow light"><Sparkles size={14} /> {slide.eyebrow}</div><h1>{slide.title}</h1><p>{slide.copy}</p><a href="#books" className="primary-button">Browse books <ArrowRight size={16} /></a></div></div></SwiperSlide>)}
          </Swiper>
        </section>

        <section className="section books-section" id="books">
          <div className="section-heading"><div><div className="eyebrow">Curated for you</div><h2>New arrivals</h2></div><Link className="text-link" href="/all-books">See all books <ArrowRight size={16} /></Link></div>
          <div className="book-grid">{filteredBooks.map((book) => {
            const copies = availableCopies[book.title] ?? 0
            const alreadyBorrowed = borrowedTitles.has(book.title)
            return <article className="book-card" key={book.title}>
              <button className="book-cover" onClick={() => { setBorrowError(null); setActiveBook(book) }} aria-label={`View ${book.title} details`}>
                <BookCoverImage src={book.image} fallbackSrc={book.fallbackImage} alt={`${book.title} book cover`} />
                <span className="cover-tag" style={{ backgroundColor: book.accent }}>{book.category}</span>
              </button>
              <div className="book-info">
                <div>
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                  <span className={`availability ${copies === 0 ? 'sold-out' : ''}`}>{alreadyBorrowed ? 'Already borrowed' : copies === 0 ? 'All copies borrowed' : `${copies} ${copies === 1 ? 'copy' : 'copies'} available`}</span>
                </div>
                <button className="round-arrow" onClick={() => { setBorrowError(null); setActiveBook(book) }} aria-label={`View details for ${book.title}`}><ArrowRight size={17} /></button>
              </div>
            </article>
          })}</div>
          <div className="search-row"><div className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, author, or category" aria-label="Search books" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}</div><span className="result-count">{filteredBooks.length} books on the shelf</span></div>
        </section>

        <section className="quote-section"><div className="quote-mark">“</div><blockquote>Books are a uniquely portable magic.</blockquote><cite>— Stephen King</cite></section>

        <section className="section how-section" id="how-it-works"><div className="section-heading"><div><div className="eyebrow">Simple by design</div><h2>Find. Borrow. Belong.</h2></div><p className="heading-copy">A library should feel like an invitation, not an errand.</p></div><div className="steps"><div className="step"><span className="step-number">01</span><BookOpen size={25} /><h3>Find your next read</h3><p>Browse our hand-picked shelves and follow your curiosity wherever it leads.</p></div><div className="step"><span className="step-number">02</span><Clock3 size={25} /><h3>Keep it for 14 days</h3><p>Borrow with ease and take your time. No pressure, just a little more room to read.</p></div><div className="step"><span className="step-number">03</span><Sparkles size={25} /><h3>Pass it forward</h3><p>Return your book when you’re ready so another reader can discover its magic.</p></div></div></section>

        {session?.user && <section className="shelf-section" id="my-books"><div className="shelf-copy"><div className="eyebrow light">Your reading life</div><h2>There’s always<br /><em>another chapter.</em></h2><p>Keep track of what you’re reading, save books for later, and make your shelf feel like home.</p><a href="#books" className="secondary-button">Explore the collection <ArrowRight size={16} /></a></div><div className="borrowed-stack" aria-label="Borrowed books"><div className="borrowed-heading"><span>Currently borrowed</span><strong>{borrowListLoading ? 'Loading…' : `${borrowedBooks.length} ${borrowedBooks.length === 1 ? 'book' : 'books'}`}</strong></div><div className="shelf-stack">{borrowedBooks.length ? borrowedBooks.slice(0, 4).map((borrowedBook, index) => { const catalogBook = books.find((book) => book.title === borrowedBook.title); return <div className={`shelf-book ${['book-one', 'book-two', 'book-three', 'book-four'][index % 4] ?? 'book-one'}`} key={borrowedBook.id} title={borrowedBook.title} role="img" aria-label={borrowedBook.title}><BookCoverImage src={catalogBook?.image ?? borrowedBook.image} fallbackSrc={catalogBook?.fallbackImage} alt="" /></div> }) : <div className="shelf-empty" role="status">{borrowListLoading ? 'Loading your shelf…' : 'Your next story is waiting.'}</div>}</div><div className="borrowed-meta"><span>{borrowedBooks.length ? 'See due dates in your borrow list' : 'Ready for a new read'}</span><Link href="/borrows">Manage shelf <ArrowRight size={13} /></Link></div></div></section>}
      </main>

      <footer className="site-footer"><div className="footer-contact-banner"><div><div className="eyebrow">Contact us</div><h2>Keep the conversation<br /><em>open.</em></h2></div><p>Have a book recommendation, a question, or just want to say hello? We&apos;d love to hear from you.</p></div><div className="footer-top"><div><a className="brand footer-brand" href="#top"><span className="brand-mark"><Library size={18} /></span>Book<span className="brand-accent">Nook</span></a><p className="footer-blurb">A small online library for<br />curious, generous readers.</p></div><div className="footer-column"><span>Explore</span><Link href="/all-books">All books</Link><a href="#how-it-works">How it works</a>{session && <Link href="/borrows">My borrows</Link>}</div><div className="footer-column"><span>Say hello</span><a className="footer-email" href="mailto:abdullahals128@gmail.com">abdullahals128@gmail.com</a><p>Mohakhali, Dhaka</p></div><div className="footer-social"><span>Follow along</span><div className="footer-social-links"><a className="social-link linkedin" href="https://www.linkedin.com/in/abdullah-al-sabbir-" target="_blank" rel="noreferrer" aria-label="LinkedIn"><strong>in</strong><small>LinkedIn</small></a><a className="social-link instagram" href="https://www.instagram.com/al_sabbir23" target="_blank" rel="noreferrer" aria-label="Instagram"><strong>◎</strong><small>Instagram</small></a></div></div></div><div className="footer-bottom"><span>© 2024 BookNook Library</span><span>Made for slow mornings & good stories.</span></div></footer>

      {activeBook && <div className="modal-backdrop" role="presentation" onClick={() => setActiveBook(null)}><div className="book-modal" role="dialog" aria-modal="true" aria-label={`${activeBook.title} details`} onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setActiveBook(null)} aria-label="Close"><X size={20} /></button><BookCoverImage key={activeBook.title} src={activeBook.image} fallbackSrc={activeBook.fallbackImage} alt={`${activeBook.title} cover`} loading="eager" /><div className="modal-copy"><div className="eyebrow">{activeBook.category} · {activeBook.year}</div><h2>{activeBook.title}</h2><p className="modal-author">by {activeBook.author}</p><p>{activeBook.description}</p><div className="modal-availability">{borrowedTitles.has(activeBook.title) ? 'Already borrowed' : (availableCopies[activeBook.title] ?? 0) > 0 ? `${availableCopies[activeBook.title]} ${availableCopies[activeBook.title] === 1 ? 'copy' : 'copies'} available` : 'All copies are currently borrowed'}</div>{borrowError && <p className="borrow-error" role="status">{borrowError}</p>}<button className="primary-button" disabled={sessionPending || (Boolean(session?.user) && borrowListLoading) || borrowingTitle === activeBook.title || borrowedTitles.has(activeBook.title) || (availableCopies[activeBook.title] ?? 0) === 0} onClick={() => borrowBook(activeBook)}>{borrowedTitles.has(activeBook.title) ? 'Already borrowed' : sessionPending ? 'Checking sign-in…' : !session?.user ? 'Sign in to borrow' : borrowingTitle === activeBook.title ? 'Borrowing…' : (availableCopies[activeBook.title] ?? 0) > 0 ? 'Borrow this book' : 'Unavailable'} <ArrowRight size={16} /></button></div></div></div>}
    </div>
  )
}
