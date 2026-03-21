# Client Portal for TechByBrewski

## Context

TechByBrewski needs a secure, authenticated client portal where onboarded clients can manage their engagement — upload documents, exchange messages, make payments, and sign contracts. This turns techbybrewski.com from a marketing site + admin CMS into a full client relationship platform.

**This also includes**:
- Migrating from `adminUsers` collection to **Firebase Auth custom claims** for role-based access
- Setting up **Firebase Emulators** for local development (zero billable reads/writes during dev)

**Key constraint**: KB is opening the LLC next week and will set up Mercury banking after. Payment module built with manual fallback until Mercury API is wired.

---

## Architecture Decisions

### Auth: Firebase Custom Claims (Replaces `adminUsers` Collection)

**Current**: `AdminAuthProvider` queries `adminUsers/{uid}` doc on every login. Firestore rules call `exists(/adminUsers/{uid})` on **every read and write** — 1 extra billable read per operation, across the entire app.

**New**: Custom claims baked into the auth token:
- `{ admin: true }` for KB
- `{ client: true }` for client accounts
- Rules: `request.auth.token.admin == true` / `request.auth.token.client == true`
- **Zero additional Firestore reads** — the claim is already in `request.auth.token`, which Firebase provides for free on every request. No `get()` or `exists()` calls needed.

### Identity Model: `request.auth.uid` Is the Universal Key
- `request.auth.uid` = the Firebase Auth tenant UID for whoever is logged in
- For KB (admin): `request.auth.uid` = KB's UID, `token.admin == true`
- For a client: `request.auth.uid` = client's UID, `token.client == true`
- `clients/{uid}` doc ID is literally `request.auth.uid` — direct document read, zero queries
- Sub-collections (`clients/{uid}/contracts/...`) inherit this scoping via path wildcard

### Client Login: Firebase Email Link (Passwordless)
- Admin creates client via API route (Admin SDK creates Auth account + sets claims + creates Firestore doc)
- Client visits `/portal/login`, enters email, clicks magic link
- `ClientAuthProvider` checks `claims.client === true`

### Document Storage: Sub-Collections Under Client
**Why sub-collections over flat collections**: `clients/{authId}/contracts/{docId}` is a **direct path-based query** — no composite index needed to get "all of Client X's contracts." Reading a sub-collection doc is **1 read** (no double charge). Admin uses collection group queries for cross-client access.

**Why NOT flat collections with `clientId` field**: Requires a composite index per collection + a query filter on every read. More expensive, more indexes to maintain.

```
clients/{authId}/
  contracts/{docId}
  deliverables/{docId}
  assets/{docId}
  files/{docId}           // "other" category
  messages/{messageId}
  invoices/{invoiceId}
```

### Payments: Mercury Invoicing API (Deferred)
- Zero ACH fees — best for margins
- Manual status updates first, Mercury API wired after LLC + account setup

### DocHub: Link-Based (MVP)
- Admin pastes signing URL on contract record, client clicks to open DocHub

### Messaging: Firestore Real-Time
- Sub-collection `clients/{authId}/messages`, real-time via `onSnapshot`

---

## Firestore Data Model

### Sub-Collections Under `clients/{authId}`

