# 🚀 ReconAI

> **Route splits your payments. AI explains where they went. 💡**

🌐 **Live Demo:** [recon-ai-ochre.vercel.app](https://recon-ai-ochre.vercel.app/)

Built with ❤️ for **Razorpay AI Buildathon 2026** — *Track 04: AI Finance Controller* 🏆

---

## 🚨 The Problem

Every marketplace running on **Razorpay Route** faces the same monthly nightmare: a customer pays ₹10,000, Route splits it across Vendor A, Vendor B, deducts TDS, holds a chargeback amount, and takes a platform fee. At month-end, finance teams manually download settlement reports, bank statements, and GST filings separately, then spend **3–5 days** in Excel trying to answer one question:

> ❓ *"Where did every rupee go — and did we deduct tax correctly on every single one?"*

### ❌ Why Existing Tools Fall Short

* 📉 **Razorpay Recon:** Confirms Razorpay settled correctly to the merchant — but has no visibility into how that merchant then split funds across multiple vendors internally, whether the bank actually credited what Route transferred, or whether TDS was deducted at the right rate.
* 🏢 **Enterprise ERP tools (Bluecopa, Osfin):** Month-end, balance-sheet focused — not built to trace a single transaction's multi-party Route split, or verify tax-line-level compliance.
* 📊 **Excel + VLOOKUP:** Manual, error-prone, checks totals but rarely individual tax lines — and leaves no audit trail.

> 💡 **The Difference:** Razorpay Recon confirms your platform got paid correctly. **ReconAI** confirms your platform paid its vendors correctly — down to the individual tax line. *Different layer, same trust chain!* 🤝

---

## ✨ The Solution

ReconAI is an AI reconciliation agent purpose-built for Razorpay Route marketplaces:

1. 📂 **Upload or Sync** — Upload your settlement Excel in any column format (AI maps it automatically), sync live from your own connected Razorpay test-mode account, or load the built-in demo dataset instantly.
2. 🤖 **AI-Powered Column Mapping** — Automatically detects and maps fields regardless of naming — no manual template conversion required.
3. ⚙️ **Multi-Source Matching Engine** — Reconciles every order against Route transfers, bank settlement UTRs, and GST filings — three independent data sources, not a single ledger check.
4. 🧾 **Tax-Line Verification** — TDS (Section 194-O: 0.1% standard, 5% penal rate without PAN, ₹5 lakh threshold exemption for individuals/HUFs) and GST-on-fee (18%) are checked individually against exact regulatory formulas, not estimated.
5. 🔍 **Automatic Discrepancy Categorization** — Missing payouts, duplicate transfers, expired holds, reversals, failed settlements, amount mismatches, bank credit delays, bank amount mismatches, GST TCS mismatches, and tax-line discrepancies.
6. 📚 **RAG-Grounded AI Explainer** — Generates a plain-English explanation for every exception, citing the exact regulation that applies.
7. 💬 **Settlement Q&A Agent** — Natural-language chat over batch data, intelligently routed to the right data-fetching strategy (specific order, category breakdown, top-risk ranking, or batch summary) before answering.
8. ✅ **Explainable Action Agent** — AI suggests a resolution for each exception; a human explicitly resolves, escalates, or ignores it. Nothing auto-executes — every decision is bounded, gated, and logged to an audit trail.
9. 📊 **Honest, Visualized Exception List** — Every run reports a measured match rate, an open/resolved breakdown, and interactive charts — nothing hidden to make the demo look cleaner.

---

## ⚡ Why ReconAI + Razorpay = Perfect Match?

| Feature 📌 | Razorpay Recon 💳 | ReconAI 🤖 |
| :--- | :--- | :--- |
| **Scope** | Razorpay ↔ Merchant (single ledger) | Merchant ↔ Multiple Vendors (Route splits) |
| **Question answered** | "Did Razorpay settle what it owed me?" | "Did I correctly pass that money to my vendors — and deduct tax correctly?" |
| **Tax-line depth** | Not covered | TDS (194-O) and GST-on-fee verified per transaction |
| **Best for** | Any Razorpay merchant | Marketplaces/platforms using Route |
| **Relationship** | Foundation layer | Builds on top of Recon's data |

🎯 **Example:** A customer pays ₹500 for a food delivery order.
* *Razorpay Recon* confirms Razorpay settled that ₹500 to the platform correctly.
* But that ₹500 needs to become **₹350** (Restaurant) + **₹75** (Delivery Partner) + **₹50** (Platform Fee) + **₹25** (TDS).
* Did that split happen correctly, was the bank credit confirmed, was TDS at the right rate, and was GST filed correctly — for all 1,000 orders today? **ReconAI tells you instantly, and explains every exception in plain English.** ⚡

---

## 🎯 Track Alignment — "AI Finance Controller"

> 🎯 **The bar:** Throughput plus measured accuracy plus an honest exception list. One cherry-picked match proves nothing.

ReconAI is built directly against this bar:

* 🚀 **Throughput:** Processes full batches (50+ records across Orders, Transfers, Bank Settlements, and GST Filings), not isolated demo cases.
* 🎯 **Measured accuracy:** Every run reports a match rate percentage and a per-exception AI confidence score.
* 🔎 **Honest exception list:** Every unresolved case is shown, categorized, and explained — including cases where AI confidence is low. Nothing is hidden to make the demo look cleaner. The built-in demo dataset intentionally includes ~35% exceptions across every category the engine detects, rather than a cherry-picked clean run.

---

## 🔥 Core Features

### 🔗 Multi-Source Reconciliation
Orders, Route Transfers, Bank UTRs, and GST Filings — cross-verified against each other, not checked in isolation.

### 🧾 Tax-Line Verification
TDS and GST-on-fee checked individually against exact regulatory formulas — including the ₹5 lakh threshold exemption for individual/HUF sellers, tracked against real cumulative financial-year volume (not assumed).

### 💬 Settlement Q&A Agent
Query-routed AI chat — classifies each question (specific order / category breakdown / top-risk / summary / general) and fetches only the relevant data before answering, instead of dumping the entire batch into every prompt. Chat history persists per batch.

### ✅ Explainable Action Agent
Every exception gets an AI-suggested resolution with reasoning. A human explicitly **Resolves**, **Escalates**, or **Ignores** it — nothing is auto-executed. Every action is written to a permanent audit trail (who, what, when, why).

### ⚡ Live Razorpay Sync
Connect your own Razorpay test-mode account (credentials encrypted at rest, only `rzp_test_` keys accepted), or try the one-click **Demo Sandbox** using a pre-built 52-record dataset covering every exception category the engine can detect.

### 📊 Interactive Dashboard
- Pie chart — exception categories breakdown
- Bar chart — seller-wise exception distribution
- Donut chart — match rate with open/resolved/total stats
- Status filter pills (All / Open / Resolved) with live counts
- Bulk selection — resolve, escalate, or ignore multiple exceptions at once
- Real-time reconciliation progress indicator ("Processing order X of Y…")
- AI-generated batch health summary (plain-English one-glance status)

### 📄 Compliance-Ready Export
One-click PDF report — branded header, summary stats, exception category breakdown, full exception details with AI explanations, and the complete audit trail. CSV export also available for raw data handoff.

### 🎨 Light & Dark Mode
Full theme support across the entire app, including the landing page, dashboard, and all cards.

### 🏢 Multi-Tenant Architecture
Company-level authentication (NextAuth, bcrypt-hashed credentials) with isolated upload history per account.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) |
| **Database** | Neon (Serverless Postgres) + Prisma ORM |
| **Auth** | NextAuth.js (Credentials provider, bcrypt-hashed passwords) |
| **AI — Reasoning** | OpenRouter (`openai/gpt-oss-120b`) — column mapping, exception explanations, chat, resolution suggestions |
| **AI — Embeddings** | HuggingFace Inference API (`sentence-transformers/all-MiniLM-L6-v2`) |
| **RAG** | Custom lightweight JSON-based vector store with cosine similarity, grounded on TDS/GST/bank-settlement regulatory text |
| **Payments Integration** | Razorpay Node SDK — live Route transfer/payment sync (test mode only) |
| **File Parsing** | `xlsx` (SheetJS) with AI-powered column mapping |
| **Charts** | Recharts — pie, bar, and donut visualizations |
| **PDF Generation** | jsPDF — compliance report export |
| **Styling** | Plain CSS / styled-jsx, with light/dark theme support |
| **Deployment** | Vercel |

