import { NextResponse } from 'next/server'
import { and, eq, gt, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getBookByTitle } from '@/lib/book-catalog'
import { db } from '@/lib/db'
import { borrow, bookInventory } from '@/lib/db/schema'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.id ?? null
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const databaseError = error as { code?: unknown; cause?: unknown }
  return databaseError.code === '23505' || isUniqueViolation(databaseError.cause)
}

function duplicateBorrowResponse() {
  return NextResponse.json({ error: 'You already borrowed this book', code: 'ALREADY_BORROWED' }, { status: 409 })
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const records = await db.select({
    id: borrow.id,
    title: borrow.title,
    author: borrow.author,
    image: borrow.image,
    borrowDate: borrow.borrowDate,
    returnDate: borrow.returnDate,
  }).from(borrow).where(eq(borrow.userId, userId))

  return NextResponse.json(records)
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as { title?: unknown } | null
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  const book = getBookByTitle(title)
  if (!book) return NextResponse.json({ error: 'Book not found', code: 'BOOK_NOT_FOUND' }, { status: 404 })

  const borrowedAt = new Date()
  const returnAt = new Date(borrowedAt)
  returnAt.setDate(returnAt.getDate() + 14)

  try {
    const result = await db.transaction(async (tx) => {
      const existing = await tx.select({ id: borrow.id }).from(borrow).where(and(
        eq(borrow.userId, userId),
        eq(borrow.title, book.title),
      )).limit(1)

      if (existing.length > 0) return { status: 'already-borrowed' as const }

      await tx.insert(bookInventory).values({ title: book.title, copies: book.copies }).onConflictDoNothing()

      const [inventory] = await tx.update(bookInventory)
        .set({ copies: sql`${bookInventory.copies} - 1` })
        .where(and(eq(bookInventory.title, book.title), gt(bookInventory.copies, 0)))
        .returning({ copies: bookInventory.copies })

      if (!inventory) return { status: 'unavailable' as const }

      const [record] = await tx.insert(borrow).values({
        userId,
        title: book.title,
        author: book.author,
        image: book.image,
        borrowDate: borrowedAt.toISOString().slice(0, 10),
        returnDate: returnAt.toISOString().slice(0, 10),
      }).returning({
        id: borrow.id,
        title: borrow.title,
        author: borrow.author,
        image: borrow.image,
        borrowDate: borrow.borrowDate,
        returnDate: borrow.returnDate,
      })

      return { status: 'borrowed' as const, record, copiesRemaining: inventory.copies }
    })

    if (result.status === 'already-borrowed') return duplicateBorrowResponse()
    if (result.status === 'unavailable') return NextResponse.json({ error: 'No copies are currently available', code: 'BOOK_UNAVAILABLE' }, { status: 409 })

    return NextResponse.json({ borrow: result.record, copiesRemaining: result.copiesRemaining }, { status: 201 })
  } catch (error) {
    if (isUniqueViolation(error)) return duplicateBorrowResponse()
    return NextResponse.json({ error: 'Unable to complete this borrow right now' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as { id?: unknown } | null
  const id = Number(body?.id)
  if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ error: 'Invalid borrow id' }, { status: 400 })

  const returnedTitle = await db.transaction(async (tx) => {
    const [record] = await tx.delete(borrow)
      .where(and(eq(borrow.id, id), eq(borrow.userId, userId)))
      .returning({ title: borrow.title })

    if (!record) return null

    await tx.insert(bookInventory)
      .values({ title: record.title, copies: 1 })
      .onConflictDoUpdate({
        target: bookInventory.title,
        set: { copies: sql`${bookInventory.copies} + 1` },
      })

    return record.title
  })

  if (!returnedTitle) return NextResponse.json({ error: 'Borrow not found', code: 'BORROW_NOT_FOUND' }, { status: 404 })
  return NextResponse.json({ ok: true, title: returnedTitle })
}