```
clients/{authId}                          // doc ID = Firebase Auth UID
  email: string
  companyName: string
  contactName: string
  status: "active" | "paused" | "archived"
  services: string[]
  notes: string                            // admin-only
  createdAt: Timestamp
  updatedAt: Timestamp

clients/{authId}/contracts/{docId}
  name: string
  fileName: string
  fileUrl: string
  storagePath: string
  fileType: string
  fileSizeBytes: number
  uploadedBy: "client" | "admin"
  signatureStatus: "none" | "pending" | "signed"
  signatureUrl: string | null              // DocHub link
  createdAt: Timestamp

clients/{authId}/deliverables/{docId}
  name: string
  fileName: string
  fileUrl: string
  storagePath: string
  fileType: string
  fileSizeBytes: number
  uploadedBy: "client" | "admin"
  createdAt: Timestamp

clients/{authId}/assets/{docId}
  name: string
  fileName: string
  fileUrl: string
  storagePath: string
  fileType: string
  fileSizeBytes: number
  uploadedBy: "client" | "admin"
  createdAt: Timestamp

clients/{authId}/files/{docId}             // "other" category
  name: string
  fileName: string
  fileUrl: string
  storagePath: string
  fileType: string
  fileSizeBytes: number
  uploadedBy: "client" | "admin"
  createdAt: Timestamp

clients/{authId}/messages/{messageId}
  senderRole: "client" | "admin"
  senderEmail: string
  body: string
  attachmentUrls: string[]
  isRead: boolean
  createdAt: Timestamp

clients/{authId}/invoices/{invoiceId}
  type: "one-time" | "recurring"
  amountCents: number
  currency: string
  description: string
  status: "draft" | "sent" | "pending" | "paid" | "failed" | "refunded"
  mercuryInvoiceId: string | null
  mercuryPaymentUrl: string | null
  paidAt: Timestamp | null
  dueDate: Timestamp | null
  createdAt: Timestamp
```

### Indexes

**No composite indexes needed for client-scoped queries** — sub-collection path provides the scope. Only needed for:
- Collection group queries (admin): `collectionGroup("contracts")` ordered by `createdAt DESC`
- Collection group queries: `collectionGroup("messages")` where `isRead == false` (unread count)

---

## Security Rules

### Firestore (`firestore.rules`)

```javascript
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}

function isClient() {
  return request.auth != null && request.auth.token.client == true;
}

// For sub-collections: clientId comes from the path wildcard
function isOwnerOrAdmin(clientId) {
  return isAdmin() || (isClient() && request.auth.uid == clientId);
}
```

| Path | Admin | Client (own) | Public |
|------|-------|-------------|--------|
| `clients/{clientId}` | full CRUD | read own (uid == clientId) | none |
| `clients/{clientId}/contracts/{docId}` | full CRUD | read + create | none |
| `clients/{clientId}/deliverables/{docId}` | full CRUD | read + create | none |
| `clients/{clientId}/assets/{docId}` | full CRUD | read + create | none |
| `clients/{clientId}/files/{docId}` | full CRUD | read + create | none |
| `clients/{clientId}/messages/{msgId}` | full CRUD | read + create (senderRole: "client") | none |
| `clients/{clientId}/invoices/{invId}` | full CRUD | read only | none |
| `siteSettings`, `services`, etc. | same as before (using `request.auth.token.admin`) | — | same |

**Key advantage**: `isOwnerOrAdmin(clientId)` uses the path wildcard — **zero Firestore `get()` calls** in rules. Just a string comparison against `request.auth.uid`.

### Storage (`storage.rules`)

```javascript
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}

match /site/{allPaths=**} {
  allow read: if true;
  allow write: if isAdmin();
}

match /clients/{clientId}/{allPaths=**} {
  allow read: if isAdmin() || (request.auth != null && request.auth.uid == clientId);
  allow write: if isAdmin()
    || (request.auth != null && request.auth.uid == clientId
      && request.resource.size < 25 * 1024 * 1024);
}
```

---

## Firebase Emulators Setup

