<div align="center">

# 🚀 ReconAI

### Route splits your payments. AI explains where they went. 💡

Built with ❤️ for the **Razorpay AI Buildathon 2026** — *Track 04: AI Finance Controller* 🏆

</div>

---

## 🚨 The Problem

Every marketplace running on Razorpay Route faces the same monthly nightmare: a customer pays, Route splits it across vendors, deducts TDS, holds a chargeback amount, takes a platform fee — and by month-end, finance teams are still manually tracing rupees across Excel sheets, bank statements, and settlement APIs.

> ❓ *"Where did every rupee go?"*

### ❌ Why Existing Tools Fall Short

- 📕 **Razorpay Recon** — confirms Razorpay settled correctly to the merchant, but has no visibility into how that merchant then split funds across multiple vendors internally.
- 🧾 **ERP tools** — built for month-end, balance-sheet-focused accounting, not for tracing a single transaction's multi-party Route split.
- 📊 **Spreadsheets** — fast to start, slow to trust, and impossible to audit across 50+ orders and multiple data sources.

> 💡 **The difference:** Razorpay Recon confirms your platform *got paid* correctly. ReconAI confirms your platform *paid its vendors* correctly. Different layer, same trust chain! 🤝

---

## ✨ The Solution

ReconAI is a **Route-native reconciliation engine with AI on top of it** — an AI reconciliation layer sitting between the merchant and the Route payout chain.

### 🧩 Core Capabilities

| # | Capability | What it does |
|:-:|:---|:---|
| 1️⃣ | **Multi-source reconciliation** | Matches orders ↔ Route transfers ↔ bank credits ↔ GST/TCS filings, catching discrepancies across the *full* settlement chain |
| 2️⃣ | **AI-assisted upload & mapping** | Accepts messy Excel files with arbitrary headers, auto-maps columns, supports multi-sheet uploads |
| 3️⃣ | **Tax-line verification** | Validates TDS under Section 194-O, checks GST on fee/tax lines, flags tax mismatches separately from amount mismatches |
| 4️⃣ | **Exception taxonomy** | 10 real categories — from `missing_payout` to `gst_tcs_mismatch` (full list below 👇) |
| 5️⃣ | **AI explanation layer** | Lightweight RAG retrieves policy text, explains each exception in plain English, with confidence scores 🎯 |
| 6️⃣ | **Explainable action agent** | Suggests one concrete fix per exception, keeps human-in-the-loop, logs everything for audit ✅ |
| 7️⃣ | **Settlement Q&A agent** | Ask natural-language questions over the batch — order, category, summary, high-risk queries 💬 |
| 8️⃣ | **Live Razorpay sync** | Connects to a Razorpay account in test/demo mode and pulls transfer data directly 🔄 |
| 9️⃣ | **Batch health summary** | One glance snapshot — amount at risk, dominant exception types 📈 |

### 🏷️ Exception Categories

```
missing_payout        duplicate_payout       amount_mismatch
chargeback_hold        reversal_pending       settlement_failed
bank_credit_delayed    bank_amount_mismatch   gst_tcs_mismatch
tax_line_discrepancy
```

---

## ⚖️ ReconAI vs Razorpay Recon

| Capability | 📕 Razorpay Recon | 🚀 ReconAI |
| :--- | :--- | :--- |
| **Core question** | Did Razorpay settle correctly to me? | Did I correctly split & reconcile that money onward to vendors and taxes? |
| **Scope** | Merchant → Razorpay | Merchant → Route split chain → bank → GST |
| **Data sources** | Settlement ledger | Orders, transfers, bank settlements, GST filings |
| **Best fit** | Ledger validation | Marketplace financial reconciliation |
| **Exception depth** | Settlement-level | Transaction, tax, hold, reversal & payout level |

---

## 💸 Example Walkthrough

A customer pays **₹500** for an order.

Razorpay Recon confirms ₹500 was received by the platform. ✅ Done, for them.

But the real operational flow looks like this:

```
₹350 → Vendor
₹75  → Delivery partner
₹50  → Platform fee
₹25  → TDS / tax deduction
  ⚠️  possible chargeback hold or reversal
```

**ReconAI** checks whether that split actually happened, whether the bank credit matched, whether the Route transfer was delayed or failed, and whether the tax-line math is correct. 🔍

---

## 🛠️ How the System Works

