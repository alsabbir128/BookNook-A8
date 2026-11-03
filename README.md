# BookNook

A small online library for curious, generous readers. BookNook lets visitors discover books, while registered readers can add titles, borrow copies, and manage returns from one calm, editorial-style interface.

**Live site:** https://booklog-ai.vercel.app/

## Features

- Browse a curated New Arrivals shelf and the complete catalog at `/all-books`.
- Search the full collection and filter books by category.
- Create an account and sign in with Better Auth using email and password.
- Add books with title, author, category, cover image, description, and available copy count.
- Borrow available books, view active borrows, and return books from My Borrows.
- Protected routes send signed-out visitors to the sign-in page before showing private book details.
- Responsive light and night themes with accessible contrast, subtle hover states, and reduced-motion support.
- Footer contact area includes email, Mohakhali, Dhaka, LinkedIn, and Instagram links.

## Tech stack

- Next.js 16 App Router and React 19
- TypeScript
- Better Auth
- Neon Postgres with Drizzle ORM
- Swiper.js for the home slider
- Lucide React icons
- Vercel deployment

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment variables

Create `.env.local` with the database and authentication values used by the deployment:

```env
DATABASE_URL=your_neon_database_url
BETTER_AUTH_SECRET=your_auth_secret
```

## Available routes

- `/` — Home and New Arrivals
- `/all-books` — Searchable, category-filtered catalog
- `/sign-in` — Login
- `/sign-up` — Registration
- `/borrows` — Private borrowed-books view

## Scripts

- `pnpm dev` — Start the development server
- `pnpm build` — Create a production build
- `pnpm start` — Start the production server