### Configuration (`firebase.json` additions)
```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

### Client-Side Connection (`lib/firebase.ts`)
```typescript
if (process.env.NEXT_PUBLIC_USE_EMULATORS === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}
```

### Dev Workflow
- `firebase emulators:start` — launches Auth, Firestore, Storage emulators + Emulator UI at :4000
- `.env.local`: `NEXT_PUBLIC_USE_EMULATORS=true`
- All reads/writes hit local emulators — **zero billable operations**
- Emulator UI at `localhost:4000` for inspecting data, auth users, storage files
- Tests run against emulators (future: automated test suite)

---

## Server-Side API Routes (Firebase Admin SDK)

### `lib/firebase-admin.ts` (server-only)
- Initialize Admin SDK from service account credentials
- Export `adminAuth`, `adminDb`

### `app/api/admin/clients/route.ts`
- **POST**: Create client
  1. Verify caller has `admin` claim (validate ID token from Authorization header)
  2. `adminAuth.createUser({ email, displayName })` — creates Auth account
  3. `adminAuth.setCustomUserClaims(uid, { client: true })` — sets role
  4. `adminDb.doc(clients/${uid}).set({ ... })` — creates Firestore profile
  5. Returns `{ uid, email }` on success

### `app/api/admin/set-claims/route.ts`
- **POST**: Set custom claims on any user (admin-only, or bootstrap secret)

### Bootstrap: `scripts/set-admin-claim.ts`
- One-time script to set `{ admin: true }` on KB's auth UID via Admin SDK

---

## Route Structure

### Portal: `app/portal/`
```
app/portal/
  layout.tsx                       -- dynamic import ClientAuthProvider (ssr: false)
  page.tsx                         -- Dashboard overview
  documents/page.tsx               -- All docs across categories + upload
  contracts/page.tsx               -- Contracts + signature status
  messages/page.tsx                -- Real-time message thread
  invoices/page.tsx                -- Invoice list + pay buttons
  invoices/pay/page.tsx            -- Payment redirect (?invoiceId=xxx)
  settings/page.tsx                -- Profile view
```

### New Admin Routes
```
app/admin/clients/
  page.tsx                         -- Client list
  new/page.tsx                     -- Create client (calls API route)
  edit/page.tsx                    -- Edit client (?id=xxx)
  view/page.tsx                    -- Client detail (?id=xxx) — Docs, Messages, Invoices tabs
```

### API Routes
```
app/api/admin/
  clients/route.ts                 -- POST: create client
  set-claims/route.ts              -- POST: manage custom claims
app/api/mercury/
  webhook/route.ts                 -- POST: Mercury webhooks (Phase 5E)
