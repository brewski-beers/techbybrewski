/**
 * TechByBrewski — Firestore Emulator Seed Script
 *
 * Targets the local emulator — no service account needed.
 *
 * Usage:
 *   1. Start emulators:  npm run emulators
 *   2. In another terminal: npm run seed:emulator
 */

// Must be set BEFORE firebase-admin is imported
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Emulator doesn't require credentials
initializeApp({ projectId: "techbybrewski-site" });
const db = getFirestore();
const auth = getAuth();

// ── Data ──────────────────────────────────────────────────────

const siteSettings = {
  brandName: "TechByBrewski",
  tagline: "Custom software that works for your business.",
  heroHeadline: "We build software that scales with you.",
  heroSubheadline:
    "From internal tools to client-facing platforms — custom-built, Firebase-powered, and production-ready from day one.",
  primaryCTAType: "contact",
  calendlyUrl: "",
  contactEmail: "hello@techbybrewski.com",
  socialLinks: {
    linkedin: "",
    github: "https://github.com/TechByBrewski",
    instagram: "",
  },
  seoDefaults: {
    titleTemplate: "%s | TechByBrewski",
    defaultDescription:
      "TechByBrewski builds custom web applications, internal tools, and Firebase-powered systems for growing businesses.",
  },
};

const services = [
  {
    name: "Custom Web Applications",
    slug: "custom-web-applications",
    summary:
      "Full-stack web apps built for your specific workflow — not off-the-shelf software that almost fits.",
    bullets: [
      "React / Next.js frontend",
      "Firebase backend (Auth, Firestore, Storage)",
      "Mobile-first, accessible UI",
      "Production deployment included",
    ],
    useCases: [
      "Replace a spreadsheet-driven process",
      "Internal team tools and dashboards",
      "Client portals and self-service platforms",
    ],
    order: 0,
    isActive: true,
    isPublished: true,
  },
  {
    name: "Firebase Architecture & Migration",
    slug: "firebase-architecture",
    summary:
      "Design or migrate your system to Firebase — security rules, data modeling, and cost-optimized architecture.",
    bullets: [
      "Firestore data model design",
      "Security rules (Firestore + Storage)",
      "Auth setup and role management",
      "Migration from SQL or other NoSQL",
    ],
    useCases: [
      "Startups moving from Supabase or Postgres",
      "Teams inheriting a Firebase project in bad shape",
      "New projects needing a solid data foundation",
    ],
    order: 1,
    isActive: true,
    isPublished: true,
  },
  {
    name: "Internal Tools & Admin Systems",
    slug: "internal-tools",
    summary:
      "Custom admin dashboards and internal tools that your team will actually use — designed for real workflows.",
    bullets: [
      "Role-based access control",
      "CRUD interfaces with audit logging",
      "Data export and reporting",
      "Integrations with existing systems",
    ],
    useCases: [
      "Operations teams managing complex data",
      "Replacing expensive SaaS tools with custom-built solutions",
      "Companies needing a CMS tailored to their content",
    ],
    order: 2,
    isActive: true,
    isPublished: true,
  },
];

const caseStudies = [
  {
    title: "Client Portal for Operations Team",
    slug: "client-portal-operations",
    clientName: "Confidential",
    industry: "Professional Services",
    overview:
      "Built a secure client portal replacing a manual email/spreadsheet process, cutting onboarding time by 60%.",
    problem: [
      "Client onboarding took 2–3 weeks due to manual data collection via email",
      "No visibility into document status for either team or clients",
      "Sensitive data was stored in shared drives with no access control",
    ],
    solution: [
      "Custom Next.js portal with Firebase Auth for secure client logins",
      "Structured Firestore data model with role-based rules",
      "Real-time status updates so clients always know where they stand",
      "Admin dashboard for the internal team to manage submissions",
    ],
    outcomes: [
      "Onboarding time reduced from 3 weeks to 4 days",
      "Zero data compliance issues post-launch",
      "Client satisfaction scores increased 40%",
    ],
    stack: ["Next.js", "Firebase", "Firestore", "Firebase Auth", "Firebase Storage"],
    images: [],
    featured: true,
    order: 0,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
  },
];

const testimonials = [
  {
    quote:
      "TechByBrewski delivered exactly what we needed — a system that actually fits our workflow instead of forcing us to adapt to it. The attention to detail in the admin interface is remarkable.",
    name: "Sample Client",
    title: "Operations Director",
    company: "Example Co.",
    avatarUrl: "",
    order: 0,
    isPublished: false,
  },
];

