'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Clock3,
  Library,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'

export type Book = {
  title: string
  author: string
  category: string
  description: string
  image: string
  accent: string
  year: string
  copies: number
}

const cover = (isbn: string) => `https://books.google.com/books/content?vid=ISBN:${isbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
export const books: Book[] = [
  ['The Hobbit', 'J.R.R. Tolkien', 'Fantasy', '1937', '9780261102217', '#709477', 'Bilbo Baggins leaves his quiet home for a quest with thirteen dwarves and a dragon at the end.', 2],
  ['Pride and Prejudice', 'Jane Austen', 'Classic', '1813', '9780141439518', '#b87c9e', 'A sharp, tender comedy of manners about first impressions, family, and finding an equal heart.', 4],
  ['The Midnight Library', 'Matt Haig', 'Fiction', '2020', '9780525559474', '#d97e51', 'Between life and death there is a library. Every book offers Nora a chance to try another life.', 3],
  ['A Field Guide to Getting Lost', 'Rebecca Solnit', 'Essays', '2005', '9780143037248', '#7097a8', 'A luminous exploration of the unknown and an invitation to find wonder in unfamiliar places.', 2],
  ['Braiding Sweetgrass', 'Robin Wall Kimmerer', 'Nature', '2013', '9781571313560', '#8b9c66', 'Plants and people are a story of reciprocity. This beautiful book asks us to listen again.', 5],
  ['The Book of Delights', 'Ross Gay', 'Poetry', '2019', '9781616208898', '#b87c9e', 'Small, bright observations that make a life feel larger, more generous, and more awake.', 2],
  ['Sea of Tranquility', 'Emily St. John Mandel', 'Fiction', '2022', '9781250776673', '#a07b54', 'A time-traveling fugue about art, history, and the patterns that bind one life to another.', 3],
  ['The Creative Act', 'Rick Rubin', 'Creativity', '2023', '9780593652886', '#c56f46', 'A quiet and practical meditation on the nature of making from a legendary producer.', 4],
  ['Tomorrow, and Tomorrow, and Tomorrow', 'Gabrielle Zevin', 'Fiction', '2022', '9780593321201', '#c76e54', 'Two friends build worlds together and discover the joy and cost of creating something lasting.', 3],
  ['The Vanishing Half', 'Brit Bennett', 'Fiction', '2020', '9780525536291', '#9270a0', 'A sweeping story of identity, family, and the secrets we inherit from the places we leave.', 2],
  ['Atomic Habits', 'James Clear', 'Nonfiction', '2018', '9780735211292', '#718c9f', 'An accessible guide to building good habits and breaking the ones that hold you back.', 6],
  ['Educated', 'Tara Westover', 'Memoir', '2018', '9780399590504', '#9a7c60', 'A memoir about education, family, and the fierce work of making a life of your own.', 3],
  ['The Secret History', 'Donna Tartt', 'Mystery', '1992', '9781400031702', '#9d754e', 'A close-knit group of classics students slip into a world of beauty, ritual, and dark consequence.', 2],
  ['The Alchemist', 'Paulo Coelho', 'Fiction', '1988', '9780062315007', '#c69955', 'A shepherd follows a dream across the desert and learns to listen for the language of the world.', 5],
  ['Sapiens', 'Yuval Noah Harari', 'History', '2011', '9780062316097', '#657f83', 'A concise history of humankind, from the first stories to the systems shaping our future.', 4],
  ['The Name of the Wind', 'Patrick Rothfuss', 'Fantasy', '2007', '9780756404741', '#8b6c9d', 'A gifted musician tells the story of how he became the most notorious wizard of his age.', 2],
  ['Circe', 'Madeline Miller', 'Mythology', '2018', '9780316556347', '#668d83', 'The story of a goddess who discovers her own power in a world ruled by gods and men.', 3],
  ['Little Women', 'Louisa May Alcott', 'Classic', '1868', '9780147514011', '#d48c6f', 'Four sisters grow up, make art, and choose their own definitions of a good and brave life.', 4],
  ['The Song of Achilles', 'Madeline Miller', 'Mythology', '2011', '9780062060624', '#718aa0', 'A tender retelling of the legendary bond between Achilles and Patroclus.', 2],
  ['The Thursday Murder Club', 'Richard Osman', 'Mystery', '2020', '9781984880963', '#b47f60', 'Four friends in a retirement village investigate a real murder with wit and persistence.', 3],
  ['Project Hail Mary', 'Andy Weir', 'Science Fiction', '2021', '9780593135204', '#5e8495', 'A lone astronaut wakes with a mission to save Earth and no memory of how he got there.', 4],
  ['A Gentleman in Moscow', 'Amor Towles', 'Historical', '2016', '9780143110439', '#a77d68', 'A count is sentenced to house arrest in a grand hotel and finds a world within its walls.', 2],
  ['Station Eleven', 'Emily St. John Mandel', 'Science Fiction', '2014', '9780804172448', '#8c8260', 'Art, memory, and survival intertwine after a pandemic reshapes the world.', 3],
  ['The Overstory', 'Richard Powers', 'Nature', '2018', '9780393635522', '#668b70', 'Nine strangers discover that the trees around them connect their lives in unexpected ways.', 2],
  ['On Earth We’re Briefly Gorgeous', 'Ocean Vuong', 'Memoir', '2019', '9780525562023', '#9a7898', 'A son writes to his mother about language, family, violence, and the beauty of being alive.', 3],
  ['The Art of Rest', 'Claudia Hammond', 'Wellness', '2019', '9780241373590', '#7c9a91', 'A thoughtful exploration of why rest matters and how we can make space for it.', 2],
  ['The Anthropocene Reviewed', 'John Green', 'Essays', '2021', '9780525555217', '#c17e69', 'A funny, tender collection of reviews of the human-centered world we have made.', 3],
  ['Pachinko', 'Min Jin Lee', 'Historical', '2017', '9781455563937', '#ae865d', 'A multigenerational saga about one family’s endurance, love, and belonging.', 4],
  ['The Ocean at the End of the Lane', 'Neil Gaiman', 'Fantasy', '2013', '9780062459368', '#617b9a', 'A haunting, beautiful novel about memory, childhood, and the small farm at the end of the lane.', 2],
  ['The Four Agreements', 'Don Miguel Ruiz', 'Wellness', '1997', '9781878424365', '#b99a59', 'Four simple principles offer a practical path to personal freedom and a kinder inner voice.', 5],
  ['The House in the Cerulean Sea', 'TJ Klune', 'Fantasy', '2020', '9781250217288', '#6d9990', 'A caseworker discovers a found family and a home that changes what he thought was possible.', 3],
  ['Howl’s Moving Castle', 'Diana Wynne Jones', 'Fantasy', '1986', '9780061478789', '#cb805b', 'A young hat-maker is cursed and finds an unlikely ally in a moving castle.', 4],
].map(([title, author, category, year, isbn, accent, description, copies]) => ({ title, author, category, year, accent, description, copies: copies as number, image: cover(isbn as string) }))

const slides = [
  { eyebrow: 'The quiet corner', title: 'A good book is a place to go.', copy: 'Borrow a little wonder. Discover thoughtful stories, curious ideas, and your next favorite read.', image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1800&q=85' },
  { eyebrow: 'Fresh on the shelf', title: 'Make room for new ideas.', copy: 'Our shelves change with the seasons. Find something unexpected among this week’s arrivals.', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1800&q=85' },
  { eyebrow: 'Read together', title: 'Stories are better shared.', copy: 'Join a small, generous community of readers and keep your personal shelf moving.', image: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=1800&q=85' },
]

export default function BooknookHome({ initialCopies = {} }: { initialCopies?: Record<string, number> }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [query, setQuery] = useState('')
  const [activeBook, setActiveBook] = useState<Book | null>(null)
  const router = useRouter()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [availableCopies, setAvailableCopies] = useState<Record<string, number>>(() => ({ ...Object.fromEntries(books.map((book) => [book.title, book.copies])), ...initialCopies }))
  const filteredBooks = useMemo(() => books.slice(0, 12).filter((book) => `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(query.toLowerCase())), [query])
  const borrowBook = async (book: Book) => {
    if (!session) { router.push('/sign-in'); return }
    const response = await fetch('/api/borrows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: book.title, author: book.author, image: book.image }) })
    if (response.ok) { setAvailableCopies((copies) => ({ ...copies, [book.title]: Math.max(0, (copies[book.title] ?? book.copies) - 1) })); setActiveBook(null); router.refresh() }
  }

  return (
    <div className={`booknook ${dark ? 'booknook-dark' : ''}`}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="BookNook home"><span className="brand-mark"><Library size={18} strokeWidth={2.4} /></span><span>Book<span className="brand-accent">Nook</span></span></a>
        <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`}>
          <a className="active" href="#top" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/all-books" onClick={() => setMenuOpen(false)}>All books</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          {session && <a href="/borrows" onClick={() => setMenuOpen(false)}>My borrows</a>}
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          {!sessionPending && (session ? <div className="profile-wrap">
            <button className="profile-button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}><span className="avatar">{session.user.name.slice(0, 2).toUpperCase()}</span><span className="profile-name">{session.user.name}</span><ChevronDown size={15} /></button>
            {profileOpen && <div className="profile-menu"><strong>{session.user.name}</strong><span>{session.user.email}</span><hr /><a href="#my-books">My shelf</a><a href="/borrows">Borrowed books</a><button onClick={async () => { await authClient.signOut(); router.refresh() }}>Log out</button></div>}
          </div> : <div className="guest-actions"><a href="/sign-in">Log in</a><a className="header-signup" href="/sign-up">Sign up</a></div>)}
          <button className="menu-button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main id="top">
        <section className="hero-wrap">
          <Swiper modules={[Autoplay, EffectFade, Pagination]} effect="fade" autoplay={{ delay: 5500, disableOnInteraction: false }} pagination={{ clickable: true }} loop className="hero-swiper">
            {slides.map((slide) => <SwiperSlide key={slide.title}><div className="hero-slide" style={{ backgroundImage: `linear-gradient(90deg, rgba(24,33,31,.9) 0%, rgba(24,33,31,.66) 42%, rgba(24,33,31,.08) 100%), url(${slide.image})` }}><div className="hero-content"><div className="eyebrow light"><Sparkles size={14} /> {slide.eyebrow}</div><h1>{slide.title}</h1><p>{slide.copy}</p><a href="#books" className="primary-button">Browse books <ArrowRight size={16} /></a></div></div></SwiperSlide>)}
          </Swiper>
        </section>

        <section className="section books-section" id="books">
          <div className="section-heading"><div><div className="eyebrow">Curated for you</div><h2>New arrivals</h2></div><a className="text-link" href="/all-books">See all books <ArrowRight size={16} /></a></div>
          <div className="book-grid">{filteredBooks.map((book) => { const copies = availableCopies[book.title] ?? 0; return <article className="book-card" key={book.title}><button className="book-cover" onClick={() => session ? setActiveBook(book) : router.push('/sign-in')} aria-label={session ? `View ${book.title}` : `Log in to view ${book.title}`}><img src={book.image} alt={`${book.title} book cover`} /><span className="cover-tag" style={{ backgroundColor: book.accent }}>{book.category}</span></button><div className="book-info"><div><h3>{book.title}</h3><p>{book.author}</p><span className={`availability ${copies === 0 ? 'sold-out' : ''}`}>{copies === 0 ? 'All copies borrowed' : `${copies} ${copies === 1 ? 'copy' : 'copies'} available`}</span></div><button className="round-arrow" onClick={() => session ? setActiveBook(book) : router.push('/sign-in')} aria-label={session ? `View details for ${book.title}` : `Log in to view ${book.title}`}><ArrowRight size={17} /></button></div></article>})}</div>
          <div className="search-row"><div className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, author, or category" aria-label="Search books" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}</div><span className="result-count">{filteredBooks.length} books on the shelf</span></div>
        </section>

        <section className="quote-section"><div className="quote-mark">“</div><blockquote>Books are a uniquely portable magic.</blockquote><cite>— Stephen King</cite></section>

        <section className="section how-section" id="how-it-works"><div className="section-heading"><div><div className="eyebrow">Simple by design</div><h2>Find. Borrow. Belong.</h2></div><p className="heading-copy">A library should feel like an invitation, not an errand.</p></div><div className="steps"><div className="step"><span className="step-number">01</span><BookOpen size={25} /><h3>Find your next read</h3><p>Browse our hand-picked shelves and follow your curiosity wherever it leads.</p></div><div className="step"><span className="step-number">02</span><Clock3 size={25} /><h3>Keep it for 14 days</h3><p>Borrow with ease and take your time. No pressure, just a little more room to read.</p></div><div className="step"><span className="step-number">03</span><Sparkles size={25} /><h3>Pass it forward</h3><p>Return your book when you’re ready so another reader can discover its magic.</p></div></div></section>

        {session && <section className="shelf-section" id="my-books"><div className="shelf-copy"><div className="eyebrow light">Your reading life</div><h2>There’s always<br /><em>another chapter.</em></h2><p>Keep track of what you’re reading, save books for later, and make your shelf feel like home.</p><a href="#books" className="secondary-button">Explore the collection <ArrowRight size={16} /></a></div><div className="borrowed-stack" aria-label="Borrowed books"><div className="borrowed-heading"><span>Currently borrowed</span><strong>3 books</strong></div><div className="shelf-stack"><div className="shelf-book book-one" title="The Midnight Library">READ<br />WIDELY</div><div className="shelf-book book-two" title="A Field Guide to Getting Lost">THE<br />WAY<br />HOME</div><div className="shelf-book book-three" title="Braiding Sweetgrass">SMALL<br />WONDERS</div><div className="shelf-book book-four" title="The Book of Delights">FIELD<br />NOTES</div></div><div className="borrowed-meta"><span>Due back in 8 days</span><a href="#books">Manage shelf <ArrowRight size={13} /></a></div></div></section>}
      </main>

      <footer className="site-footer"><div className="footer-contact-banner"><div><div className="eyebrow">Contact us</div><h2>Keep the conversation<br /><em>open.</em></h2></div><p>Have a book recommendation, a question, or just want to say hello? We&apos;d love to hear from you.</p></div><div className="footer-top"><div><a className="brand footer-brand" href="#top"><span className="brand-mark"><Library size={18} /></span>Book<span className="brand-accent">Nook</span></a><p className="footer-blurb">A small online library for<br />curious, generous readers.</p></div><div className="footer-column"><span>Explore</span><a href="/all-books">All books</a><a href="#how-it-works">How it works</a>{session && <a href="/borrows">My borrows</a>}</div><div className="footer-column"><span>Say hello</span><a className="footer-email" href="mailto:abdullahals128@gmail.com">abdullahals128@gmail.com</a><p>Mohakhali, Dhaka</p></div><div className="footer-social"><span>Follow along</span><div className="footer-social-links"><a className="social-link linkedin" href="https://www.linkedin.com/in/abdullah-al-sabbir-" target="_blank" rel="noreferrer" aria-label="LinkedIn"><strong>in</strong><small>LinkedIn</small></a><a className="social-link instagram" href="https://www.instagram.com/al_sabbir23" target="_blank" rel="noreferrer" aria-label="Instagram"><strong>◎</strong><small>Instagram</small></a></div></div></div><div className="footer-bottom"><span>© 2024 BookNook Library</span><span>Made for slow mornings & good stories.</span></div></footer>

      {activeBook && <div className="modal-backdrop" role="presentation" onClick={() => setActiveBook(null)}><div className="book-modal" role="dialog" aria-modal="true" aria-label={`${activeBook.title} details`} onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setActiveBook(null)} aria-label="Close"><X size={20} /></button><img src={activeBook.image} alt={`${activeBook.title} cover`} /><div className="modal-copy"><div className="eyebrow">{activeBook.category} · {activeBook.year}</div><h2>{activeBook.title}</h2><p className="modal-author">by {activeBook.author}</p><p>{activeBook.description}</p><div className="modal-availability">{(availableCopies[activeBook.title] ?? 0) > 0 ? `${availableCopies[activeBook.title]} ${availableCopies[activeBook.title] === 1 ? 'copy' : 'copies'} available` : 'All copies are currently borrowed'}</div><button className="primary-button" disabled={(availableCopies[activeBook.title] ?? 0) === 0} onClick={() => borrowBook(activeBook)}>{(availableCopies[activeBook.title] ?? 0) > 0 ? 'Borrow this book' : 'Unavailable'} <ArrowRight size={16} /></button></div></div></div>}
    </div>
  )
}
