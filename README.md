Here it is — one block, select all and copy:

````markdown
# Press Protocol 📰

> **The first split-payment layer for global journalism, built on TON and distributed through Telegram.**

[![Live Demo](https://img.shields.io/badge/Live-press--protocol--chi.vercel.app-14b8a6)](https://press-protocol-chi.vercel.app)
[![Telegram Mini App](https://img.shields.io/badge/Telegram-t.me%2FPresstonbot%2Fread-2CA5E0)](https://t.me/Presstonbot/read)
[![Built on TON](https://img.shields.io/badge/Built%20on-TON-0088CC)](https://ton.org)

---

## The Problem

There are 2 million professional journalists in the world. Less than 20% have reliable income. The other 1.6 million — plus hundreds of millions of citizen journalists, translators, photographers, and fixers — have no reliable way to be paid for their work.

The existing solutions all fail the same way:
- **No bank access** — A journalist in Nigeria, Myanmar, or Belarus can't receive Stripe payments or open a PayPal account
- **Middlemen take everything** — A NYT subscription: the journalist sees 3% of what you paid. Substack takes 10%. Patreon takes 8%
- **Platforms silence them** — YouTube demonetizes. PayPal freezes accounts. Governments pressure platforms
- **Payment takes months** — Freelance journalists wait 30, 60, sometimes 90 days. Many are never paid at all

## The Solution

Press Protocol is a decentralized payment infrastructure for journalism built on the TON blockchain and distributed through Telegram as a Mini App.

When a reader pays to read an article, a **single TON transaction automatically splits the payment** between everyone who made that article possible — journalist, editor, translator, photographer — instantly, with no middleman, no bank account needed, accessible to anyone with Telegram's 900 million users.

---

## Three Innovations

### ⚡ 1. Atomic Split Payments
One reader payment is automatically distributed to every contributor in a single TON transaction:

```
Reader pays 0.10 BSA USD
    ↓ (one transaction · one block · under 2 seconds)
    ├── 65% → Journalist (Lagos, Nigeria)
    ├── 15% → Editor (London, UK)
    ├── 10% → Translator (Cairo, Egypt)
    ├── 5%  → Photographer (Nairobi, Kenya)
    └── 5%  → Press Protocol treasury
```

No invoices. No NET-90 payment terms. No publisher deciding who deserves what cut. The split is encoded in the payment itself, visible on-chain, and cannot be altered.

### 📈 2. Dynamic Pricing
Each article is a live market. Prices rise with readership:

| Readers | Price | Tier |
|---------|-------|------|
| 0 – 100 | 0.01 BSA USD | Early supporter |
| 100 – 1,000 | 0.05 BSA USD | Growing |
| 1,000+ | 0.10 BSA USD | Established |

Early supporters pay less. Established stories charge more. Value is set by readers, not advertisers.

### 🛡️ 3. Censorship-Resistant Income
TON wallet + Telegram = no bank needed. No platform can freeze payments.

- A journalist in **Belarus** gets paid by readers in **Germany**
- A reporter in **Myanmar** receives funds from supporters in **Japan**
- A fixer in **Baghdad** earns 15% of every article they helped create — automatically, forever

Their income stream cannot be seized, frozen, or blocked. This is what programmable money on TON makes possible for the first time in history.

---

## How It Works

```
Reader visits article → clicks "Pay to Read"
        ↓
Server returns 402 Payment Required (x402 protocol)
        ↓
Client signs TON transaction locally (nothing broadcast yet)
        ↓
Client retries request with signed payment header
        ↓
Facilitator verifies + broadcasts to TON blockchain
        ↓
Payment confirmed on-chain in under 2 seconds
        ↓
Article unlocks + TX hash returned
```

Built on the **x402 protocol** — HTTP 402 Payment Required for machine-to-machine micropayments. No wallets to connect. No web UI needed. Just HTTP headers and cryptographic signatures.

---

## Features

- 🏠 **Homepage** — Hero, stats, 3 innovations, featured articles
- 📰 **Article Feed** — Browse all stories, filter by category, sort by popularity
- 🔒 **Article Reader** — Pay-gated articles with blurred preview and TON payment flow
- ✍️ **Journalist Registration** — Publish articles, set payment splits, get a shareable link
- 📊 **Journalist Dashboard** — Earnings chart, reader stats, recent payments, price tier
- 👤 **Journalist Profiles** — Google Scholar-style profile with bio, stats, and published stories
- ℹ️ **About Page** — Full mission, problem statement, and vision
- 📱 **Telegram Mini App** — Accessible at t.me/Presstonbot/read

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | TON (testnet) |
| Payment Protocol | x402 (HTTP 402 Payment Required) |
| Stablecoin | BSA USD (TEP-74 Jetton) |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Deployment | Vercel |
| Distribution | Telegram Mini App |

---

## Live Demo

**Web:** https://press-protocol-chi.vercel.app

**Telegram Mini App:** https://t.me/Presstonbot/read

**Test the payment API directly:**
```bash
curl -X POST https://press-protocol-chi.vercel.app/api/press \
  -H "content-type: application/json" \
  -d '{"articleId":"demo"}'
# Returns 402 Payment Required with TON payment instructions
```

**Browse all articles:**
```bash
curl https://press-protocol-chi.vercel.app/api/articles
# Returns all 5 articles with metadata, pricing, and split data
```

---

## Journalist Profiles

| Journalist | Location | Specialty | Profile |
|-----------|----------|-----------|---------|
| Amara Diallo | Thiès, Senegal | Water & Sanitation | [View](https://press-protocol-chi.vercel.app/journalist/amara-diallo) |
| Chidi Okonkwo | Niger Delta, Nigeria | Oil & Corruption | [View](https://press-protocol-chi.vercel.app/journalist/chidi-okonkwo) |
| Thin Zar Hlaing | Yangon, Myanmar | Press Freedom | [View](https://press-protocol-chi.vercel.app/journalist/thin-zar-hlaing) |
| Olena Kovalenko | Kyiv, Ukraine | Financial Accountability | [View](https://press-protocol-chi.vercel.app/journalist/olena-kovalenko) |
| Marie-Claire Desrosiers | Artibonite, Haiti | Climate Justice | [View](https://press-protocol-chi.vercel.app/journalist/marie-claire-desrosiers) |

---

## Run Locally

### Prerequisites
- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- TON testnet wallet (MyTonWallet)
- Toncenter API key (via @tonapibot on Telegram)

### Setup

```bash
git clone https://github.com/Mhdelamine-moussa/press-protocol.git
cd press-protocol
pnpm install
pnpm build
```

### Environment Variables

Create `examples/nextjs-server/.env.local`:

```env
TON_NETWORK=testnet
PAYMENT_ADDRESS=your_ton_wallet_address
JETTON_MASTER_ADDRESS=kQCd6G7c_HUBkgwtmGzpdqvHIQoNkYOEE0kSWoc5v57hPPnW
FACILITATOR_URL=https://press-protocol-chi.vercel.app/api/facilitator
TON_RPC_URL=https://testnet.toncenter.com/api/v2/jsonRPC
RPC_API_KEY=your_toncenter_api_key
WALLET_MNEMONIC="your 24 word mnemonic"
```

### Start

```bash
pnpm dev
```

Visit http://localhost:3000

### Test a payment

```bash
pnpm dev:client:joke
```

---

## API Reference

### `POST /api/press`
Pay-gated article endpoint. Returns 402 without payment, full article after payment confirmed.

**Request:**
```json
{ "articleId": "demo" }
```

**Response (after payment):**
```json
{
  "title": "Water Crisis in Senegal",
  "author": "Amara Diallo",
  "content": "...",
  "splits": [{ "role": "Journalist", "percent": 65 }],
  "readCount": 1848
}
```

### `GET /api/articles`
Public feed endpoint. Returns all articles without payment.

**Response:**
```json
{
  "articles": [
    {
      "id": "demo",
      "title": "Water Crisis in Senegal",
      "author": "Amara Diallo",
      "location": "Thiès, Senegal",
      "category": "Investigative",
      "priceDisplay": "0.10 BSA USD",
      "currentPrice": "100000000",
      "readCount": 1847,
      "splits": [...]
    }
  ]
}
```

---

## The Vision

In year one: a Telegram Mini App where journalists publish and readers pay.

In year two: an open protocol that any app can integrate. A WordPress plugin that turns any blog into a Press-enabled paywall. A Chrome extension that adds a "Pay journalist" button to any article on the web.

In year three: the default payment layer for independent journalism globally. Not competing with the New York Times. Serving the 10 million journalists and citizen reporters who the New York Times will never employ.

**The printing press gave everyone the ability to publish. The internet gave everyone the ability to distribute. Press Protocol gives everyone the ability to get paid — regardless of where they were born, what bank will take them, or what government wants to silence them.**

---

## Built at

BSA × TON Stablecoins & Payments Hackathon — EPFL, March 2026

Built on the [BSA x TON Hackathon Starter](https://github.com/bsaepfl/bsa-sp-template-x402-2026)

---

## License

MIT
````