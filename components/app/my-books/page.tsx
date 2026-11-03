import { desc, eq } from 'drizzle-orm'
import MyBooksView from '@/components/my-books-view'
import { requireJwtPrincipal } from '@/lib/jwt-server'
import { ensureLegacyBooksForUser } from '@/lib/book-data'
import { db } from '@/lib/db'
import { libraryBooks } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'My Books | BookNook' }

export default async function MyBooksPage() {
  const principal = await requireJwtPrincipal('/my-books')
  await ensureLegacyBooksForUser({ id: principal.userId, email: principal.email })
  const initialBooks = await db.select({
    id: libraryBooks.id,
    title: libraryBooks.title,
    author: libraryBooks.author,
    category: libraryBooks.category,
    image: libraryBooks.image,
    description: libraryBooks.description,
    totalCopies: libraryBooks.totalCopies,
    addedByName: libraryBooks.addedByName,
    addedByEmail: libraryBooks.addedByEmail,
    addedAt: libraryBooks.addedAt,
  }).from(libraryBooks)
    .where(eq(libraryBooks.userId, principal.userId))
    .orderBy(desc(libraryBooks.addedAt))

  const serializableBooks = initialBooks.map((book) => ({ ...book, addedAt: book.addedAt.toISOString() }))

  return (
    <main className="book-management-page">
      <section className="catalog-intro">
        <div className="eyebrow">Your collection</div>
        <h1>My books</h1>
        <p>Books you have shared with the BookNook community.</p>
      </section>
      <section className="book-management-content" aria-label="Books you have added">
        <MyBooksView initialBooks={serializableBooks} />
      </section>
    </main>
  )
}
