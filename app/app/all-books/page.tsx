import AllBooksPage from '@/components/all-books-page'
import { db } from '@/lib/db'
import { bookInventory } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const inventory = await db.select().from(bookInventory)
  return <AllBooksPage initialCopies={Object.fromEntries(inventory.map((book) => [book.title, book.copies]))} />
}
