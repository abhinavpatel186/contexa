# Contexa
### AI-Powered Enterprise Knowledge & Task Management Platform
> *"Never Lose Context. Keep Work Moving."*

Contexa is a full-stack, enterprise-grade context management platform engineered for **Vercel Serverless Functions** and **Neon PostgreSQL**, integrated with **Google Gemini 1.5 Flash**.

---

## 1. Problem Statement

Modern engineering and product organizations hemorrhage critical context across handovers:
- **Missed Meetings & Leave:** Team members return without clear visibility into decisions made.
- **Lost Commitments:** Open action items from sprint syncs vanish rather than carrying forward into subsequent agendas.
- **Forgotten Decisions & Conflicts:** Earlier architectural decisions are contradicted by later ad-hoc discussions.
- **Context Debt:** Discussions repeat across multiple meetings without resolution, slowing sprint velocity.

**Contexa solves this** by transforming raw unstructured meeting notes into structured decisions and action items, providing immutable audit history across carry-forwards, synthesizing personalized catch-up and handover briefs, and continuously scoring project health through its signature **Context Debt Radar**.

---

## 2. System Architecture

Contexa is organized as a unified, modular Next.js App Router application with strict separation of concerns:

```mermaid
flowchart TD
    subgraph Client ["Frontend Presentation Layer (React 18 + Tailwind CSS)"]
        UI_Dash["Executive Dashboard"]
        UI_Mtg["Meeting Intelligence UI"]
        UI_Task["Task Lifecycle & History"]
        UI_Radar["Context Debt Radar"]
        UI_Handover["Smart Handover Generator"]
        UI_KB["Knowledge Repository"]
    end

    subgraph API ["Backend API Layer (Next.js 14 Route Handlers)"]
        R_Dash["/api/dashboard"]
        R_Mtg["/api/meetings & [id]/carry-forward"]
        R_Task["/api/tasks & [id]/history"]
        R_AI["/api/ai/* (analyze, debt, handover, catch-up)"]
        R_KB["/api/knowledge"]
        R_Act["/api/activity"]
    end

    subgraph ServiceLayer ["Business Logic Layer (Services)"]
        S_Mtg["MeetingService"]
        S_Task["TaskService"]
        S_Debt["ContextDebtService & Heuristics"]
        S_Handover["HandoverService"]
        S_KB["KnowledgeService"]
    end

    subgraph External ["External Infrastructure & AI"]
        GEMINI["Google Gemini 1.5 Flash API (Structured JSON Mode)"]
        NEON_POOL["Neon PgBouncer Connection Pooler (DATABASE_URL)"]
        NEON_DIRECT["Neon Direct Host (DIRECT_URL for Migrations)"]
    end

    Client -->|REST Fetch + Correlation IDs| API
    API -->|Zod Input Validation| ServiceLayer
    ServiceLayer -->|Prisma 5.22 ORM| NEON_POOL
    ServiceLayer -->|Gemini SDK + Schema Validation| GEMINI
```

---

## 3. Technology Stack

| Layer | Technology | Selection Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 App Router | Serverless route handlers, streaming SSR, zero Express daemon overhead |
| **Language** | TypeScript 5.7 | End-to-end type safety across schemas, API payloads, and database records |
| **Database** | Neon PostgreSQL | Serverless PostgreSQL with autoscaling, instant branching, and PgBouncer connection pooling |
| **ORM** | Prisma ORM 5.22 | Strongly typed relational models, safe migrations, connection lifecycle control |
| **AI Engine** | Google Gemini 1.5 Flash | High-speed structured JSON generation, cost-effective reasoning, 30s timeout bounding |
| **Validation** | Zod 3.24 | Runtime verification of API requests and Gemini model outputs |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Responsive SaaS design system adhering to dark navy typography guidelines |
| **Logging** | Structured JSON Logger | Request ID correlation, development file output, Vercel stdout/stderr streaming |

---

## 4. Key Innovations & Features