---

## 🏗️ System Architecture

```text
Company uploads Excel (Orders + Transfers + optional Bank/GST sheets)
        OR syncs live from Razorpay (own account or demo sandbox)
                          │
                          ▼
        🤖 AI Column-Mapping Engine (OpenRouter, any header format)
                          │
                          ▼
              💾 Bulk insert into Neon (Prisma)
                          │
                          ▼
      ⚙️ Reconciliation Engine — 4 layers, in order:
      │  1. Route-level match (Orders ↔ Transfers)
      │  2. Bank Settlement check (UTR, amount, delay)
      │  3. GST Filing check (TCS on net taxable value)
      │  4. Tax-Line check (TDS rate/threshold, GST-on-fee)
      │
  ✅ Matched                                        🚨 Exception detected
                                                           │
                                                           ▼
                                       📚 RAG retrieval (TDS / GST / bank-settlement rules)
                                                           │
                                                           ▼
                            🧠 OpenRouter generates plain-English explanation + confidence score
                                                           │
                                                           ▼
                             💾 Stored in Neon (Reconciliation + Exception + AuditLog)
                                                           │
                                                           ▼
              📊 Dashboard — match rate, charts, exception list, AI health summary
                                                           │
                        ┌──────────────────────┬──────────────────────┐
                        ▼                      ▼                      ▼
              💬 Settlement Q&A Agent   ✅ Explainable Action Agent   📄 PDF/CSV Export
              (query-routed chat)       (suggest → human resolves,
                                          escalates, or ignores)
```

