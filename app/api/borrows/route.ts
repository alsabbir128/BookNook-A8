import { NextResponse } from 'next/server'
import { and, eq, gt, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { borrow, bookInventory } from '@/lib/db/schema'
import { headers } from 'next/headers'

const inventoryDefaults: Record<string, number> = { 'The Hobbit': 2, 'Pride and Prejudice': 4, 'The Midnight Library': 3, 'A Field Guide to Getting Lost': 2, 'Braiding Sweetgrass': 5, 'The Book of Delights': 2, 'Sea of Tranquility': 3, 'The Creative Act': 4, 'Tomorrow, and Tomorrow, and Tomorrow': 3, 'The Vanishing Half': 2, 'Atomic Habits': 6, 'Educated': 3, 'The Secret History': 2, 'The Alchemist': 5, 'Sapiens': 4, 'The Name of the Wind': 2, Circe: 3, 'Little Women': 4, 'The Song of Achilles': 2, 'The Thursday Murder Club': 3, 'Project Hail Mary': 4, 'A Gentleman in Moscow': 2, 'Station Eleven': 3, 'The Overstory': 2, 'On Earth We’re Briefly Gorgeous': 3, 'The Art of Rest': 2, 'The Anthropocene Reviewed': 3, Pachinko: 4, 'The Ocean at the End of the Lane': 2, 'The Four Agreements': 5, 'The House in the Cerulean Sea': 3, 'Howl’s Moving Castle': 4 }

async function getUserId() { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) return null; return session.user.id }
export async function GET() {
  const userId = await getUserId(); if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await db.select().from(borrow).where(eq(borrow.userId, userId)))
}
export async function POST(request: Request) {
  const userId = await getUserId(); if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json(); const title = String(body.title ?? ''); const initial = inventoryDefaults[title]
  if (!initial) return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  const existing = await db.select().from(bookInventory).where(eq(bookInventory.title, title))
  if (!existing.length) await db.insert(bookInventory).values({ title, copies: initial }).onConflictDoNothing()
  const updated = await db.update(bookInventory).set({ copies: sql`${bookInventory.copies} - 1` }).where(and(eq(bookInventory.title, title), gt(bookInventory.copies, 0))).returning({ copies: bookInventory.copies })
  if (!updated[0]) return NextResponse.json({ error: 'Unavailable' }, { status: 409 })
  const today = new Date(); const due = new Date(today); due.setDate(today.getDate() + 14)
  const [record] = await db.insert(borrow).values({ userId, title, author: String(body.author ?? ''), image: String(body.image ?? ''), borrowDate: today.toISOString().slice(0, 10), returnDate: due.toISOString().slice(0, 10) }).returning()
  return NextResponse.json(record)
}
export async function DELETE(request: Request) {
  const userId = await getUserId(); if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json(); const [record] = await db.delete(borrow).where(and(eq(borrow.id, Number(id)), eq(borrow.userId, userId))).returning()
  if (record) { const current = await db.select().from(bookInventory).where(eq(bookInventory.title, record.title)); if (current[0]) await db.update(bookInventory).set({ copies: current[0].copies + 1 }).where(eq(bookInventory.title, record.title)) }
  return NextResponse.json({ ok: true })
}