const faqs = [
  {
    question: "What's your typical project timeline?",
    answer:
      "Most projects run 4–12 weeks depending on scope. We start with a discovery call to scope the work, then provide a detailed timeline before any contract is signed.",
    category: "Process",
    order: 0,
    isPublished: true,
  },
  {
    question: "Do you work with startups or only established companies?",
    answer:
      "Both. We've worked with solo founders, growing startups, and established operations teams. What matters is that you have a clear problem to solve.",
    category: "Process",
    order: 1,
    isPublished: true,
  },
  {
    question: "Why Firebase instead of a traditional database?",
    answer:
      "Firebase gives you real-time data sync, built-in auth, file storage, and hosting under one platform — which is ideal for lean teams that want to move fast without managing infrastructure. We'll tell you if it's not the right fit for your use case.",
    category: "Technical",
    order: 2,
    isPublished: true,
  },
  {
    question: "Do you offer ongoing support after launch?",
    answer:
      "Yes. We offer retainer-based support for monitoring, updates, and feature additions. Most clients continue working with us after the initial build.",
    category: "Process",
    order: 3,
    isPublished: true,
  },
];

// ── Client seed data ──────────────────────────────────────────

const CLIENT_SEEDS = [
  {
    email: "maya@rushnrelax.com",
    contactName: "Maya Chen",
    companyName: "Rush-N-Relax",
    status: "active",
    services: ["Custom Web Applications", "Firebase Architecture"],
    notes: "MVP client — built the booking platform. Recurring retainer for feature work.",
    contracts: [
      {
        name: "Master Service Agreement",
        fileName: "msa-rushrelax-2025.pdf",
        fileUrl: "https://example.com/files/msa-rushrelax-2025.pdf",
        storagePath: "clients/PLACEHOLDER/contracts/msa-rushrelax-2025.pdf",
        fileType: "application/pdf",
        fileSizeBytes: 124000,
        uploadedBy: "admin",
        signatureStatus: "signed",
        signatureUrl: null,
      },
      {
        name: "SOW — Phase 2 Feature Build",
        fileName: "sow-rushrelax-phase2.pdf",
        fileUrl: "https://example.com/files/sow-rushrelax-phase2.pdf",
        storagePath: "clients/PLACEHOLDER/contracts/sow-rushrelax-phase2.pdf",
        fileType: "application/pdf",
        fileSizeBytes: 88000,
        uploadedBy: "admin",
        signatureStatus: "pending",
        signatureUrl: "https://docusign.example.com/sign/abc123",
      },
    ],
    deliverables: [
      {
        name: "Booking Platform v1.0 — Source Code",
        fileName: "rushrelax-v1-source.zip",
        fileUrl: "https://example.com/files/rushrelax-v1-source.zip",
        storagePath: "clients/PLACEHOLDER/deliverables/rushrelax-v1-source.zip",
        fileType: "application/zip",
        fileSizeBytes: 2400000,
        uploadedBy: "admin",
      },
    ],
    invoices: [
      {
        type: "one-time",
        amountCents: 500000,
        currency: "USD",
        description: "Phase 1 — Booking platform build",
        status: "paid",
        mercuryInvoiceId: null,
        mercuryPaymentUrl: null,
        paidAt: new Date("2025-11-01"),
        dueDate: new Date("2025-11-01"),
      },
      {
        type: "recurring",
        amountCents: 150000,
        currency: "USD",
        description: "Monthly retainer — March 2026",
        status: "sent",
        mercuryInvoiceId: null,
        mercuryPaymentUrl: null,
        paidAt: null,
        dueDate: new Date("2026-03-31"),
      },
    ],
    messages: [
      {
        senderRole: "admin",
        senderEmail: "hello@techbybrewski.com",
        body: "Hey Maya! Phase 2 SOW is ready for your review and signature. Let me know if you have any questions.",
        attachmentUrls: [],
        isRead: true,
      },
      {
        senderRole: "client",
        senderEmail: "maya@rushnrelax.com",
        body: "Thanks! I'll review this week. Quick question — does Phase 2 include the staff scheduling module or is that Phase 3?",
        attachmentUrls: [],
        isRead: true,
      },
      {
        senderRole: "admin",
        senderEmail: "hello@techbybrewski.com",
        body: "Staff scheduling is Phase 3. Phase 2 is just the rebooking flow, cancellation policy enforcement, and the reporting dashboard.",
        attachmentUrls: [],
        isRead: false,
      },
    ],
  },
  {
    email: "dan@treadwellco.com",
    contactName: "Dan Treadwell",
    companyName: "Treadwell & Co.",
    status: "active",
    services: ["Internal Tools & Admin Systems"],
    notes: "Ops team needed an inventory + audit trail system. Project kicked off Feb 2026.",
    contracts: [
      {
        name: "Master Service Agreement",
        fileName: "msa-treadwell-2026.pdf",
        fileUrl: "https://example.com/files/msa-treadwell-2026.pdf",
        storagePath: "clients/PLACEHOLDER/contracts/msa-treadwell-2026.pdf",
        fileType: "application/pdf",
        fileSizeBytes: 118000,
        uploadedBy: "admin",
        signatureStatus: "signed",
        signatureUrl: null,
      },
    ],
    deliverables: [],
    invoices: [
      {
        type: "one-time",
        amountCents: 350000,
        currency: "USD",
        description: "Inventory & audit trail system — Phase 1",
        status: "pending",
        mercuryInvoiceId: null,
        mercuryPaymentUrl: null,
        paidAt: null,
        dueDate: new Date("2026-04-15"),
      },
    ],
    messages: [
      {
        senderRole: "admin",
        senderEmail: "hello@techbybrewski.com",
        body: "Welcome to the portal, Dan! You can upload any reference docs here and I'll keep your deliverables updated as we build.",
        attachmentUrls: [],
        isRead: true,
      },
      {
        senderRole: "client",
        senderEmail: "dan@treadwellco.com",
        body: "Great, thanks. I'll upload the existing spreadsheet templates so you have context on our current process.",
        attachmentUrls: [],
        isRead: false,
      },
    ],
  },
];

