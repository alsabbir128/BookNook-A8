import AddBookForm from '@/components/add-book-form'
import { requireJwtPrincipal } from '@/lib/jwt-server'

export const metadata = { title: 'Add Book | BookNook' }

export default async function AddBookPage() {
  const principal = await requireJwtPrincipal('/add-book')

  return (
    <main className="book-management-page">
      <section className="catalog-intro">
        <div className="eyebrow">Share a story</div>
        <h1>Add a book</h1>
        <p>Make a little room on the shelf for another reader.</p>
      </section>
      <section className="book-management-content" aria-label="Add a book to the library">
        <AddBookForm userName={principal.name || principal.email} userEmail={principal.email} />
      </section>
    </main>
  )
}
