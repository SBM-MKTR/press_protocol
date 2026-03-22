# Press Protocol

Press Protocol is a Telegram Mini App on TON for pay-to-read journalism.

Readers unlock articles with a TON wallet, payments are verified against TON testnet, and article access is persisted by wallet address. The current MVP is focused on one thing judges can actually test end to end: open an article, inspect the contributor economics, pay, and see the article unlock only after confirmed settlement.

## What is real today

- Telegram Mini App-aware frontend built with Next.js
- TonConnect wallet handoff from the article page
- DB-backed articles, contributors, readership metrics, payment attempts, confirmed payments, and unlock grants
- Dynamic pricing tiers based on readership
- TON/x402-style payment verification and settlement on testnet
- Persistent unlock restoration after refresh or wallet reconnect

## What is not fully real yet

- Atomic on-chain split settlement to every contributor
- Contributor publishing workflow
- Journalist earnings dashboard

Contributor roles and target split percentages are modeled and shown in the app today. The multi-recipient on-chain routing is the next settlement milestone, not something this repo currently pretends is already shipped.

## Core product flow

1. Open `/press?id=demo` in the web app or Telegram Mini App.
2. The app loads article metadata, current readership, dynamic price tier, and contributor split targets from the database.
3. The frontend creates a payment attempt with `POST /api/articles/:id/payment-intent`.
4. The protected unlock route returns `402 Payment Required`.
5. TonConnect opens the user's TON wallet and submits the payment transaction.
6. The backend verifies and settles the payment, persists the confirmed payment and unlock grant, and returns the unlocked article.
7. The app restores access on refresh or reconnect through wallet-based access resolution.

## Stack

- Next.js 15 App Router
- TypeScript
- TON + TonConnect
- x402-style payment gating and facilitator flow
- Drizzle ORM + Postgres / Neon
- Vercel deployment target

## Project structure

- `examples/nextjs-server/app`
  Mini App frontend, API routes, and article reader flow
- `examples/nextjs-server/lib`
  DB client, schema, repositories, pricing, env loading, seed data
- `examples/nextjs-server/db/migrations`
  SQL migrations
- `packages/core`
  Shared x402 types and helpers
- `packages/middleware`
  `402 Payment Required` middleware
- `packages/facilitator`
  TON verification and settlement utilities

## Local setup

```bash
pnpm install
cp examples/nextjs-server/.env.example examples/nextjs-server/.env.local
```

Set at minimum:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
NEXT_PUBLIC_APP_URL=https://your-deployment.vercel.app
TON_NETWORK=testnet
PAYMENT_ADDRESS=your_ton_wallet_address
JETTON_MASTER_ADDRESS=kQCd6G7c_HUBkgwtmGzpdqvHIQoNkYOEE0kSWoc5v57hPPnW
FACILITATOR_URL=http://localhost:3000/api/facilitator
TON_RPC_URL=https://testnet.toncenter.com/api/v2/jsonRPC
RPC_API_KEY=your_toncenter_api_key
```

Then initialize the database and run the app:

```bash
cd examples/nextjs-server
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open:

- Web: `http://localhost:3000/press?id=demo`
- Feed: `http://localhost:3000/feed`
- About: `http://localhost:3000/about`

## Deployment notes

- Deploy `examples/nextjs-server` on Vercel.
- Set `NEXT_PUBLIC_APP_URL` to the exact deployed origin.
- The app serves a TonConnect manifest at `/tonconnect-manifest.json`.
- Use a real Postgres database in Vercel or Neon.
- Keep all TON payment env vars configured for the same network.

## Demo truth for judges

The strongest demo path today is:

1. Open the Telegram Mini App or deployed web app.
2. Browse to the featured article.
3. Connect a TON wallet with TonConnect.
4. Pay on testnet.
5. Watch the article unlock with a persisted payment record and wallet-based access restoration.

This is already a credible startup MVP for programmable journalism payments. The next major upgrade after the hackathon is true on-chain split routing to every contributor.
