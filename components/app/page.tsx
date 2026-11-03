import BooknookHome from '@/components/booknook-home'
import { getCatalogData } from '@/lib/book-data'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { catalogBooks, initialCopies } = await getCatalogData()
  return <BooknookHome catalogBooks={catalogBooks} initialCopies={initialCopies} />
}
