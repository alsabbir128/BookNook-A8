'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Search, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { books } from '@/components/booknook-home'

export default function AllBooksPage() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const categories = ['All', ...Array.from(new Set(books.map((book) => book.category)))]
  const filteredBooks = useMemo(() => books.filter((book) => (category === 'All' || book.category === category) && `${book.title} ${book.author}`.toLowerCase().includes(query.toLowerCase())), [category, query])
  return <main className="catalog-page"><header className="catalog-header"><a className="catalog-brand" href="/"><span className="brand-mark">BN</span><span>Book<span className="brand-accent">Nook</span></span></a><a className="back-link" href="/"><ArrowLeft size={15} /> Back home</a></header><section className="catalog-intro"><div className="eyebrow">The complete shelf</div><h1>All books</h1><p>Take your time. There is always another story waiting.</p></section><section className="catalog-content"><div className="catalog-toolbar"><div className="category-bar" aria-label="Book categories">{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="catalog-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the full shelf" aria-label="Search all books" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}</div></div><div className="catalog-count">{filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} {category !== 'All' ? `in ${category}` : 'in the collection'}</div><div className="book-grid">{filteredBooks.map((book) => <article className="book-card" key={book.title}><div className="book-cover"><img src={book.image} alt={`${book.title} book cover`} /><span className="cover-tag" style={{ backgroundColor: book.accent }}>{book.category}</span></div><div className="book-info"><div><h3>{book.title}</h3><p>{book.author}</p><span className="availability">{book.copies} {book.copies === 1 ? 'copy' : 'copies'} in the library</span></div><button className="round-arrow" onClick={() => session ? router.push(`/?book=${encodeURIComponent(book.title)}`) : router.push('/sign-in')} aria-label={session ? `View ${book.title}` : `Log in to view ${book.title}`}><ArrowRight size={17} /></button></div></article>)}</div></section></main>
}