### A. Signature Innovation: Context Debt Radar
Traditional project tools record meetings and track tasks. Contexa goes further by detecting when a team is **losing context**:
1. **Repeated Discussions:** Identifies topics debated across $\ge 2$ meetings without a confirmed decision.
2. **Commitment Stagnation:** Tracks deliverables carried forward repeatedly or remaining overdue.
3. **Decision Conflicts:** Flags newer decisions (e.g., launch postponed to Dec 01) contradicting older targets (Nov 15) without formal supersession.
4. **Missing Context:** Detects open deliverables lacking assigned owners or clear descriptions.
5. **Dependency Blockers:** Identifies blocked tasks waiting on unassigned upstream requirements.

#### Context Debt Scoring Formula
$$\text{Context Debt Score} = (R \times 0.25) + (S \times 0.25) + (C \times 0.20) + (M \times 0.15) + (D \times 0.15)$$
- $R$: Repeated Discussion Risk (Normalized 0–100)
- $S$: Stagnation Risk (Normalized 0–100)
- $C$: Decision Conflict Risk (Normalized 0–100)
- $M$: Missing Context & Ownership Risk (Normalized 0–100)
- $D$: Dependency Risk (Normalized 0–100)

**Risk Tiers:**
- `0–24`: **Healthy** (Normal sprint velocity)
- `25–49`: **Moderate** (Minor recurring topics or carried items)
- `50–74`: **High** (Decision gaps or blocked deliverables threatening milestones)
- `75–100`: **Critical** (Severe architectural misalignment or unowned commitments)

*Meaningful Resolution Enforcement:* Risk flags cannot be dismissed by a cosmetic button click; users must record a substantive resolution note (e.g., confirming a vendor choice or formalizing a supersession).

### B. AI Meeting Intelligence
- Users paste unstructured meeting notes.
- Gemini extracts: Executive Summary, Key Decisions, Action Items (with owner, deadline, priority), Risks, Dependencies, and Next Meeting Recommendations.
- **Review & Approval Gate:** Generated items are displayed for human review and editing before being committed to PostgreSQL.

### C. Smart Carry-Forward Functionality
- Carries open tasks from completed meetings into target agendas.
- Preserves the **original task ID**, **creation date**, and **originating meeting link**.
- Appends an immutable record to `TaskHistory` displaying the previous meeting and target meeting.

### D. Smart Context Handover
- Generates an authoritative onboarding dossier for an incoming employee taking over a project or covering for a colleague.
- Synthesizes 10 critical operational dimensions grounded in actual PostgreSQL records.

### E. AI Catch-Up Brief
- Generates a tailored catch-up summary for an employee who missed a meeting: *What was discussed? What was decided? What is relevant to me? What are my deadlines?*

---

## 5. Database Schema & Relational Integrity