```
📤  Excel upload / Razorpay sync
          │
          ▼
🧠  AI field mapping + normalization
          │
          ▼
📦  Orders + Route transfers + bank settlements + GST filings
          │
          ▼
🔀  Multi-source reconciliation engine
          │
          ├── ✅ matched cleanly
          │
          └── ⚠️  exception detected
                    │
                    ▼
          📚  Tax-line validation + RAG rule retrieval
                    │
                    ▼
          🤖  AI explanation + confidence scoring
                    │
                    ▼
     🛠️  Action suggestions + audit log + dashboard summary
```

---

## 🧰 Tech Stack

| Layer | Stack |
| :--- | :--- |
| 🖼️ Framework | Next.js 16 (App Router) |
| ⚛️ Frontend | React 19 + component-based UI |
| ⚙️ Backend | Next.js server routes |
| 🗄️ Database | PostgreSQL + Prisma ORM |
| 🔐 Auth | NextAuth.js with credentials + bcrypt |
| 🧠 AI reasoning | OpenRouter with GPT OSS models |
| 🔎 Embeddings | HuggingFace sentence-transformers via Inference API |
| 📚 RAG | Custom lightweight JSON vector store + cosine similarity |
| 📄 File parsing | xlsx (SheetJS) |
| 💳 Payments | Razorpay Node SDK |
| ☁️ Deployment | Vercel-ready |

---

## ✅ Features Implemented in This Repo

- 🧠 AI-powered Excel column mapping for messy upload files
- 🏢 Multi-tenant company auth and isolated upload history
- 🔗 Route transfer matching based on real order/transfer structures
- 🚫 Duplicate payout and missing payout detection
- ⏸️ Chargeback hold and expired hold monitoring
- ↩️ Reversal and settlement failure handling
- 🏦 Bank settlement verification using UTR/credit checks
- 🧾 GST TCS validation and tax discrepancy workflows
- 🏷️ Route-native exception taxonomy
- 📚 RAG-grounded explanations from regulation text files
- 💬 Natural-language chat over batch data
- ✅ Explainable resolution suggestions with human approval flow
- 📊 Batch health summary card
- 🖥️ Dashboard review surfaces for reconciliation and exceptions

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

## 🚦 Getting Started

### 1️⃣ Clone the repo

```bash
git clone <repo-url>
cd reconai
npm install
```

### 2️⃣ Configure environment variables

Create a `.env.local` file:

```bash
DATABASE_URL=postgresql://...your-db-url...
AUTH_SECRET=your-32-char-secret
NEXTAUTH_URL=http://localhost:3000

OPENROUTER_API_KEY=your_openrouter_key
HUGGINGFACE_API_KEY=your_huggingface_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ENCRYPTION_SECRET=your_encryption_secret
```

### 3️⃣ Set up Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

Optional demo dataset:

```bash
node scripts/seedData.js
```

### 4️⃣ Run the app

```bash
npm run dev
```

Then open 👉 `http://localhost:3000`

---

## 📖 How to Use It

1. 🔑 Sign up or log in to a company account.
2. 📤 Upload a settlement Excel file or connect Razorpay in demo/test mode.
3. 🧠 Let the app map the uploaded data and reconcile orders against Route transfers.
4. 🔍 Review exceptions, tax mismatches, and bank/settlement anomalies.
5. 💬 Ask the batch Q&A agent questions in natural language.
6. ✅ Review AI-suggested actions and resolve exceptions with audit tracking.

---

## 🧮 Reconciliation Logic

ReconAI is built around three core ideas:

- 🧾 **Order-level truth** — what the merchant sold and what the customer paid
- 🔀 **Transfer-level truth** — what Route actually transferred or held
- 🏦 **Settlement-level truth** — what reached the bank and what GST filings included

The reconciliation engine does not stop at a single match — it validates each order across multiple layers and only marks it clean when **all** relevant checks pass. ✅

---

## 🛡️ Compliance & AI Caution

> This project is designed to support finance operations workflows, **not** to auto-execute money movement. The AI layer explains, routes, and recommends — the human stays the final decision-maker. 🧑‍⚖️

That's intentional:

- 🎯 the app surfaces confidence scores
- 🏷️ it reports exception categories honestly
- 👀 it encourages review before resolution

---

## 🗺️ Roadmap

- 🌐 Broader gateway abstraction beyond Razorpay Route
- 🤖 More advanced exception auto-resolution flows
- 🕰️ Richer audit trails and historical reconciliation snapshots
- ⚡ Better incremental reconciliation for large batches
- 📊 More dashboard drilldowns and finance exports

---

## 👥 Team

Built for the **Razorpay AI Buildathon 2026** as a focused AI Finance Controller prototype for Route marketplaces. 🏆

---

## 📄 License

This project is for demo and prototype use as part of the Razorpay AI Buildathon 2026. Contact the repository owner for commercial usage details.