---

## 📁 Project Structure

```
reconai/
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── middleware.js
├── next.config.mjs
├── eslint.config.mjs
├── jsconfig.json
├── package.json
├── .env / .env.example
│
├── app/
│   ├── layout.js
│   ├── page.js
│   ├── globals.css
│   │
│   ├── login/page.jsx
│   ├── signup/page.jsx
│   ├── contact/page.jsx
│   ├── privacy/page.jsx
│   ├── terms/page.jsx
│   ├── upload/page.jsx
│   ├── dashboard/page.js
│   ├── dashboard/[batchId]/page.jsx
│   │
│   └── api/
│       ├── chat/route.js
│       ├── reconcile/route.js
│       ├── health-summary/route.js
│       ├── metrics/route.js
│       ├── audit/route.js
│       ├── upload/route.js
│       ├── upload/batch-info/route.js
│       ├── upload/confirm/route.js
│       ├── upload/preview/route.js
│       ├── uploads/route.js
│       ├── uploads/[batchId]/route.js
│       ├── exceptions/route.js
│       ├── exceptions/[id]/resolve/route.js
│       ├── exceptions/[id]/suggest-action/route.js
│       ├── razorpay/connect/route.js
│       ├── razorpay/disconnect/route.js
│       ├── sync-razorpay/route.js
│       ├── auth/[...nextauth]/route.js
│       └── auth/signup/route.js
│
├── components/
│   ├── AuditTimeline.jsx
│   ├── ChatPanel.jsx
│   ├── ConnectRazorpayModal.jsx
│   ├── Dashboard.jsx
│   ├── DashboardHeader.jsx
│   ├── DashboardUI.jsx
│   ├── ExceptionTable.jsx
│   ├── HealthSummaryCard.jsx
│   ├── MatchRateCard.jsx
│   ├── ReconcileButton.jsx
│   ├── StatsCards.jsx
│   ├── ThemeToggle.jsx
│   └── UploadsList.jsx
│
├── lib/
│   ├── aiExplainer.js
│   ├── auth.js
│   ├── chatRouter.js
│   ├── encryption.js
│   ├── exportCSV.js
│   ├── mapColumns.js
│   ├── prisma.js
│   ├── rag.js
│   ├── razorpay.js
│   ├── reconcile.js
│   ├── taxLineMatcher.js
│   └── ThemeContext.jsx
│
├── data/
│   └── rag-store.json
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       ├── add_multi_tenant/
│       ├── add_auth_models/
│       ├── add_tax_line_breakdown/
│       ├── add_seller_fields/
│       ├── add_seller_fields_to_order/
│       └── add_razorpay_credentials/
│
├── public/financial-rules/
│   ├── bank-settlement-utr.txt
│   ├── chargeback-policy.txt
│   ├── gst-ecommerce.txt
│   ├── gst-tcs-calculation.txt
│   └── tds-section-194o.txt
│
└── scripts/
    ├── checkRoute.js
    ├── createTestAccount.js
    ├── seedData.js
    ├── testRAG.js
    └── testReconcile.js
```

