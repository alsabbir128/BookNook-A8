import BooknookHome from '@/components/booknook-home'
import { db } from '@/lib/db'
import { bookInventory } from '@/lib/db/schema'

export default async function Page() {
  const inventory = await db.select().from(bookInventory)
  return <BooknookHome initialCopies={Object.fromEntries(inventory.map((book) => [book.title, book.copies]))} />
}
