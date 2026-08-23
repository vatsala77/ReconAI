# 🚀 ReconAI

> **Route splits your payments. AI explains where they went. 💡**

Built with ❤️ for **Razorpay AI Buildathon 2026** — *Track 04: AI Finance Controller* 🏆

---

## 🚨 The Problem

Every marketplace running on **Razorpay Route** faces the same monthly nightmare: a customer pays ₹10,000, Route splits it across Vendor A, Vendor B, deducts TDS, holds a chargeback amount, and takes a platform fee. At month-end, finance teams manually download settlement reports and spend **3–5 days** in Excel trying to answer one question:

> ❓ *"Where did every rupee go?"*

### ❌ Why Existing Tools Fall Short

* 📉 **Razorpay Recon:** Confirms Razorpay settled correctly to the merchant — but has no visibility into how that merchant then split funds across multiple vendors internally.
* 🏢 **Enterprise ERP tools (Bluecopa, Osfin):** Month-end, balance-sheet focused — not built to trace a single transaction's multi-party Route split.
* 📊 **Excel + VLOOKUP:** Manual, error-prone, and leaves no audit trail.

> 💡 **The Difference:** Razorpay Recon confirms your platform got paid correctly. **ReconAI** confirms your platform paid its vendors correctly. *Different layer, same trust chain!* 🤝

---

## ✨ The Solution

ReconAI is an AI reconciliation agent purpose-built for Razorpay Route marketplaces:

1. 📂 **Flexible Data Upload:** A company uploads its internal order records and Razorpay Route transfer/settlement data as a single Excel file — in whatever column format they already use.
2. 🤖 **AI-Powered Column Mapping:** Automatically detects and maps fields, regardless of naming — no manual template conversion required.
3. ⚙️ **Route-Native Matching Engine:** Reconciles every order against its corresponding Route transfer, using real Route data structures (`trf_`, `acc_`, `on_hold`, `recipient_settlement_id`, fee/tax breakdowns).
4. 🔍 **Automatic Discrepancy Categorization:** Missing payouts, duplicate transfers, expired holds, reversals, failed settlements, and amount mismatches.
5. 📚 **RAG-Grounded AI Explainer:** Generates a plain-English explanation for every exception, citing the exact regulation (TDS Section 194-O, GST/TCS rules, chargeback policy) that applies.
6. 💬 **Settlement Q&A Agent:** Lets users ask natural-language questions about their batch — routed intelligently to the right data-fetching strategy before answering.
7. 📊 **Honest Exception List:** Every run reports an honest, confidence-scored exception list alongside a measured match rate.

---

## ⚡ Why ReconAI + Razorpay = Perfect Match?

| Feature 📌 | Razorpay Recon 💳 | ReconAI 🤖 |
| :--- | :--- | :--- |
| **Scope** | Razorpay ↔ Merchant (single ledger) | Merchant ↔ Multiple Vendors (Route splits) |
| **Question answered** | "Did Razorpay settle what it owed me?" | "Did I correctly pass that money to my vendors?" |
| **Best for** | Any Razorpay merchant | Marketplaces/platforms using Route |
| **Relationship** | Foundation layer | Builds on top of Recon's data |

🎯 **Example:** A customer pays ₹500 for a food delivery order. 
* *Razorpay Recon* confirms Razorpay settled that ₹500 to the platform correctly. 
* But that ₹500 needs to become **₹350** (Restaurant) + **₹75** (Delivery Partner) + **₹50** (Platform Fee) + **₹25** (TDS). 
* Did that split actually happen correctly for all 1,000 orders today? **ReconAI tells you instantly!** ⚡

---

## 🎯 Track Alignment — "AI Finance Controller"

> 🎯 **The bar:** Throughput plus measured accuracy plus an honest exception list. One cherry-picked match proves nothing.

ReconAI is built directly against this bar:

* 🚀 **Throughput:** Processes full batches (50+ records), not isolated demo cases.
* 🎯 **Measured accuracy:** Every run reports a match rate percentage and a per-exception AI confidence score.
* 🔎 **Honest exception list:** Every unresolved case is shown, categorized, and explained — including cases where AI confidence is low. Nothing is hidden to make the demo look cleaner.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) |
| **Database** | Neon (Serverless Postgres) + Prisma ORM |
| **Auth** | NextAuth.js (Credentials provider, bcrypt-hashed passwords) |
| **AI — Embeddings** | Gemini `gemini-embedding-001` (768-dim) |
| **AI — Reasoning** | Gemini `gemini-3.6-flash` (structured JSON output) |
| **RAG** | Custom lightweight JSON-based vector store with cosine similarity |
| **File Parsing** | `xlsx` (SheetJS) with AI-powered column mapping |
| **Styling** | Plain CSS / styled-jsx |
| **Deployment** | Vercel |