The schema is defined in [`prisma/schema.prisma`](file:///d:/Contexa/prisma/schema.prisma):

```
User (id, name, email, role, createdAt)
  ├── 1:N ── ProjectMember ── N:1 ── Project (id, name, description, createdAt)
  ├── 1:N ── MeetingParticipant ── N:1 ── Meeting (id, projectId, title, date, notes, summary, status)
  │                                           ├── 1:N ── Decision (id, meetingId, title, description, status)
  │                                           └── 1:N ── MeetingActionItem (associationType: ORIGINATED | CARRIED_FORWARD)
  └── 1:N ── ActionItem (id, projectId, title, ownerId, dueDate, priority, status, outcome)
               └── 1:N ── TaskHistory (fieldChanged, previousValue, newValue, changedBy, createdAt)
```

- **Referential Integrity:** Cascading deletes on join tables; set null on task assignments.
- **Index Optimization:** Compound indices on `[projectId, status]`, `[meetingId, actionItemId]`, and `[createdAt]` to eliminate table scans.

---

## 6. Vercel Serverless & Neon Resource Optimization

1. **Dual Connection Strings:**
   - `DATABASE_URL`: Points to Neon's **PgBouncer pooler** (`ep-sample-pooler...`) for high-concurrency runtime queries with transaction pooling.
   - `DIRECT_URL`: Points directly to the Postgres compute host (`ep-sample...`) for Prisma migrations and schema push.
2. **Cold-Start Latency Protection:** `PrismaClient` is cached globally (`globalThis.prisma`) across warm serverless lambdas. Connection timeouts are tuned to 15 seconds to absorb Neon scale-to-zero wake-up latency.
3. **Bounded AI Timeouts:** Gemini requests are wrapped in `AbortController` with a 30-second timeout and 2 bounded retries with exponential jitter.
4. **Structured JSON Logging:** Operational logs emit structured JSON to `stdout`/`stderr` (ingested by Vercel Runtime Logs) while business events persist in the PostgreSQL `ActivityLog` table.

---

## 7. Environment Variables

Create `.env` in the root directory:

```env
# Neon Connection Strings
DATABASE_URL="postgresql://neondb_owner:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:password@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Google Gemini API
GEMINI_API_KEY="your-google-gemini-api-key"
GEMINI_MODEL="gemini-1.5-flash"

# Environment
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 8. Installation & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

### 3. Apply Migrations & Seed Demonstration Scenario
```bash
# Apply schema to Neon PostgreSQL
npm run prisma:push

# Populate 5 users, 6 meetings, 12 tasks with carry-forward, decisions, and knowledge docs
npm run prisma:seed
```

### 4. Run Automated Smoke Tests
```bash
npx --yes tsx tests/smoke-test.mjs
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to explore Contexa.

### 6. Production Build
```bash
npm run build
```

---

## 9. Demonstration Scenario (Seeded Data)

The seed script loads an interconnected scenario (**PRODUCT LAUNCH – Q4 2026**) specifically demonstrating context loss:
1. **Recurring Discussion without Decision:** Payment Gateway integration debated across Sprint 1, 2, and 3 without a recorded vendor choice.
2. **Carried-Forward Deliverable:** "Implement responsive Landing page" carried forward across 3 meetings (Sprint 1 $\to$ Sprint 3 $\to$ Sprint 5).
3. **Conflicting Decisions:** Sprint 2 decided launch target of *November 15, 2026*, while Sprint 4 postponed to *December 01, 2026* without formal supersession.
4. **Missing Ownership:** "Prepare customer onboarding email drip campaign" exists with no assigned owner.
5. **Blocked Dependency:** "Implement Stripe & Razorpay webhook listener" is marked `BLOCKED` awaiting payment vendor selection.

---

## 10. Five-Minute Interview Demonstration Guide

- **Minute 1: Problem & Executive Dashboard (`/`)**
  - Show the 5 aggregate KPI cards derived from real PostgreSQL records.
  - Highlight the Context Health Preview card displaying a score of `51/100 (High Risk)` with conflicting launch dates.
- **Minute 2: Meeting Intelligence & AI Extraction (`/meetings/mtg_sprint1`)**
  - Open a meeting, inspect discussion notes, and trigger "Generate AI Meeting Summary".
  - Demonstrate structured Zod-validated decisions and tasks, review, and approve to save into the database.
- **Minute 3: Action Items & Carry-Forward (`/tasks` & `/meetings/mtg_sprint5`)**
  - Show task status updates and the TaskHistory audit timeline.
  - Open Sprint 5, switch to Carry-Forward Hub, select unresolved items, and carry them forward into Sprint 6.
- **Minute 4: Context Debt Radar (`/context-debt`)**
  - Explain the 5-part weighted mathematical formula (25% discussions, 25% stagnation, 20% conflicts, 15% missing context, 15% dependencies).
  - Inspect the risk cards with clickable evidence links to meetings and tasks.
  - Resolve a risk flag by supplying a required business resolution note.
- **Minute 5: Smart Handover & Architecture Explanation (`/handover` & `/settings`)**
  - Generate an onboarding brief for incoming QA Lead Priya Mehta.
  - Explain the Vercel serverless statelessness, Neon connection pooling, and structured logging.

---

## 11. Assumptions & Known Limitations

- **Authentication:** Evaluated in clear demo mode with active user persona selection (Rahul Sharma) to maximize feature coverage within the 2-hour assessment deadline.
- **Document Formats:** Text and Markdown supported directly in PostgreSQL. Binary PDFs intentionally excluded to remain within Vercel serverless request body limits (4.5MB).
- **Offline / Zero-Config Resilience:** Built with an intelligent dual-mode repository: queries Neon when credentials exist, and seamlessly supports local demonstration state if credentials are being configured.

---

## 12. License
MIT © 2026 Contexa Team. Developed for SPIT Technical Hiring Assessment.