---

## 🚀 Getting Started

### 1️⃣ Clone & Install

```bash
git clone https://github.com/vatsala77/ReconAI.git
cd ReconAI
npm install
```

### 2️⃣ Environment Variables

Create `.env.local`:

```env
DATABASE_URL=your_neon_postgres_connection_string
AUTH_SECRET=your_random_32_char_secret
NEXTAUTH_URL=http://localhost:3000

OPENROUTER_API_KEY=your_openrouter_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key

RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
ENCRYPTION_SECRET=your_random_32_char_secret_for_credential_encryption
```

### 3️⃣ Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

### 4️⃣ Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` — sign up, then either:
- Click **"Try Demo Sandbox"** to instantly load a full 52-record reconciliation batch, or
- Upload your own settlement Excel, or
- Connect your own Razorpay test-mode account and sync live.

---

## 📋 Excel Upload Format

ReconAI accepts a multi-sheet Excel file:

| Sheet 📑 | Required ⚠️ | Key Fields 🔑 |
| :--- | :--- | :--- |
| Orders | Yes | `order_id`, `amount`, `platform_fee`, `tds`, `refund`, `customer_id`, `seller_id`, `seller_type`, `pan_available` |
| Transfers | Yes | `transfer_id`, `source`, `recipient`, `amount`, `on_hold`, `on_hold_until`, `amount_reversed`, `settlement_status`, `fee`, `tax`, `error_description` |
| Bank Settlements | Optional | `utr`, `transfer_id`, `amount_credited`, `credited_at`, `status` |
| GST Filings | Optional | `vendor_gstin`, `order_id`, `tcs_reported`, `filing_period`, `status` |

Column names don't need to match exactly — the AI mapping engine detects the correct field even if your spreadsheet uses different naming conventions. `seller_type` and `pan_available` power the Section 194-O tax-line checks (threshold exemption and penal-rate detection); if omitted, the engine defaults to standard-rate assumptions.

A ready-to-use demo file with all exception categories is available at `data/reconai_full_demo_batch_50plus.xlsx`, or accessible directly from the dashboard's demo banner.

---

## 🔮 Future Roadmap

- 🌐 **Gateway-agnostic reconciliation** — The matching engine is architected independently of Route's specific field names; future versions could extend to Stripe Connect, PayPal Marketplace, or other split-payment gateways.
- 🔌 **MCP server exposure** — Allowing external AI agents (Claude, Cursor) to query reconciliation state directly via the Model Context Protocol.
- 📈 **Forward cash forecasting** — ML-based prediction of on-hold transfer settlement delays, feeding an AI-narrated cash-flow projection.
- 🚨 **Cross-batch risk signals** — Flagging sellers with abnormally high exception rates across multiple batches.
- 📈 **Incremental reconciliation** — Processing only new/unmatched records on re-run, preserving historical audit trails at scale.

---

## 👥 Team

Built solo for the Razorpay AI Buildathon 2026.
