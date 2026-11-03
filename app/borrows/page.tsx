import { eq } from 'drizzle-orm'
import { requireJwtPrincipal } from '@/lib/jwt-server'
import { db } from '@/lib/db'
import { borrow } from '@/lib/db/schema'
import BorrowsView from '@/components/borrows-view'

export const dynamic = 'force-dynamic'

export default async function BorrowsPage() {
  const principal = await requireJwtPrincipal('/borrows')
  const books = await db.select().from(borrow).where(eq(borrow.userId, principal.userId))
  return <BorrowsView initialBooks={books.map((book) => ({ ...book, borrowDate: String(book.borrowDate), returnDate: String(book.returnDate) }))} />
}
