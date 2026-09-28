# Influverse HQ — Admin & Escrow Back-Office Dashboard

A high-performance, enterprise-grade back-office and administration platform engineered for **Influverse** — the premier European luxury creator marketplace with 100% escrow protection.

This application is built as an independent, decoupled single-page application (SPA) with dedicated state management, design tokens, and domain modules.

---

## 🎨 Visual Identity & Design System

The dashboard strictly adheres to the core Influverse design system:

| Token | Value | Role |
| :--- | :--- | :--- |
| **Brand Black** | `#0A0A0A` | Primary onyx backdrop, primary buttons, luxury headers |
| **Brand Pink** | `#FF2D78` | Primary accent, verification seals, urgent notifications |
| **Neutral Surface** | `#FAFAF8` | Clean, warm, high-contrast canvas background |
| **Card / Elevated**| `#FFFFFF` | Isolated elevation cards and table rows |
| **Border Subtle** | `#E7E7E2` | Thin, deliberate architectural containment |
| **Typography** | `Red Hat Display` & `Playfair Display` | High-legibility tabular UI figures & editorial accents |

---

## ⚡ Core Operational Capabilities

### 1. Marketplace Overview & Financial Surveillance
- **Gross Marketplace Volume (GMV)** tracking & growth velocity.
- **Escrow In Hold**: Real-time surveillance of capital locked in trust accounts.
- **Platform Net Fees (15%)**: Live take-rate calculations and transaction accounting.
- **Urgent Operational Trays**: Immediate access to open disputes and KYC verification backlog.

### 2. User Moderation & Sanctions Engine
- Comprehensive directory of registered **Creators** and **Brands**.
- Real-time status filtering (`Active`, `Suspended`, `Banned`, `Pending Verification`).
- **Surgical Moderation Drawer**:
  - Three disciplinary tiers: **Warning**, **Temporary Suspension** (14-day freeze), and **Permanent Ban** (full blacklist).
  - Escrow disposition control: Automatic refund vs Trust hold pending investigation.
  - Reason categorization: Escrow fee circumvention, campaign default, fake metrics, etc.
  - Encrypted internal audit logging.

### 3. Creator KYC & Verification Queue
- Exclusive vetting portal to maintain Influverse's **top 1% acceptance standard**.
- Audit follower reach, verified view counts, and social channel handles (Instagram, TikTok, YouTube).
- Direct deliverable sample video review.
- Approve badge grant or issue structured rejection notices with creator-facing improvement feedback.

### 4. Escrow Vault & 3-Way Dispute Arbitration
- Legally binding platform arbitration docket for contested campaigns.
- Review campaign briefs, brand grievances, and creator deliverables.
- **3-Way Settlement Execution**:
  1. **100% Release to Creator** (deliverable satisfies creative brief).
  2. **100% Refund to Brand** (material breach of brief or SLA default).
  3. **Custom Pro-Rata Split Settlement** (e.g. 50/50 mutual settlement).
- Certified mediator reasoning log with automated dispatch to both parties.

### 5. Dynamic CMS & Legal Document Studio
- **Terms of Service & Privacy Policy**:
  - Live in-app Markdown editor with instant side-by-side preview.
  - Semantic auto-versioning (e.g. v2.4) and GDPR-compliant audit trail.
- **Dynamic FAQ Manager**:
  - Categorized by Brands, Creators, and Escrow.
  - Full CRUD: Add, edit, delete, publish, and unpublish questions.
- **Brand Assets & Homepage Customization**:
  - Live logo light/dark URL configuration.
  - Favicon management.
  - Global homepage hero headline, subtitle, and concierge contact settings.

### 6. Admin Team & Role-Based Access Control (RBAC)
- Multi-tiered administrator access:
  - **Super Admin**: Unconstrained financial override and team provisioning.
  - **Finance Lead**: Escrow custody and payout authorization.
  - **Operations Manager**: Creator approvals and CMS publishing.
  - **Moderator**: Content auditing and dispute investigation.
- Invite new team members with mandatory 2FA enforcement.
- Admin profile management with personal avatar and master password rotation.

---

## 🛠️ Architecture & Tech Stack

```
src/
├── main.tsx                  // Entry point, Redux Provider
├── App.tsx                   // Router provider root
├── router/
│   ├── index.tsx             // createBrowserRouter configuration
│   └── PrivateRoute.tsx      // Auth protection guard
├── pages/
│   ├── auth/
│   │   └── LoginPage.tsx     // Back-office authentication
│   └── dashboard/
│       ├── DashboardPage.tsx // KPI command center
│       ├── UsersPage.tsx     // Moderation & user directory
│       ├── VerificationPage.tsx // Creator KYC approval queue
│       ├── EscrowPage.tsx    // Dispute arbitration docket
│       ├── CmsPage.tsx       // Terms, Privacy, FAQ & Logo CMS
│       ├── TeamPage.tsx      // Admin RBAC & member management
│       └── SettingsPage.tsx  // Profile, password & 2FA
├── components/
│   ├── layout/               // Sidebar, Topbar, DashboardLayout, AuthLayout
│   ├── ui/                   // Button, Input, Modal, Table, Card, Badge, Dropdown, Textarea, Avatar
│   └── shared/               // StatCard, PageHeader, EmptyState, ConfirmDialog
├── store/
│   ├── index.ts              // Redux store configuration
│   ├── rootReducer.ts        // Combined reducers
│   ├── hooks.ts              // Typed useAppDispatch, useAppSelector
│   └── slices/               // auth, users, verification, escrow, cms, team
├── types/
│   └── admin.types.ts        // Strict TypeScript contracts
├── constants/
│   └── routes.ts             // Type-safe route paths
├── lib/
│   ├── constants.ts          // Initial seed mock fixtures
│   └── utils.ts              // Currency, date & formatting helpers
└── styles/
    └── globals.css           // Tailwind directives & custom scrollbars
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### Installation
```bash
cd influencer-dashboard
npm install
```

### Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🔒 Security & Compliance
- **SOC2 Type II & GDPR Ready**: All administrative actions create immutable state logs.
- **Isolated State Boundary**: Zero bleed between client-side consumer cookies and back-office administrative sessions.
- **Escrow Segregation**: Financial balances are stored in EUR with 2-decimal precision.