```

---

## Component Architecture

### UI Component Rename: `components/admin/ui/` → `components/ui/`
Rename to agnostic names now that they're shared across admin + portal:

| Current | New | New Path |
|---------|-----|----------|
| `AdminButton` | `Button` | `components/ui/Button/` |
| `AdminInput` | `Input` | `components/ui/Input/` |
| `AdminTextarea` | `Textarea` | `components/ui/Textarea/` |
| `AdminToggle` | `Toggle` | `components/ui/Toggle/` |
| `AdminBadge` | `Badge` | `components/ui/Badge/` |
| `AdminArrayField` | `ArrayField` | `components/ui/ArrayField/` |
| `AdminCard` | `Card` | `components/ui/Card/` |

**Why not keep `components/{admin|public}/`?** Directory structure doesn't affect code splitting in Next.js — tree-shaking only bundles what's imported. The split is purely organizational. Shared UI belongs in `components/ui/`.

**Role-specific components stay scoped:**
- `components/admin/` — AdminAuthProvider, AdminShell, AdminLogin, admin-specific forms
- `components/portal/` — ClientAuthProvider, ClientShell, ClientLogin, portal-specific views
- `components/public/` — Navbar, Footer (marketing site)

### Portal Components (`components/portal/`)
| Component | Purpose | Pattern Source |
|-----------|---------|---------------|
| `ClientAuthProvider` | Auth gate, checks `claims.client` | mirrors `AdminAuthProvider` |
| `ClientLogin` | Email link sign-in | mirrors `AdminLogin` |
| `ClientShell` | Sidebar + mobile drawer | mirrors `AdminShell` |
| `MessageThread` | Real-time chat (shared portal + admin) | new |
| `FileUpload` | Drag-drop + progress + category | extends upload pattern |
| `DocumentList` | Filter by category, download, signature | new |
| `InvoiceCard` | Status + pay button | new |

### New Lib Files
| File | Purpose |
|------|---------|
| `lib/firebase-admin.ts` | Admin SDK init (server-only) |
| `lib/firestore/portalQueries.ts` | Client-side reads for portal data |
| `lib/firestore/portalMutations.ts` | Client-side writes (messages, uploads) |
| Extend `lib/types.ts` | Portal interfaces |

### New Styles
| File | Purpose |
|------|---------|
| `styles/portal.module.css` | Portal page layout |
| `styles/chat.module.css` | Chat bubbles |

---

## Critical Files to Modify

| File | Change |
|------|--------|
| `firebase.json` | Add emulators config |
| `lib/firebase.ts` | Add emulator connection logic |
| `lib/types.ts` | Add portal interfaces |
| `firestore.rules` | Replace `isAdmin()` with custom claims + add client sub-collection rules |
| `storage.rules` | Replace `isAdmin()` with custom claims + add `clients/` path |
| `components/admin/AdminAuthProvider/AdminAuthProvider.tsx` | Use `idTokenResult.claims.admin` instead of doc check |
| `components/admin/AdminShell/AdminShell.tsx` | Add "Clients" nav item |
| `components/admin/ui/*` | Rename + move to `components/ui/` with agnostic names |
| All admin pages importing `AdminButton` etc. | Update imports to `@/components/ui/Button` etc. |
| `package.json` | Add `firebase-admin` |

---

## Implementation Phases

### Phase 0: Firebase Emulators Setup ✓ COMPLETE
1. Add emulator config to `firebase.json` (auth:9099, firestore:8080, storage:9199, ui:4000)
2. Add emulator connection logic to `lib/firebase.ts` (gated by `NEXT_PUBLIC_USE_EMULATORS`)
3. Add `NEXT_PUBLIC_USE_EMULATORS=true` to `.env.local`
4. Add npm scripts: `"emulators": "firebase emulators:start"`, `"dev:full": "concurrently \"npm run emulators\" \"npm run dev\""`
5. **Test**: `npm run emulators` → Emulator UI at localhost:4000; app connects to local emulators

### Phase 4: Site Polish
1. Seed `siteSettings/main` doc in Firestore (heroHeadline, tagline, etc.)
2. Design pass: pick brand fonts (currently Plus Jakarta Sans + Inter), refine color palette
3. Drag-to-reorder on services/FAQs lists (using SortableList component that already exists)
4. Connect custom domain `techbybrewski.com` in Firebase App Hosting console
5. **Test**: site settings load on public pages; reorder persists; domain resolves

### Phase 5A: Auth Refactor + UI Rename ✓ COMPLETE
1. **UI rename**: Move `components/admin/ui/` → `components/ui/`, rename `AdminButton` → `Button`, etc. Update all imports across admin pages.
2. Install `firebase-admin`
3. Create `lib/firebase-admin.ts` (Admin SDK init)
4. Create `scripts/set-admin-claim.ts` — sets `{ admin: true }` on KB's UID
5. Create `app/api/admin/set-claims/route.ts` — protected claims endpoint
6. Refactor `AdminAuthProvider` — use `getIdTokenResult().claims.admin` instead of doc check
7. Update `firestore.rules` — `isAdmin()` → `request.auth.token.admin == true`
8. Update `storage.rules` — same
9. Run bootstrap script against emulator, verify admin auth works
10. **Test**: `npm run build` passes with new imports; sign in → token has `admin: true` → dashboard loads → no `adminUsers` queries

### Phase 5B: Client Data Model + Admin Management ✓ COMPLETE
1. Add portal types to `lib/types.ts`
2. Add `isClient()`, `isOwnerOrAdmin()`, sub-collection rules to `firestore.rules`
3. Add `clients/{clientId}/` storage rules
4. Create `app/api/admin/clients/route.ts` (create Auth account + claims + Firestore doc)
5. Create `lib/firestore/portalQueries.ts` and `portalMutations.ts`
6. Build `/admin/clients` list, `/admin/clients/new`, `/admin/clients/edit?id=xxx`
7. Add "Clients" to `AdminShell` nav
8. **Test against emulators**: admin creates client → Auth account + claims + doc all created

### Phase 5C: Portal Auth + Shell ✓ COMPLETE
1. Build `ClientLogin` (`sendSignInLinkToEmail` + `isSignInWithEmailLink`)
2. Build `ClientAuthProvider` (checks `claims.client`)
3. Build `ClientShell` (sidebar, mobile drawer, sign-out)
4. Create `app/portal/layout.tsx` + dashboard page (NOTE: `app/portal/` not `app/(portal)/` — route groups conflict with `(public)/page.tsx` at `/`)
5. **Test**: create client in emulator → email link flow → portal dashboard loads

### Phase 5D: Documents + Messages ✓ COMPLETE
1. ✓ Built `FileUpload` (drag-drop, progress bar, category-aware, 25MB validation, Storage upload + Firestore metadata)
2. ✓ Built `DocumentList` (download links, file size display, signature status badges for contracts)
3. ✓ Built `/portal/documents` (category tabs: deliverables/assets/files, upload + list per category)
4. ✓ Built `/portal/contracts` (contract list with signature status + sign links, upload)
5. ✓ Built `MessageThread` (`onSnapshot` real-time, chat bubbles, sender-role-aware styling, auto-mark-read, Enter-to-send)
6. ✓ Built `/portal/messages` page
7. ✓ Built `/admin/clients/view?id=xxx` with Documents (sub-tabs per category + upload), Messages (real-time thread as admin), Invoices (list + mark paid)
8. ✓ Updated `portalMutations.addClientDocument` to accept `uploadedBy` param (client or admin, from auth token)
9. ✓ Updated admin client list to link to view page instead of edit
10. ✓ Created `styles/portal.module.css` (tabs, doc list, empty state) + `styles/chat.module.css` (bubbles, composer, thread layout)
11. ✓ Build passes: 41 pages clean
12. **Test**: upload across categories → storage rules enforced → real-time messages work

### Phase 5E: Invoices + Payments
1. Build `InvoiceCard` (amount, due date, status, pay button)
2. Build `/portal/invoices` page
3. Build admin invoice creation in client detail view
4. Manual status update (pre-Mercury)
5. **Mercury wiring** (after LLC + account):
   - `lib/mercury.ts` — API client
   - Wire invoice creation → Mercury API → stores `mercuryInvoiceId` + `mercuryPaymentUrl`
   - `app/api/mercury/webhook/route.ts` — transaction matching
6. **Test**: invoice CRUD → manual paid → (later) Mercury flow

### Phase 5F: Polish + DocHub
1. DocHub signing URL on contracts
2. Unread message badges (admin dashboard + client list)
3. Portal settings page
4. Mobile polish
5. "Client Portal" link on public Navbar

---

## Verification Plan

| Phase | Verification |
|-------|-------------|
| 0 | ✅ Emulators start; app connects to emulators; Emulator UI shows data |
| 4 | Site settings seeded + loading; reorder works; domain connected |
| 5A | ✅ Admin auth works via custom claims; no `adminUsers` reads; `npm run build` passes |
| 5B | ✅ Client creation via API route works; Auth + claims + Firestore doc all created; 2 clients seeded |
| 5C | ✅ Email link flow end-to-end; `claims.client` checked; unauthorized rejected |
| 5D | ✅ Portal docs/contracts/messages pages built; admin client detail view with tabs; FileUpload + DocumentList + MessageThread components; 41-page build passes. **Pending emulator test**: upload across categories, storage rules, real-time messages |
| 5E | Invoice CRUD; manual status; Mercury wired after account setup |
| 5F | DocHub links; unread badges; mobile usable |

---

## Environment Variables

```env
# Firebase Admin SDK (server-only)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Emulators (dev only)
NEXT_PUBLIC_USE_EMULATORS=true

# Portal
NEXT_PUBLIC_PORTAL_URL=https://techbybrewski.com/portal

# Mercury (after LLC + account)
MERCURY_API_KEY=...
MERCURY_WEBHOOK_SECRET=...
```
