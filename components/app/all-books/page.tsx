import AllBooksPage from '@/components/all-books-page'
import { getCatalogData } from '@/lib/book-data'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { catalogBooks, initialCopies } = await getCatalogData()
  return <AllBooksPage catalogBooks={catalogBooks} initialCopies={initialCopies} />
}
