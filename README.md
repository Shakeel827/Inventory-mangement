# 📦 InventoryQ — Smart Asset & Device Management System

> Built by **GENPANDAX — Next-Gen Solutions**  
> 🌐 Live: [inventory-mangement-lyart.vercel.app](https://inventory-mangement-lyart.vercel.app)  
> 📧 Support: support@pandascanpros.in | Business: business@pandascanpros.in | 📞 +91 80740 15276

[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-11.0-orange)](https://firebase.google.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [User Flow Diagrams](#user-flow-diagrams)
4. [Features](#features)
5. [Tech Stack](#tech-stack)
6. [Security](#security)
7. [Pricing & Costs](#pricing--costs)
8. [How to Use](#how-to-use)
9. [Installation](#installation)
10. [Deployment](#deployment)
11. [API & Database Schema](#api--database-schema)
12. [Roadmap](#roadmap)

---

## Overview

InventoryQ is a professional, cloud-based inventory management system designed for businesses of all sizes. It enables real-time tracking of devices and assets using QR codes, supports bulk operations via Excel, provides AI-powered insights, and enforces role-based access control.

**Key differentiators:**
- Zero-install QR scanning (works in any mobile browser)
- Custom fields that reflect in Excel templates and QR code views
- AI assistant for natural-language inventory queries
- Device reservation/booking system
- Bulk user and device import via Excel

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Web Browser │  │ Mobile Phone │  │  Tablet / Desktop    │  │
│  │  (React SPA) │  │ (QR Scanner) │  │  (Admin Dashboard)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         └─────────────────┴──────────────────────┘              │
│                           │ HTTPS / TLS 1.3                      │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      CDN LAYER (Vercel)                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Vercel Edge Network (Global CDN)                        │    │
│  │  - Static file serving (HTML, CSS, JS)                   │    │
│  │  - SPA routing (all routes → index.html)                 │    │
│  │  - Automatic HTTPS / SSL certificates                    │    │
│  │  - DDoS protection                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   FIREBASE BACKEND (Google Cloud)                │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ Firebase Auth    │  │ Cloud Firestore  │  │ Firebase     │  │
│  │                  │  │                  │  │ Hosting      │  │
│  │ - Email/Password │  │ - devices        │  │ (fallback)   │  │
│  │ - Session tokens │  │ - users          │  └──────────────┘  │
│  │ - JWT validation │  │ - categories     │                     │
│  │ - Rate limiting  │  │ - deviceActivity │  ┌──────────────┐  │
│  └──────────────────┘  │ - customFields   │  │ OpenRouter   │  │
│                         │ - reservations   │  │ AI API       │  │
│                         │ - vendors        │  │ (gpt-4o-mini)│  │
│                         │ - maintenanceLogs│  └──────────────┘  │
│                         └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Flow Diagrams

### Admin Flow

```
Register / Login
      │
      ▼
  Dashboard ──────────────────────────────────────────────┐
      │                                                    │
      ├── Devices ──► Add Device ──► Generate QR Code      │
      │         └──► Bulk Import Excel                     │
      │         └──► Edit Device (name, ID, fields)        │
      │         └──► Manage Custom Fields                  │
      │                                                    │
      ├── Categories ──► Add/Edit Categories               │
      │                                                    │
      ├── Users ──► Create User (single)                   │
      │        └──► Bulk Import Users (Excel)              │
      │        └──► Change Roles                           │
      │                                                    │
      ├── Reservations ──► Book Device for Future Date     │
      │                                                    │
      ├── Vendors ──► Add Supplier Info                    │
      │                                                    │
      ├── Reports ──► Download Excel Reports               │
      │          └──► Export PDF                           │
      │                                                    │
      ├── AI Assistant ──► Natural Language Queries        │
      │                └──► Anomaly Detection              │
      │                                                    │
      └── Audit Logs ──► View All Activity                 │
                                                           │
  ⌘K Command Palette ◄──────────────────────────────────┘
```

### Scanner (User) Flow

```
Login
  │
  ▼
Dashboard (limited view)
  │
  ├── Scan QR Code ──► Camera Opens
  │         │
  │         ▼
  │    QR Code Detected
  │         │
  │         ▼
  │    Device Page ──► Check Out (if available)
  │                └──► Check In (if checked out)
  │                └──► View Device Details + Custom Fields
  │
  └── Device List ──► Manual Check In/Out
```

### Check-In / Check-Out Flow

```
User scans QR code
        │
        ▼
  Device page loads
        │
        ▼
  Status = Available?
    ├── YES ──► "Check Out" button active
    │              │
    │              ▼
    │         Firestore updated (status → checked_out)
    │              │
    │              ▼
    │         Activity log created (userId, email, timestamp)
    │              │
    │              ▼
    │         Admin email notification sent ◄── NEW
    │
    └── NO ──► "Check In" button active
                   │
                   ▼
              Firestore updated (status → available)
                   │
                   ▼
              Activity log created
                   │
                   ▼
              Admin email notification sent ◄── NEW
```

### Custom Fields Flow

```
Admin adds custom field (e.g. "Purchase Price")
        │
        ▼
  Saved to Firestore /customFields/{orgId}
        │
        ├──► Appears in "Add Device" form immediately
        │
        ├──► Appears in "Edit Device" inline form
        │
        ├──► Included in "Download Template" Excel
        │         (admin fills in values, uploads)
        │
        ├──► Imported from Excel bulk upload
        │
        └──► Displayed on QR scan device page
```

---

## Features

### Core Inventory
| Feature | Description |
|---------|-------------|
| Real-time device tracking | Firebase onSnapshot — changes appear instantly |
| Custom fields | Add text/number/date fields; reflect in template + QR view |
| Editable device ID | Set your own asset tag / custom ID per device |
| Inline device editing | Edit name, location, category, custom ID, custom fields in-table |
| Bulk Excel import | Import 1000s of devices with real-time progress bar |
| Excel template download | Template includes all custom fields |
| QR code generation | Auto-generated per device |
| QR sticker printing | Print sheets of QR stickers |
| Barcode scanning | html5-qrcode supports both QR and barcodes |
| Status management | Available, Checked Out, Under Repair, Maintenance, Retired |
| Optimistic UI | Status changes reflect instantly, sync in background |

### User Management
| Feature | Description |
|---------|-------------|
| Create single user | Email + password + role |
| Bulk user import | Excel upload with Name/Email/Password/Role columns |
| User template download | Pre-formatted Excel template |
| Role-based access | Admin, Manager, Scanner with strict permissions |
| Inline role change | Change roles from the users table |

### AI Features
| Feature | Description |
|---------|-------------|
| Natural language queries | "How many laptops are checked out?" |
| Anomaly detection | Flags unusual patterns in device activity |
| Auto-categorization | Suggests categories during import |
| Model | gpt-4o-mini (cheapest, fast) via OpenRouter |
| Fallback | User can add own API key when credits run out |

### Reports & Analytics
| Feature | Description |
|---------|-------------|
| Device usage report | All check-in/out activity (Excel) |
| User activity report | Activity per user (Excel) |
| Inventory snapshot | Current status of all devices (Excel) |
| Dashboard report | Summary with stats (Excel) |
| PDF export | Device list as PDF |
| Print support | Browser print with optimized styles |

### Other Features
| Feature | Description |
|---------|-------------|
| Device reservations | Book devices for future date/time |
| Vendor management | Track suppliers, warranties, contacts |
| Maintenance tracking | Log maintenance events |
| Audit logs | Immutable activity trail |
| Command palette | ⌘K spotlight search |
| Onboarding wizard | 4-step guided setup for new users |
| Skeleton loaders | Animated placeholders while loading |
| Offline-ready | Firebase caches data locally |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3 | UI framework |
| TypeScript | 5.6 | Type safety |
| Vite | 6.0 | Build tool (fast HMR) |
| Tailwind CSS | 3.4 | Utility-first styling |
| Framer Motion | 11.0 | Animations |
| React Router | 6.28 | Client-side routing |
| React Hot Toast | 2.x | Toast notifications |
| React Helmet Async | — | SEO meta tags |
| Firebase SDK | 11.0 | Auth + Firestore |
| XLSX | 0.18 | Excel import/export |
| jsPDF + autoTable | 4.x | PDF generation |
| html5-qrcode | 2.3 | QR + barcode scanning |
| qrcode.react | 4.2 | QR code generation |
| Chart.js | 4.5 | Dashboard charts |
| OpenAI SDK | — | AI assistant |
| @dnd-kit | — | Drag-and-drop |

### Backend (Optional)
| Technology | Version | Purpose |
|-----------|---------|---------|
| Express | 4.x | REST API server |
| Firebase Admin SDK | — | Server-side Firestore |
| express-rate-limit | 7.x | API rate limiting |
| Helmet | — | Security headers |
| CORS | — | Cross-origin control |
| dotenv | 16.x | Environment variables |

### Infrastructure
| Service | Purpose | Cost |
|---------|---------|------|
| Firebase Auth | User authentication | Free (10K users/month) |
| Cloud Firestore | NoSQL database | Free (50K reads, 20K writes/day) |
| Firebase Hosting | Static hosting (fallback) | Free (10GB) |
| Vercel | Frontend hosting + CDN | Free (hobby) |
| OpenRouter | AI API proxy | Pay per use (~$0.00015/1K tokens) |

---

## Security

### Authentication
- Firebase Authentication with email/password
- Passwords hashed with bcrypt (Firebase handles this)
- Minimum 8 characters, uppercase, lowercase, number required
- JWT session tokens, short-lived, auto-refreshed
- Rate limiting on failed login attempts (Firebase built-in)

### Database Security (Firestore Rules)
```
Every read/write is validated server-side:

1. isSignedIn()          — Must be authenticated
2. userOrgId()           — Reads orgId from Firestore user doc
3. isOrgMember()         — Can only access own org's data
4. isAdmin()             — Admin-only operations
5. isAdminOrManager()    — Admin + Manager operations

Collections protected:
- /users/{id}            — Own profile only; admins can read org users
- /devices/{id}          — Org members read; admin/manager write
- /categories/{id}       — Org members read; admin/manager write
- /customFields/{orgId}  — Org members read; admin/manager write
- /deviceActivity/{id}   — Org members read; all signed-in create
- /reservations/{id}     — Org members read; signed-in create own
- /vendors/{id}          — Admin/manager only
- /maintenanceLogs/{id}  — Admin/manager only
```

### Transport Security
- TLS 1.3 enforced on all connections (Vercel + Firebase)
- HTTPS-only (HTTP redirects to HTTPS automatically)
- HSTS headers enabled

### Application Security
- CORS restricted to specific origins (not wildcard)
- Rate limiting: 100 requests per 15 minutes per IP
- File upload validation: size (10MB max), extension (.xlsx/.xls), MIME type
- React Error Boundaries prevent crash information leakage
- No eval() or dangerouslySetInnerHTML in codebase
- TypeScript enforces type safety throughout
- Input sanitization on all form fields

### Infrastructure Security
- Google Firebase: SOC 2 Type II, ISO 27001, PCI DSS certified
- AES-256 encryption at rest
- Global DDoS protection via Vercel CDN
- Environment variables stored in Vercel encrypted vault
- No secrets in source code (API keys via env vars)

### Audit & Compliance
- Every check-in/out logged with userId, email, timestamp
- Audit logs are immutable (no update/delete allowed)
- 12-month log retention
- Admin can export full audit trail as Excel

---

## Pricing & Costs

### Firebase Free Tier (Spark Plan) — Sufficient for most businesses
| Resource | Free Limit | Notes |
|----------|-----------|-------|
| Authentication | 10,000 users/month | More than enough |
| Firestore reads | 50,000/day | ~1,000 devices, 50 users |
| Firestore writes | 20,000/day | Plenty for normal use |
| Firestore storage | 1 GB | Thousands of devices |
| Hosting bandwidth | 360 MB/day | Static files cached by CDN |

### InventoryQ Plans
| Plan | Monthly | Annual | Devices | Users |
|------|---------|--------|---------|-------|
| Starter | Free | Free | 100 | 2 |
| Professional | ₹499 | ₹4,999 | 2,000 | 10 |
| Business | ₹999 | ₹9,999 | Unlimited | Unlimited |

**Maximum cost: ₹999/month or ₹9,999/year** — includes Firebase infrastructure, AI features, and support.

### AI Costs (OpenRouter / gpt-4o-mini)
- Input: ~$0.00015 per 1,000 tokens
- Output: ~$0.00060 per 1,000 tokens
- Typical query: ~500 tokens = $0.0001 (less than 1 paisa)
- 1,000 queries/month ≈ $0.10 (₹8)

### Contact for Enterprise
- 📧 business@pandascanpros.in
- 📞 +91 80740 15276

---

## How to Use

### 1. Register Your Organization
1. Go to the app URL
2. Click "Get Started Free"
3. Fill in: Organization Name, Your Name, Email, Password
4. You're automatically set as Admin

### 2. Set Up Categories
1. Go to **Dashboard → Categories**
2. Click "Add Category"
3. Create categories like: Laptops, Monitors, Phones, etc.

### 3. Add Custom Fields (Optional)
1. Go to **Dashboard → Devices**
2. Click "Manage Fields" in the Bulk Upload section
3. Add fields like: Purchase Price, Warranty Expiry, Asset Tag
4. These fields appear in the Add Device form AND the Excel template

### 4. Add Devices

**Option A: Manual**
1. Go to **Dashboard → Devices**
2. Fill in the "Add Device Manually" form
3. Include Name, Custom ID, Location, Category, Status
4. Fill in any custom fields
5. Click "Add Device"

**Option B: Bulk Excel Import**
1. Click "Download Template" to get the Excel file
2. Fill in your devices (custom fields are included as columns)
3. Click "Choose Excel File" to upload
4. Watch the real-time progress bar (0–100%)
5. Review the import summary

### 5. Generate QR Codes
1. Go to **Dashboard → QR Stickers**
2. Select devices
3. Print the QR sticker sheet
4. Attach stickers to physical devices

### 6. Check In / Check Out
**Via QR Scan:**
1. Open the app on your phone
2. Go to **Scan QR**
3. Point camera at device QR code
4. Tap "Check Out" or "Check In"

**Via Dashboard:**
1. Go to **Dashboard → Devices**
2. Change the status dropdown for any device

### 7. Create Team Members
1. Go to **Dashboard → Users**
2. Click "+ Add User" for single user
3. Or click "Bulk Upload Excel" for multiple users
4. Download the user template, fill it in, upload

### 8. View Reports
1. Go to **Dashboard → Reports**
2. Choose report type:
   - Device Usage (all check-in/out activity)
   - User Activity (per-user stats)
   - Inventory Snapshot (current status)
   - Dashboard Summary (overview)
3. Click download — Excel file saves automatically

### 9. Use AI Assistant
1. Go to **Dashboard → AI Assistant**
2. Type any question: "How many devices are checked out?"
3. Or click "Detect Anomalies" for automatic analysis
4. If credits run out, add your own OpenAI key

### 10. Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `⌘K` | Open command palette |
| `↑↓` | Navigate command palette |
| `Enter` | Select command |
| `Esc` | Close palette / cancel edit |

---

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account
- Git

### Clone & Install
```bash
git clone https://github.com/Shakeel827/Inventory-mangement.git
cd Inventory-mangement

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies (optional)
cd ../backend
npm install
```

### Configure Firebase
1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Copy your config to `frontend/src/firebaseClient.ts`

### Environment Variables

**Frontend** (`frontend/.env.local`):
```env
VITE_OPENAI_KEY=your-openrouter-api-key
```

**Backend** (`backend/.env`):
```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Run Development Server
```bash
cd frontend
npm run dev
# Open: http://localhost:5173
```

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Configure:
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install --prefix frontend`
5. Add Environment Variable: `VITE_OPENAI_KEY`
6. Click Deploy

### Deploy Firestore Rules
```bash
firebase login
firebase deploy --only firestore:rules
```

### Deploy to Firebase Hosting (Alternative)
```bash
cd frontend
npm run build
cd ..
firebase deploy
```

---

## API & Database Schema

### Firestore Collections

#### `/users/{userId}`
```typescript
{
  email: string;
  displayName: string | null;
  orgId: string;           // Organization identifier
  role: "admin" | "manager" | "user";
  createdAt: Timestamp;
  onboardingComplete?: boolean;
}
```

#### `/devices/{deviceId}`
```typescript
{
  orgId: string;
  name: string;
  customId?: string;       // User-defined asset tag
  categoryId: string | null;
  model?: string;
  serialNumber?: string;
  location?: string;
  status: "available" | "checked_out" | "under_repair" | "maintenance_required" | "retired";
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // + any custom fields (dynamic keys)
}
```

#### `/deviceActivity/{activityId}`
```typescript
{
  orgId: string;
  deviceId: string;
  deviceName?: string;
  action: "check_in" | "check_out" | "status_change";
  newStatus?: string;
  userId: string | null;
  userEmail: string;
  timestamp: Timestamp;
}
```

#### `/customFields/{orgId}`
```typescript
{
  fields: Array<{
    id: string;            // snake_case identifier
    label: string;         // Display name
    type: "text" | "number" | "date";
    required: boolean;
  }>;
}
```

#### `/categories/{categoryId}`
```typescript
{
  orgId: string;
  name: string;
  description?: string;
  createdAt: Timestamp;
}
```

#### `/reservations/{reservationId}`
```typescript
{
  orgId: string;
  deviceId: string;
  deviceName: string;
  userId: string;
  userEmail: string;
  startDate: Timestamp;
  endDate: Timestamp;
  note?: string;
  status: "pending" | "approved" | "cancelled";
  createdAt: Timestamp;
}
```

#### `/vendors/{vendorId}`
```typescript
{
  orgId: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  notes?: string;
  createdAt: Timestamp;
}
```

---

## Roadmap

### Q2 2026
- [ ] Email notifications on check-in/out (Firebase Cloud Functions + SendGrid)
- [ ] Daily/weekly/monthly automated reports via email
- [ ] Device images (Firebase Storage)
- [ ] 2FA / MFA (Firebase TOTP)
- [ ] Email verification on registration

### Q3 2026
- [ ] Mobile app (React Native / Capacitor)
- [ ] Offline support (PWA with service worker)
- [ ] Algolia full-text search
- [ ] Barcode scanning (already supported by html5-qrcode)
- [ ] Depreciation tracking

### Q4 2026
- [ ] Webhooks (Slack, Teams, Zapier)
- [ ] REST API with API keys
- [ ] Multi-location support
- [ ] White-label option
- [ ] Invoice generation for rentals

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Support

| Channel | Contact |
|---------|---------|
| Email | support@pandascanpros.in |
| Business | business@pandascanpros.in |
| Phone | +91 80740 15276 |
| GitHub Issues | [github.com/Shakeel827/Inventory-mangement/issues](https://github.com/Shakeel827/Inventory-mangement/issues) |

---

**Made with ❤️ by GENPANDAX — Next-Gen Solutions**  
*We Build Smart Websites That Run and Grow Your Business*
