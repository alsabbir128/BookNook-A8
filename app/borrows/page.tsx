import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { borrow } from '@/lib/db/schema'
import BorrowsView from '@/components/borrows-view'

export default async function BorrowsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const books = await db.select().from(borrow).where(eq(borrow.userId, session.user.id))
  return <BorrowsView initialBooks={books.map((book) => ({ ...book, borrowDate: String(book.borrowDate), returnDate: String(book.returnDate) }))} />
}
