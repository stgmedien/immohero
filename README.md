# ImmoHero

Buchungsplattform für Immobilienmedien — Fotografie, Drohne, Video, 360°-Tour, Matterport, Grundrisse, Texte. In-House Fulfillment durch das ImmoHero-Team (Service-Gebiet OWL/NRW).

## Stack

- **Next.js 15** (App Router, TypeScript, RSC)
- **Neon Postgres** + **Drizzle ORM**
- **Auth.js v5** mit Resend Magic-Link
- **Stripe** Checkout + Webhooks
- **Resend** + React Email
- **Vercel Blob** für Asset-Storage
- **Tailwind CSS v4** mit Moss-Palette
- **PWA** (Serwist) für das Team-Studio

## Setup

```bash
pnpm install
cp .env.example .env.local         # Werte ausfüllen
pnpm db:push                       # Schema auf Neon pushen
pnpm db:seed                       # Services, Bundles, Shots, Admin
pnpm dev                           # http://localhost:3000
```

## Struktur

- `app/` — Routen (Marketing, /buchen, /konto, /studio, /admin)
- `components/` — UI-Primitive, Marketing-, Booking-, Studio-Bausteine
- `lib/` — DB, Auth, Stripe, Resend, Blob, Services, Shots
- `drizzle/` — Schema + Migrations + Seed
- `emails/` — React Email Templates
- `prototype/` — ursprünglicher Klick-Prototyp (Design-Referenz, nicht produktiv)

## Deploy

GitHub → Vercel (auto-deploy auf `main`). Domain `immohero.org` via Ionos DNS.

Vercel-Env-Vars müssen aus `.env.example` gespiegelt werden (inkl. Stripe-Webhook-Secret, Resend-API-Key, Neon-DATABASE_URL).
