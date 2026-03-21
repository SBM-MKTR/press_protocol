# Press Protocol 📰

> *The printing press gave everyone the ability to publish. The internet gave everyone the ability to distribute. **Press Protocol gives everyone the ability to get paid.***

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-press--protocol--chi.vercel.app-14b8a6?style=for-the-badge)](https://press-protocol-chi.vercel.app)
[![Telegram Mini App](https://img.shields.io/badge/📱_Telegram-t.me%2FPresstonbot%2Fread-2CA5E0?style=for-the-badge)](https://t.me/Presstonbot/read)
[![Built on TON](https://img.shields.io/badge/⛓️_Built_on-TON_Blockchain-0088CC?style=for-the-badge)](https://ton.org)

---

## 🌍 The Problem Nobody Is Solving

There are **2 million professional journalists** in the world. Less than 20% have reliable income.

The other **1.6 million** — plus hundreds of millions of citizen journalists, translators, photographers, and fixers who make global journalism possible — have no reliable way to be paid for their work.

Here's why every existing solution fails them:

| Problem | Reality |
|---------|---------|
| 🏦 No bank access | A journalist in Nigeria, Myanmar, or Belarus can't receive Stripe. They can't open PayPal. Their bank gets frozen. |
| ✂️ Middlemen take everything | NYT subscription: journalist sees **3%** of what you paid. Substack takes 10%. Patreon takes 8%. |
| 🔇 Platforms silence them | YouTube demonetizes. PayPal freezes accounts. Governments pressure platforms. There is no appeal. |
| ⏳ Payment takes forever | Freelance journalists wait 30, 60, sometimes 90 days. Many are never paid at all. |

**Press Protocol fixes all four. At once.**

---

## 💡 What We Built

Press Protocol is a **decentralized payment infrastructure for journalism** — built on the TON blockchain, distributed through Telegram as a Mini App, accessible to anyone with a phone number.

When a reader pays to read an article, a single TON transaction **automatically splits the payment** between everyone who made that article possible:

```
Reader pays 0.10 BSA USD
    ↓  one transaction · one block · under 2 seconds
    ├── 65% ──→ Journalist    (Lagos, Nigeria)      0.065 BSA USD
    ├── 15% ──→ Editor        (London, UK)           0.015 BSA USD
    ├── 10% ──→ Translator    (Cairo, Egypt)         0.010 BSA USD
    ├──  5% ──→ Photographer  (Nairobi, Kenya)       0.005 BSA USD
    └──  5% ──→ Protocol      (treasury)             0.005 BSA USD
```

No invoices. No waiting. No publisher deciding who deserves what. **The split is encoded in the payment itself.**

---

## 🚀 Three Innovations That Change Everything

### ⚡ Innovation 1 — Atomic Split Payments
For the first time in media history, a single reader transaction pays every contributor simultaneously — journalist, editor, translator, photographer — with mathematical certainty, on a public blockchain. This has never existed before.

### 📈 Innovation 2 — Dynamic Pricing (The Information Market)
Each article is a **live market**. Price rises with demand:

| Readership | Price | What it means |
|-----------|-------|---------------|
| 0 – 100 readers | **0.01 BSA USD** | 🌱 Early supporter discount |
| 100 – 1,000 readers | **0.05 BSA USD** | 📈 Growing demand |
| 1,000+ readers | **0.10 BSA USD** | 🔥 Established story |

Value is set by readers. Not advertisers. Not editors. Not algorithms.

### 🛡️ Innovation 3 — Censorship-Resistant Income
TON wallet + Telegram = **no bank required, no platform can interfere**.

- A journalist in **Belarus** gets paid by readers in **Germany** 🇩🇪
- A reporter in **Myanmar** receives funds from supporters in **Japan** 🇯🇵  
- A fixer in **Baghdad** earns 15% of every article they helped create — automatically, forever

Their income stream **cannot be seized, frozen, or blocked.** This is what programmable money on TON makes possible.

---

## 🔄 How a Payment Works

```
1. Reader visits article page
        ↓
2. Server returns → 402 Payment Required  (x402 protocol)
        ↓
3. Client signs TON transaction locally  (nothing broadcast yet)
        ↓
4. Client retries request with signed payment in header
        ↓
5. Facilitator verifies signature offline
        ↓
6. Facilitator broadcasts to TON blockchain
        ↓
7. Payment confirmed on-chain  (<2 seconds)
        ↓
8. Article unlocks + TX hash returned to reader
```

Built on **[x402](https://github.com/coinbase/x402)** — the open protocol for HTTP micropayments. No wallets to connect. No popups. Just HTTP headers and cryptographic signatures.

---

## 🗂️ What's Inside

| Page | URL | Description |
|------|-----|-------------|
| 🏠 Homepage | `/` | Hero, stats, innovations, featured articles |
| 📰 Article Feed | `/feed` | Browse all stories, filter by category, sort |
| 🔒 Article Reader | `/press` | Pay-gated article with live TON payment flow |
| ✍️ Publish | `/register` | Journalist registration + payment split setup |
| 📊 Dashboard | `/dashboard` | Earnings chart, reader stats, recent payments |
| 👤 Journalist Profile | `/journalist/[id]` | Google Scholar-style journalist page |
| ℹ️ About | `/about` | Mission, problem, vision |
| 📱 Telegram Mini App | `t.me/Presstonbot/read` | Runs inside Telegram |

---

## 👩‍💼 Meet the Journalists

Five real stories. Five countries. Five journalists who had no way to be paid — until now.

| Journalist | Location | Beat | Profile |
|-----------|----------|------|---------|
| **Amara Diallo** | Thiès, Senegal 🇸🇳 | Water & Sanitation | [→ View profile](https://press-protocol-chi.vercel.app/journalist/amara-diallo) |
| **Chidi Okonkwo** | Niger Delta, Nigeria 🇳🇬 | Oil & Corruption | [→ View profile](https://press-protocol-chi.vercel.app/journalist/chidi-okonkwo) |
| **Thin Zar Hlaing** | Yangon, Myanmar 🇲🇲 | Press Freedom | [→ View profile](https://press-protocol-chi.vercel.app/journalist/thin-zar-hlaing) |
| **Olena Kovalenko** | Kyiv, Ukraine 🇺🇦 | Financial Accountability | [→ View profile](https://press-protocol-chi.vercel.app/journalist/olena-kovalenko) |
| **Marie-Claire Desrosiers** | Artibonite, Haiti 🇭🇹 | Climate Justice | [→ View profile](https://press-protocol-chi.vercel.app/journalist/marie-claire-desrosiers) |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| ⛓️ Blockchain | TON | Sub-2s finality, fraction-of-a-cent fees |
| 💳 Payments | x402 Protocol | HTTP-native micropayments |
| 💵 Stablecoin | BSA USD (TEP-74 Jetton) | No volatility risk for journalists |
| ⚡ Framework | Next.js 15 (App Router) | Production-grade web infrastructure |
| 🔤 Language | TypeScript | End-to-end type safety |
| 🚀 Deployment | Vercel | Global edge, zero config |
| 📱 Distribution | Telegram Mini App | 900M users, zero friction |

---

## 🧪 Try It Live

**Web app:** https://press-protocol-chi.vercel.app

**Telegram:** https://t.me/Presstonbot/read

**Hit the payment API:**
```bash
# This returns 402 — proving the payment gate works
curl -X POST https://press-protocol-chi.vercel.app/api/press \
  -H "content-type: application/json" \
  -d '{"articleId":"demo"}'

# This returns all 5 articles free (the browse feed)
curl https://press-protocol-chi.vercel.app/api/articles
```

---

## 💻 Run Locally

```bash
# 1. Clone
git clone https://github.com/Mhdelamine-moussa/press-protocol.git
cd press-protocol

# 2. Install
npm install -g pnpm
pnpm install
pnpm build

# 3. Configure
cp examples/nextjs-server/.env.example examples/nextjs-server/.env.local
# Fill in your TON wallet address, Toncenter API key, and 24-word mnemonic

# 4. Run
pnpm dev
# → http://localhost:3000

# 5. Test a real payment
pnpm dev:client:joke
# → Watch BSA USD move on the TON testnet blockchain in real time
```

**Environment variables needed:**
```env
TON_NETWORK=testnet
PAYMENT_ADDRESS=your_ton_wallet_address
JETTON_MASTER_ADDRESS=kQCd6G7c_HUBkgwtmGzpdqvHIQoNkYOEE0kSWoc5v57hPPnW
FACILITATOR_URL=https://press-protocol-chi.vercel.app/api/facilitator
TON_RPC_URL=https://testnet.toncenter.com/api/v2/jsonRPC
RPC_API_KEY=your_toncenter_api_key
WALLET_MNEMONIC="your 24 word mnemonic here"
```

---

## 🌐 The Vision

**Year 1** — A Telegram Mini App where any journalist, anywhere, publishes and gets paid instantly.

**Year 2** — An open protocol. A WordPress plugin that turns any blog into a Press-enabled paywall. A Chrome extension that adds "Pay journalist" to any article on the web.

**Year 3** — The default monetization layer for independent journalism globally. Not competing with the New York Times. Serving the journalists the New York Times will never employ.

---

## 🏆 Built at

**BSA × TON Stablecoins & Payments Hackathon — EPFL, March 2026**

Built on the [BSA x TON Hackathon Starter Kit](https://github.com/bsaepfl/bsa-sp-template-x402-2026) · Powered by [TON Blockchain](https://ton.org) · Distributed through [Telegram](https://telegram.org)

---

## 📄 License

MIT — Build on top of this. Make it better. Give journalists a voice.