---

## 🏗️ System Architecture

```text
Company uploads Excel (Orders + Route Transfers + optional Bank/GST sheets)
                          │
                          ▼
        🤖 AI Column-Mapping Engine (Gemini, any header format)
                          │
                          ▼
              💾 Bulk insert into Neon (Prisma)
                          │
                          ▼
      ⚙️ Reconciliation Engine — matches Orders ↔ Route Transfers
      │                                                    │
  ✅ Matched                                        🚨 Exception detected
                                                           │
                                                           ▼
                                       📚 RAG retrieval (TDS / GST / chargeback rules)
                                                           │
                                                           ▼
                                   🧠 Gemini generates plain-English explanation
                                                           │
                                                           ▼
                             💾 Stored in Neon (Reconciliation + Exception + AuditLog)
                                                           │
                                                           ▼
                   📊 Dashboard — match rate, exceptions, audit trail, CSV export,
                             Settlement Q&A chat agent
```

## 🔥 Core Features  

* 🤖 **AI-native onboarding** — Upload any Excel format; AI detects and maps columns without requiring a fixed template  
* 💳 **Real Route data modeling** — Seed and production data structures mirror actual Razorpay Route API responses (`trf_`, `acc_`, `on_hold_until`, `recipient_settlement_id`, fee/tax breakdown)  
* ⚖️ **RAG-grounded explanations** — Every AI explanation is retrieved against real regulatory text (TDS Section 194-O, GST/TCS e-commerce rules, RBI chargeback guidelines), not generated from memory  
* 🎯 **Confidence-scored exceptions** — Every flagged discrepancy carries a confidence score, so nothing is presented as more certain than it is  
* 💬 **Settlement Q&A agent** — Natural-language chat over batch data, with suggested starter questions and intent-based query routing  
* 🏢 **Multi-tenant architecture** — Company-level authentication and isolated upload history  
* 📥 **CSV export** — Full reconciliation report downloadable for offline review or handoff to finance teams  

---

## 🚀 Getting Started  

1️⃣ Clone & Install

```bash
git clone <repo-url>
cd reconai
npm install
```
 2️⃣ Environment Variables

###Create .env.local:
```
DATABASE_URL=your_neon_postgres_connection_string
GEMINI_API_KEY=your_google_ai_studio_key
AUTH_SECRET=your_random_32_char_secret
NEXTAUTH_URL=http://localhost:3000
```
3️⃣ Database Setup
```npx prisma migrate dev
node scripts/seedData.js   # optional — generates sample Route data for testing
```
4️⃣ Run Development Server
```npm run dev

Visit http://localhost:3000 — sign up, upload a settlement Excel file, and view the reconciliation dashboard.
```
📋 Excel Upload Format

ReconAI accepts a multi-sheet Excel file:

|Sheet 📑|	Required ⚠️|	Key Fields 🔑
| :--- | :--- | :--- |
|Orders	|Yes	|order_id, amount, platform_fee, tds, refund, customer_id
|Transfers|		Yes|		transfer_id, source, recipient, amount, on_hold, settlement_status, fee, tax
|Bank Settlements	|	Optional	|	utr, transfer_id, amount_credited, credited_at, status
|GST Filings	|	Optional	|	vendor_gstin, order_id, tcs_reported, filing_period, status

Column names don't need to match exactly — the AI mapping engine detects the correct field even if your spreadsheet uses different naming conventions.

🔮 Future Roadmap
🌐 Gateway-agnostic reconciliation — The matching engine is architected independently of Route's specific field names; future versions could extend to Stripe Connect, PayPal Marketplace, or other split-payment gateways. Route was chosen first because it's where we have direct integration experience and where Razorpay's own ecosystem benefits most.
🔌 MCP server exposure — Allowing external AI agents (Claude, Cursor) to query reconciliation state directly via the Model Context Protocol.
⚡ Automated resolution actions — Beyond flagging exceptions, triggering vendor notifications or hold-release requests directly from the dashboard.
📈 Incremental reconciliation — Processing only new/unmatched records on re-run, preserving historical audit trails at scale.
👥 Team

Built solo for the Razorpay AI Buildathon 2026.