// ── Seed functions ────────────────────────────────────────────

async function seedSiteSettings() {
  await db.doc("siteSettings/main").set(siteSettings, { merge: true });
  console.log("  siteSettings/main");
}

async function seedCollection(collectionName, items, { force = false } = {}) {
  if (!force) {
    const existing = await db.collection(collectionName).limit(1).get();
    if (!existing.empty) {
      console.log(`  ${collectionName}: already has data — skipping (use --force to overwrite)`);
      return;
    }
  }
  const batch = db.batch();
  for (const item of items) {
    batch.set(db.collection(collectionName).doc(), item);
  }
  await batch.commit();
  console.log(`  ${collectionName} (${items.length} doc${items.length !== 1 ? "s" : ""})`);
}

async function seedClients(force = false) {
  const existing = await db.collection("clients").limit(1).get();
  if (!existing.empty && !force) {
    console.log("  clients: already has data — skipping (use --force to overwrite)");
    return;
  }

  for (const client of CLIENT_SEEDS) {
    // Create or reuse Auth user
    let uid;
    try {
      const existing = await auth.getUserByEmail(client.email);
      uid = existing.uid;
      console.log(`  auth: reusing ${client.email} (${uid})`);
    } catch {
      const user = await auth.createUser({ email: client.email, displayName: client.contactName });
      uid = user.uid;
      console.log(`  auth: created ${client.email} (${uid})`);
    }

    // Set client claim
    await auth.setCustomUserClaims(uid, { client: true });

    // Firestore client doc
    await db.doc(`clients/${uid}`).set({
      email: client.email,
      companyName: client.companyName,
      contactName: client.contactName,
      status: client.status,
      services: client.services,
      notes: client.notes,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Sub-collections
    const now = FieldValue.serverTimestamp();

    for (const contract of client.contracts) {
      await db.collection(`clients/${uid}/contracts`).add({
        ...contract,
        storagePath: contract.storagePath.replace("PLACEHOLDER", uid),
        createdAt: now,
      });
    }

    for (const deliverable of client.deliverables) {
      await db.collection(`clients/${uid}/deliverables`).add({
        ...deliverable,
        storagePath: deliverable.storagePath.replace("PLACEHOLDER", uid),
        createdAt: now,
      });
    }

    for (const invoice of client.invoices) {
      await db.collection(`clients/${uid}/invoices`).add({
        ...invoice,
        createdAt: now,
      });
    }

    for (const msg of client.messages) {
      await db.collection(`clients/${uid}/messages`).add({
        ...msg,
        createdAt: now,
      });
    }

    console.log(
      `  clients/${uid} (${client.companyName}) — ` +
      `${client.contracts.length} contracts, ${client.deliverables.length} deliverables, ` +
      `${client.invoices.length} invoices, ${client.messages.length} messages`
    );
  }
}

async function seedAdmin() {
  const email = "kbbeers08@gmail.com";
  let uid;
  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    console.log(`  auth: reusing admin ${email} (${uid})`);
  } catch {
    const user = await auth.createUser({ email, displayName: "KB" });
    uid = user.uid;
    console.log(`  auth: created admin ${email} (${uid})`);
  }
  await auth.setCustomUserClaims(uid, { admin: true });
  console.log(`  admin claim set on ${uid}`);
}

// ── Run ───────────────────────────────────────────────────────

const force = process.argv.includes("--force");

async function main() {
  console.log("\nSeeding TechByBrewski emulator Firestore...\n");
  if (force) console.log("  --force: existing collections will be overwritten\n");

  await seedAdmin();
  await seedSiteSettings();
  await seedCollection("services", services, { force });
  await seedCollection("caseStudies", caseStudies, { force });
  await seedCollection("testimonials", testimonials, { force });
  await seedCollection("faqs", faqs, { force });
  await seedClients(force);

  console.log("\nDone. Emulator data is ready.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message, "\n");
  process.exit(1);
});
