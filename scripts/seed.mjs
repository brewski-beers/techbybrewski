/**
 * TechByBrewski — Firestore Seed Script
 *
 * Usage:
 *   1. Download your service account key:
 *      Firebase Console → Project Settings → Service accounts → Generate new private key
 *      Save as scripts/service-account.json (already gitignored)
 *
 *   2. Run:
 *      node scripts/seed.mjs
 *
 * Safe to run multiple times — uses set() with merge on siteSettings,
 * and checks before inserting collections to avoid duplicates.
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { createRequire } from "module";
import { existsSync } from "fs";

const require = createRequire(import.meta.url);
const SA_PATH = new URL("./service-account.json", import.meta.url).pathname;

if (!existsSync(SA_PATH)) {
  console.error("\n❌  Missing service-account.json");
  console.error("   Download it from: Firebase Console → Project Settings → Service accounts → Generate new private key");
  console.error("   Save it as: scripts/service-account.json\n");
  process.exit(1);
}

const serviceAccount = require(SA_PATH);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

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
  {
    name: "AI Infrastructure",
    slug: "ai-infrastructure",
    summary:
      "We build the custom AI routing, validation, and context resolution layer your product needs — implemented on your infrastructure, not a third-party subscription.",
    bullets: [
      "Provider-agnostic: works with any LLM or agent framework",
      "Intelligent task routing with explainable agent dispatch",
      "Output validation and automatic repair for reliable AI responses",
      "Hierarchical context resolution for project- and environment-aware agents",
      "Build + optional maintenance retainer — we own it with you long-term",
    ],
    useCases: [
      "Multi-agent products that need reliable, cost-efficient task dispatch",
      "AI features that break in production due to malformed or unreliable outputs",
      "Teams that need their agents to be context-aware without hardcoding config",
      "Founders who want a custom AI execution layer, not another SaaS dependency",
    ],
    order: 3,
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
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
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
    isPublished: false, // Set to true once you have a real testimonial
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

// ── Seed functions ────────────────────────────────────────────

async function seedSiteSettings() {
  await db.doc("siteSettings/main").set(siteSettings, { merge: true });
  console.log("✓  siteSettings/main");
}

async function seedCollection(collectionName, items) {
  const existing = await db.collection(collectionName).limit(1).get();
  if (!existing.empty) {
    console.log(`⚠  ${collectionName}: already has data — skipping (delete manually to re-seed)`);
    return;
  }
  for (const item of items) {
    await db.collection(collectionName).add(item);
  }
  console.log(`✓  ${collectionName} (${items.length} doc${items.length !== 1 ? "s" : ""})`);
}

// ── Run ───────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱  Seeding TechByBrewski Firestore...\n");

  await seedSiteSettings();
  await seedCollection("services", services);
  await seedCollection("caseStudies", caseStudies);
  await seedCollection("testimonials", testimonials);
  await seedCollection("faqs", faqs);
  await seedCollection("blogPosts", blogPosts);

  console.log("\n✅  Done. Open your admin to review and publish content.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌  Seed failed:", err.message, "\n");
  process.exit(1);
});

const blogPosts = [
  {
    title: "How I Built a Multi-Agent AI Operating System",
    slug: "how-i-built-a-multi-agent-ai-operating-system",
    excerpt:
      "Every AI team eventually rebuilds the same infrastructure — routing, context, memory. Here's how I built a system that handles all of it, running daily across multiple production projects.",
    content: `# How I Built a Multi-Agent AI Operating System

Every AI team eventually rebuilds the same infrastructure. Routing logic. Context injection. Memory that persists between runs. Most teams hardcode it, live with the debt, then rebuild it six months later when the requirements change.

I built something different. BrewCortex is a multi-agent operating system I run daily across multiple software projects. It's not a framework, not a hosted product — it's a custom AI execution layer that handles intelligent dispatch, hierarchical context resolution, and accumulated agent memory. This post walks through why it exists, how it works, and what patterns made the difference.

## The Problem

When you start building seriously with AI agents, three problems surface quickly.

**Routing.** Which agent handles which task? The naive answer is a big if/else chain or a prompt that says "figure it out." Both fail under real load. The if/else chain becomes unmaintainable. The "figure it out" approach is slow, expensive, and inconsistent at boundaries.

**Context.** Agents need to know things: which project they're working on, what conventions apply, what tools are available, what the user's preferences are. Injecting this manually into every prompt doesn't scale. Hardcoding it per-agent creates drift. You need a resolution layer.

**Memory.** A session-level context window is not memory. Memory is accumulated knowledge that improves future runs. Without it, every agent invocation starts cold. With it, the system gets smarter over time.

These three problems aren't independent — they're a stack. Memory informs context. Context informs routing. Routing determines what gets executed. If you solve them independently, you get fragile integrations. Solve them as a unified layer and you get a system.

## The Architecture

BrewCortex has four logical layers.

## System Diagram

At a high level, the system looks like this:

```
Task Input
    |
    v
[ Routing Layer ]
  Fast rules table (25 rules)
  -> If ambiguous: LLM router (structured JSON output)
    |
    v
[ Context Resolution ]
  Global defaults -> Project config -> Agent config -> Memory -> Session
    |
    v
[ Agent Execution ]
  Selected agent receives resolved context + task
    |
    v
[ Memory Write ]
  Agent appends non-obvious findings to memory layer
    |
    v
[ PR / Output ]
  Commit, branch, pull request — fully autonomous
```

Each layer is independent and replaceable. The routing layer doesn't know about memory. The context layer doesn't know about routing. They compose cleanly because they're designed as separate concerns.

### 1. Dynamic Agent Registry

Each agent is defined by its capabilities, not its name. The registry maps work types (code changes, content, research, infrastructure, design) to the appropriate agent, model, and cost tier. New agents are registered in one place; routing picks them up automatically.

This matters because hardcoded dispatch is a maintenance trap. Every time you add an agent, you have to update every place that might need to call it. With a registry-driven approach, the orchestrator discovers agents dynamically at decision time.

### 2. Hybrid Routing

The routing layer uses a two-pass approach. The first pass is fast: a rules table (~25 rules in the current implementation) that covers known work types. Pattern-match on the task description, get an agent back in microseconds.

The second pass is LLM-powered and handles ambiguous cases — tasks that match multiple rules, novel task types, or anything that crosses domain boundaries. The LLM gets the task, the registry of available agents, and a prompt to return structured JSON: agent selection, confidence, reasoning, model recommendation.

The result is a routing layer that's fast for common cases and intelligent for edge cases, without being expensive across the board.

### 3. Hierarchical Context Resolution

Context is resolved in five layers, each overriding the previous:

1. **Global defaults** — applies everywhere (coding standards, commit conventions, output format preferences)
2. **Project config** — per-project context injected from the project's CLAUDE.md
3. **Agent config** — agent-specific instructions, tools, and constraints
4. **Memory** — accumulated expertise from prior sessions
5. **Session overrides** — ephemeral context injected at invocation time

When an agent starts work, it doesn't receive a manually assembled prompt. It receives the resolved output of this stack, with the right context for the right job, automatically.

### 4. Agent Memory

Memory in BrewCortex is a four-layer model:

- **Project memory** — decisions, patterns, and conventions specific to a project
- **Agent memory** — domain expertise accumulated across sessions (routing corrections, gotchas, process learnings)
- **Session memory** — what happened in the current invocation
- **Cross-project memory** — patterns that apply globally across all projects

Memory is written explicitly — agents append findings to structured markdown files at the end of each session. It's not automatic vector embedding of everything (that creates noise). It's curated, human-readable, and searchable. The signal-to-noise ratio is high because the agents decide what's worth writing.

## What Actually Made It Work

Three patterns made the difference between a proof-of-concept and something that runs reliably in production every day.

**Explicit memory writes.** The temptation is to auto-capture everything. Don't. Have agents append only non-obvious findings: routing corrections, project gotchas, process improvements. When memory is curated, agents actually read it. When it's everything, nobody reads it.

**Conventional commit discipline.** Every agent output that touches code follows conventional commits: `feat|fix|refactor|chore|docs|test|perf|ci`. This is enforced by context, not by hooks. The result is a commit history that's readable and reviewable — which matters when autonomous agents are producing dozens of commits per week.

**Sequential single-ticket work.** Parallel agent execution sounds powerful. In practice, when multiple agents write to the same working tree, you get branch collisions, stale index problems, and hard-to-debug state corruption. The current model is sequential: one ticket, one agent, one branch, one PR. Simple. Reliable.

## Results

BrewCortex runs across four active repositories. In a typical week, it opens and closes 15-20 GitHub issues autonomously — feature additions, bug fixes, content creation, infrastructure work. Each one goes through the full lifecycle: claim, branch, execute, PR, review.

Qualitatively: I spend almost no time on task dispatch or context assembly. I spend time on architecture decisions, review, and direction. The system handles the execution.

## We Build This for Clients Too

BrewCortex is our internal proof. Every capability described here — intelligent routing, hierarchical context resolution, accumulated agent memory — is a deliverable we build for clients on their infrastructure.

If your team is hitting the walls described above (brittle routing, hardcoded context, agents that start cold every run), we can fix that. It's not a subscription. It's a custom build, delivered on your stack.

[See our AI Infrastructure service →](/services/ai-infrastructure)`,
    coverImageUrl: "",
    tags: ["ai", "infrastructure", "multi-agent", "architecture"],
    author: "KB",
    isPublished: true,
    publishedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
];
