/**
 * TechByBrewski — Blog Seed Script
 *
 * Seeds 10 backdated blog posts into Firestore.
 *
 * Usage:
 *   node scripts/seed-blog.mjs
 *
 * Requires scripts/service-account.json (gitignored).
 * Safe to re-run — skips posts whose slug already exists.
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { createRequire } from "module";
import { existsSync } from "fs";

const require = createRequire(import.meta.url);
const SA_PATH = new URL("./service-account.json", import.meta.url).pathname;

if (!existsSync(SA_PATH)) {
  console.error("\n❌  Missing service-account.json");
  console.error("   Firebase Console → Project Settings → Service accounts → Generate new private key");
  console.error("   Save as: scripts/service-account.json\n");
  process.exit(1);
}

const serviceAccount = require(SA_PATH);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function ts(isoString) {
  return Timestamp.fromDate(new Date(isoString));
}

const posts = [
  {
    title: "Why I Stopped Chasing Every New Framework",
    slug: "why-i-stopped-chasing-every-new-framework",
    excerpt:
      "The web dev ecosystem moves fast. After years of hopping frameworks I finally found a stack I can stop second-guessing — and why that matters for clients.",
    content: `There's a new JavaScript framework every six months. A new meta-framework every year. A new rendering strategy every quarter. For a while I tried to keep up with all of it.

That was a mistake.

Not because learning is bad — learning is great. The mistake was letting novelty drive stack decisions instead of outcomes. Every time I switched frameworks I paid a tax: ramp-up time, dead documentation, half-baked tooling, and edge cases that weren't discovered yet because nobody had run it in production long enough.

## What I settled on and why

Next.js with the App Router covers most of what I build: marketing sites, client portals, content-heavy apps. It has React Server Components for real performance, a mature deployment story on Vercel, and enough community surface area that when I hit a weird edge case, someone else has usually hit it first.

Firebase handles auth and data. It's not perfect — the security rules syntax has a learning curve and the free tier limits will surprise you if you're not watching — but the operational overhead is nearly zero. No database to manage. No auth server to maintain. For a solo shop, that's worth a lot.

TypeScript is non-negotiable at this point. The tooling is too good and the feedback loop is too fast to write plain JavaScript on anything that lasts longer than a weekend.

## The client angle

Clients don't care what framework you use. They care whether the site is fast, whether it works on mobile, and whether they can update their content without calling you. Stable, well-supported tools make that easier to deliver consistently.

When a client comes back six months later to add a feature, I don't want to be relearning a framework I adopted prematurely. I want to open the repo and know exactly where I am.

## The actual cost of chasing shiny things

Every hour spent evaluating a new tool is an hour not spent building. That's fine for side projects and learning — genuinely fine. But on client work it's a liability unless the new tool directly solves a problem you actually have.

I still try new things. But I try them on personal projects first, run them to a point where I've hit the rough edges, and only then consider whether they belong in the production stack.

The framework treadmill is real. Getting off it was one of the better decisions I've made as a developer.`,
    tags: ["opinion", "stack", "javascript", "agency"],
    author: "KB",
    isPublished: true,
    publishedAt: "2025-09-08T09:00:00.000Z", // Back to school / fall planning season
  },
  {
    title: "Firebase Security Rules: The Gotcha That Will Burn You",
    slug: "firebase-security-rules-the-gotcha-that-will-burn-you",
    excerpt:
      "If you add a new Firestore collection and forget to write rules for it, the Admin SDK keeps working fine — but your client SDK goes silent. Here's what to watch for.",
    content: `Firestore security rules have a catch that trips up a lot of developers, including me.

The default deny-all rule that ships with most Firebase projects — \`allow read, write: if false;\` — blocks all client SDK access to any collection that doesn't have an explicit rule. Makes sense. But here's the part that gets people: **the Admin SDK bypasses security rules entirely**.

So when you're testing in your server-side code, everything works. When you're testing in the browser with the client SDK, you get silent failures, empty results, or permission-denied errors that don't always bubble up clearly.

## The pattern that bites you

You add a new collection — let's say \`testimonials\` — and you seed it using the Admin SDK in a script. The data is in Firestore. Your server-side page that uses the Admin SDK reads it fine. You deploy. The page looks great.

Then someone builds the client-side version of that same feature. No data. No visible error. Just an empty array where there should be ten documents.

You spend an hour debugging the query before you check the rules.

## The fix is simple, but you have to know to do it

Every time you add a collection, add a rule for it in the same PR. Period. Don't leave it for later. "Later" is when you're debugging a production issue at 11pm.

For public read / admin write:

\`\`\`
match /testimonials/{docId} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.admin == true;
}
\`\`\`

For admin-only (like draft blog posts):

\`\`\`
match /blogPosts/{docId} {
  allow read: if resource.data.isPublished == true
               || (request.auth != null && request.auth.token.admin == true);
  allow write: if request.auth != null && request.auth.token.admin == true;
}
\`\`\`

## Test your rules, don't assume

The Firebase emulator has a rules simulator. Use it. It will catch permission issues before they reach production. The Firebase console also has a Rules Playground if you want to spot-check without running the full emulator stack.

The Admin SDK is great for server-side data access — but its ability to bypass rules means it will not catch rules problems for you. Build the habit of writing rules alongside your collections, and you'll save yourself a lot of head-scratching.`,
    tags: ["firebase", "firestore", "security", "backend"],
    author: "KB",
    isPublished: true,
    publishedAt: "2025-09-29T09:00:00.000Z", // Spooky season: dev horror stories edition
  },
  {
    title: "How AI Coding Tools Actually Changed My Workflow",
    slug: "how-ai-coding-tools-actually-changed-my-workflow",
    excerpt:
      "Not a hype piece. After a year of daily use, here's what AI coding assistants are genuinely good at, where they waste your time, and the one workflow shift that made the biggest difference.",
    content: `I've been using AI coding assistants daily for over a year now. Long enough to have moved past the initial excitement and also past the inevitable backlash phase. Here's where I actually landed.

## What they're genuinely good at

**Boilerplate and scaffolding.** Setting up a new API route, writing a TypeScript interface from a JSON shape, generating a form with validation — tasks that are mechanical and time-consuming but don't require deep problem-solving. This is where AI assistance pays back immediately.

**Searching unfamiliar APIs.** Instead of tabbing to the docs every five minutes, I can ask "what's the syntax for a Firestore composite query with an inequality filter" and get a working example in context. I still verify against the docs, but the first draft is usually close enough to be useful.

**Explaining code I didn't write.** Open a file I haven't touched in six months and ask what a particular function is doing. Faster than re-reading it cold.

## Where it wastes time

**Overconfident wrong answers.** The model will generate code that looks completely plausible but contains a subtle bug or uses a deprecated API. If you're not experienced enough to catch it, you can end up spending more time debugging AI output than you would have spent writing it yourself.

**Large refactors.** The further a task gets from a self-contained chunk, the worse the output gets. "Refactor this entire module to use a different data model" usually produces something that compiles but breaks the surrounding context in ways that aren't obvious.

**Architecture decisions.** AI will give you an answer to any architecture question you ask. That answer will sound confident. It's frequently not the right answer for your specific constraints. Use it for ideas, not decisions.

## The workflow shift that actually helped

Stop using it as an autocomplete that runs in the background. Start using it as a pair programmer you consult deliberately.

I write the structure and the logic myself. When I hit something mechanical — writing out 20 similar test cases, generating TypeScript types from a schema, stubbing out a component — I switch to the AI. When I'm done with the mechanical part, I read everything it wrote before accepting it.

That combination — me driving, AI handling the tedious parts — is where I get the real productivity gain. Letting it drive while I watch is where I lose time.`,
    tags: ["ai", "productivity", "tooling", "opinion"],
    author: "KB",
    isPublished: true,
    publishedAt: "2025-10-20T09:00:00.000Z", // Halloween week: "AI is taking our jobs" season
  },
  {
    title: "Get Your Small Business Site Ready Before the Holiday Rush",
    slug: "get-your-small-business-site-ready-before-the-holiday-rush",
    excerpt:
      "Black Friday is two weeks out. If your website is slow, hard to navigate, or missing a clear call to action — you're leaving money on the table. Here's the fast-fix checklist.",
    content: `I've built and audited a lot of small business websites. The gap between what business owners think they need and what actually helps them is bigger than most people realize.

## What they think they need

- A flashy homepage with animation
- Every service listed on every page
- A contact form buried in a footer
- SEO (vaguely defined, never measured)
- "Something that looks modern"

## What actually moves the needle

**Clear answer to "can you help me?"** A visitor to a small business website has one question: can this person solve my problem? That question should be answered in the first five seconds. If your homepage headline is your company name and tagline but doesn't describe what you do, you're already losing people.

**A phone number or contact option visible without scrolling.** I can't tell you how many sites I've audited where the phone number is three clicks deep. For service businesses especially — plumbing, HVAC, legal, medical — people want to call. Make it easy.

**Social proof near the top, not at the bottom.** Testimonials and reviews are your most powerful content. Most sites bury them in a testimonials page nobody visits. Put them on the homepage, near the top, next to the service descriptions.

**Fast load time on mobile.** Over half of local service searches happen on a phone. A site that takes four seconds to load on a mobile connection loses those visitors before they read a word.

**A clear next step.** Every page should have one obvious thing to do. Not five options — one. "Book a free consultation." "Call now." "Get a quote." Decision paralysis is real. Make it easy to take the next step.

## What they can skip (for now)

You don't need a blog if you won't commit to writing. An empty blog or one with a post from 2019 is worse than no blog at all — it signals neglect.

You don't need a complex CMS unless you're genuinely going to update content regularly. A static site that's fast and clear beats a WordPress site with twelve plugins that's slow and confusing.

You don't need to rank for every keyword. Rank for the two or three things your ideal customer is actually searching for in your area. That's it.

## The actual goal

The website's job is to get a qualified lead to take the next step. Everything else is secondary. Measure that — calls, form submissions, booked appointments — and optimize for it. Not for how it looks.`,
    tags: ["small-business", "web-strategy", "seo", "agency"],
    author: "KB",
    isPublished: true,
    publishedAt: "2025-11-10T09:00:00.000Z", // 2 weeks before Black Friday — "get your site ready" hook
  },
  {
    title: "12 Days of TypeScript: Patterns Worth Keeping",
    slug: "12-days-of-typescript-patterns-worth-keeping",
    excerpt:
      "Cyber Monday deals are done. Here's something actually useful: the TypeScript patterns I reach for on every project that consistently reduce bugs without overengineering.",
    content: `TypeScript's value is in the feedback loop, not the type annotations. Here are the patterns that actually earn their keep on production projects.

## Strict mode, always

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
\`\`\`

\`noUncheckedIndexedAccess\` is not included in \`strict\` but should be. It makes array and record indexing return \`T | undefined\` instead of \`T\`, forcing you to handle the case where the element doesn't exist. You'll fix several real bugs the first time you turn it on.

## Branded types for IDs

\`\`\`typescript
type UserId = string & { readonly __brand: "UserId" };
type PostId = string & { readonly __brand: "PostId" };

function getUser(id: UserId) { ... }
\`\`\`

Passing a \`PostId\` to \`getUser\` is now a type error. This sounds like overkill until you've shipped a bug where you passed the wrong ID to the wrong function. Takes five minutes to set up per entity type.

## Discriminated unions over optional fields

Instead of:

\`\`\`typescript
type ApiResult<T> = {
  data?: T;
  error?: string;
  loading?: boolean;
};
\`\`\`

Use:

\`\`\`typescript
type ApiResult<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };
\`\`\`

Now TypeScript knows which fields are available in each branch. No more \`if (result.data && !result.error && !result.loading)\` guards.

## \`satisfies\` for config objects

The \`satisfies\` operator (available since TypeScript 4.9) lets you validate a value against a type while preserving the literal type:

\`\`\`typescript
const routes = {
  home: "/",
  blog: "/blog",
  contact: "/contact",
} satisfies Record<string, string>;

// routes.home is typed as "/" not string
\`\`\`

Useful for route maps, config objects, and anything where you want both validation and autocomplete on the specific keys.

## \`zod\` at system boundaries

Don't trust external data — API responses, form submissions, URL params. Parse and validate them with Zod at the boundary. Inside the app, the data is typed. Outside the boundary, it's \`unknown\`.

\`\`\`typescript
const PostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  publishedAt: z.string().datetime().nullable(),
});

type Post = z.infer<typeof PostSchema>;
\`\`\`

The schema is the source of truth for both validation and the TypeScript type.

These patterns don't make the codebase more complex — they reduce the class of bugs that TypeScript can catch, which is the whole point.`,
    tags: ["typescript", "patterns", "dx", "engineering"],
    author: "KB",
    isPublished: true,
    publishedAt: "2025-12-01T09:00:00.000Z", // Cyber Monday — "best deal: write better code"
  },
  {
    title: "New Year, New Scope: How to Stop Underestimating Projects",
    slug: "new-year-new-scope-stop-underestimating-projects",
    excerpt:
      "End-of-year is when clients start planning next year's projects. Before you quote anything: here's the scoping process that stopped me from losing money on fixed-price work.",
    content: `The first few projects I did as a freelancer, I lost money. Not because I priced wrong exactly — because I scoped wrong. There's a difference.

Pricing is about rates. Scoping is about understanding what you're actually agreeing to build. Getting scoping wrong makes pricing irrelevant.

## The classic failure mode

Client describes what they want. You estimate hours based on what you heard. You both agree. Midway through the project you realize the thing they described requires three things they didn't mention — an auth system, an integration with a third-party tool, and a data migration from their old platform. Each of those is half a project by itself.

You either eat the overrun or have an awkward conversation about change orders. Neither is good.

## The questions that actually surface scope

Before estimating anything, I ask:

**"What does success look like six months from now?"** This reveals the actual goal, which is often different from the stated deliverable.

**"What does this replace or connect to?"** Almost every project connects to existing systems, content, or workflows. Understanding those connections surfaces hidden work.

**"Who else needs to review or approve things?"** Stakeholder rounds add time. If there are five approvers, design review takes three times as long.

**"What's already decided and what's still open?"** If branding, copy, and photography are TBD, those are blockers you need to account for or exclude explicitly.

**"What's the timeline and why?"** Artificial deadlines compress the process in ways that cost more later. Real deadlines (trade show, launch event, contract date) help you sequence work correctly.

## Fixed-price vs. time-and-materials

I prefer fixed-price for scoped projects. It forces both sides to agree on what's being built before money changes hands. Time-and-materials is appropriate for discovery work or maintenance, where the scope genuinely can't be known in advance.

The key to making fixed-price work is writing a scope document that describes what's included **and explicitly states what isn't**. The exclusions are as important as the inclusions.

## Change orders aren't a failure

When a client asks for something outside the agreed scope, a change order is the correct response — not an apology. Projects evolve. Priorities shift. That's fine. The scope document exists so that both parties can recognize when something has changed.

Framing it that way — "that's a great addition, here's what it would add to the project" — is a much easier conversation than "I underestimated and need to charge you more."`,
    tags: ["agency", "business", "scoping", "freelance"],
    author: "KB",
    isPublished: true,
    publishedAt: "2025-12-22T09:00:00.000Z", // Winter solstice / pre-Christmas: year-end planning mode
  },
  {
    title: "New Year, New Router: What I Actually Learned Moving to Next.js App Router",
    slug: "new-year-new-router-nextjs-app-router-lessons",
    excerpt:
      "January is the best time to upgrade your mental model. The App Router isn't just a new file structure — it changes how you think about server vs. client, data fetching, and caching. Here's what finally clicked.",
    content: `When Next.js shipped the App Router I read the docs, followed a tutorial, and thought I understood it. Then I started building something real and realized I'd missed most of the mental model shift.

Here's what actually changed.

## The default is server, not client

In the Pages Router, every component was a client component by default. You opted into server behavior with \`getServerSideProps\` or \`getStaticProps\`.

In the App Router, every component is a server component by default. You opt into client behavior with \`"use client"\` at the top of the file.

This is backwards from what most React developers are used to. The practical implication: most of your UI can fetch data directly, without any state management or useEffect, because it runs on the server.

\`\`\`tsx
// This runs on the server. No useState, no useEffect, no loading state.
export default async function BlogPage() {
  const posts = await getPosts(); // direct DB call or fetch
  return <PostList posts={posts} />;
}
\`\`\`

## Client components are islands, not the default

You only need \`"use client"\` when a component uses browser APIs, event handlers, or React hooks. Everything else can stay on the server.

The mistake I made early on was adding \`"use client"\` to components that didn't need it — habit from the Pages Router. That moves the component and all its children to the client bundle, which grows your JS bundle and loses the server benefits.

Keep client components as leaves in the tree. The closer to the leaf, the better.

## Caching is now explicit

The Pages Router had \`getStaticProps\` (static), \`getServerSideProps\` (dynamic), and ISR (revalidate on interval). The App Router replaces all of this with a single \`fetch\` API where you declare caching behavior per request:

\`\`\`ts
// cached indefinitely (static)
fetch(url, { cache: "force-cache" });

// never cached (dynamic)
fetch(url, { cache: "no-store" });

// revalidate every 60 seconds (ISR equivalent)
fetch(url, { next: { revalidate: 60 } });
\`\`\`

This is more granular than the old model — you can have some fetches be static and others dynamic within the same page.

## Layouts are real now

Layouts in the App Router are React components that wrap their children and persist across navigation. They don't re-render when you navigate between child routes.

This makes navbars, sidebars, and shell UIs genuinely efficient — they mount once and stay mounted. In the Pages Router you had to fake this with \`_app.tsx\`.

The App Router has a steeper initial learning curve than the Pages Router. But once the model clicks, it's significantly more capable. The server-first default alone is worth the switch.`,
    tags: ["nextjs", "react", "app-router", "architecture"],
    author: "KB",
    isPublished: true,
    publishedAt: "2026-01-12T09:00:00.000Z", // Second week of January — "new year resolutions" tech edition
  },
  {
    title: "Groundhog Day Performance Audit: Stop Seeing the Same Web Vitals Failures",
    slug: "groundhog-day-performance-audit-core-web-vitals",
    excerpt:
      "Every year, same story: slow LCP, jittery CLS, sluggish INP. Like Groundhog Day, but for your Lighthouse score. Here's how to break the loop.",
    content: `Google has been using Core Web Vitals as a ranking signal since 2021. Most sites I audit are still failing at least one of them. Here's what the metrics actually measure and where to start.

## The three metrics that matter

**LCP (Largest Contentful Paint)** — how long until the largest visible element loads. Usually a hero image or a large text block. Google wants this under 2.5 seconds.

**CLS (Cumulative Layout Shift)** — how much the page shifts around while loading. Ads loading late, images without dimensions, fonts swapping — all cause CLS. Google wants this under 0.1.

**INP (Interaction to Next Paint)** — how quickly the page responds to user interactions. Replaced FID in March 2024. Google wants this under 200ms.

## Where to measure

PageSpeed Insights (pagespeed.web.dev) gives you both lab and field data. The field data (CrUX) is what actually affects your ranking. Vercel's analytics dashboard reports on these if you have Vercel Analytics enabled. Chrome DevTools has a Performance panel for digging into specific issues.

## The highest-impact fixes

**LCP: Preload your hero image.**

\`\`\`html
<link rel="preload" as="image" href="/hero.webp" />
\`\`\`

If your LCP element is a Next.js \`<Image>\`, add \`priority\` prop. That's often the whole fix.

**LCP: Switch hero images to WebP or AVIF.** These formats are 30–50% smaller than JPEG/PNG. Next.js \`<Image>\` handles this automatically if you let it.

**CLS: Set explicit width and height on all images.** Without dimensions, the browser doesn't know how much space to reserve, so content shifts when the image loads. Again, Next.js \`<Image>\` handles this if you provide \`width\` and \`height\` props.

**CLS: Use \`font-display: swap\` or better, preload your fonts.** Font swaps cause layout shifts. If you're using Google Fonts, Next.js's \`next/font\` module handles optimization automatically.

**INP: Move heavy JS off the main thread.** Long tasks (anything over 50ms on the main thread) block interaction response. Split large bundles, defer non-critical scripts, and avoid heavy synchronous operations in event handlers.

## The low-hanging fruit audit

1. Run PageSpeed Insights on your homepage
2. Look at the Opportunities and Diagnostics sections — they're ordered by impact
3. Fix LCP first (usually an image issue)
4. Then CLS (usually missing image dimensions or a late-loading element)
5. INP issues are usually JS-related and take more investigation

Most sites can get from failing to passing on all three metrics in a focused afternoon of work. The 80/20 is real here.`,
    tags: ["performance", "seo", "core-web-vitals", "nextjs"],
    author: "KB",
    isPublished: true,
    publishedAt: "2026-02-02T09:00:00.000Z", // Groundhog Day — perfect hook for "stop repeating the same mistakes"
  },
  {
    title: "CSS Modules vs. Tailwind: A Valentine's Day Breakup Analysis",
    slug: "css-modules-vs-tailwind-valentines-breakup-analysis",
    excerpt:
      "Some devs love Tailwind unconditionally. Others swear by CSS Modules. I've used both in production. Here's an honest post-Valentine's breakup analysis of which one you should actually commit to.",
    content: `This debate has generated more hot takes than it deserves. Both CSS Modules and Tailwind are good tools. The question is which one fits your situation.

## What CSS Modules actually give you

CSS Modules scope styles to the component by default. No global conflicts, no specificity wars. You write normal CSS — selectors, custom properties, media queries, the full language — and the build tool scopes it automatically.

\`\`\`css
/* Button.module.css */
.button {
  background: var(--color-primary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
}

.button:hover {
  background: var(--color-primary-dark);
}
\`\`\`

The component imports it:

\`\`\`tsx
import styles from "./Button.module.css";
export function Button({ children }) {
  return <button className={styles.button}>{children}</button>;
}
\`\`\`

Clean, explicit, colocated. The CSS lives next to the component. Design tokens live in custom properties. The mental model maps to the language.

## What Tailwind actually gives you

Tailwind gives you a utility class for (almost) every CSS property. You compose styles directly in JSX:

\`\`\`tsx
export function Button({ children }) {
  return (
    <button className="bg-primary px-4 py-2 rounded-md hover:bg-primary-dark">
      {children}
    </button>
  );
}
\`\`\`

The win is speed: no context switching to a CSS file, no naming classes, no worrying about whether you've already written this style somewhere. The constraint is that your design tokens need to be in \`tailwind.config\` — if they're not configured, you reach for arbitrary values (\`bg-[#3b5bdb]\`) which undermines the whole system.

## The real tradeoffs

**Tailwind excels when:**
- The team is familiar with it (there's a real learning curve)
- You're using a component library that's built with it (like shadcn/ui)
- Design-to-code velocity is the priority
- You have a designer who works in terms of spacing/color scales

**CSS Modules excel when:**
- The codebase already has a CSS custom property system
- You want full CSS expressiveness (complex animations, selectors, container queries)
- You're building for long-term readability — CSS is less likely to be cryptic to a developer who hasn't used Tailwind

**The honest answer:** On a solo project or small team with Tailwind experience, Tailwind is faster. On a larger codebase or with a team that has mixed CSS expertise, CSS Modules with a design token system is easier to maintain long-term.

I've shipped production code with both. Neither has made a project succeed or fail. Pick the one your team will actually use consistently.`,
    tags: ["css", "tailwind", "dx", "opinion"],
    author: "KB",
    isPublished: true,
    publishedAt: "2026-02-23T09:00:00.000Z", // Post-Valentine's — "committed to your CSS framework?"
  },
  {
    title: "St. Patrick's Day Special: Luck Had Nothing to Do With It",
    slug: "st-patricks-day-luck-had-nothing-to-do-with-it",
    excerpt:
      "Six months of building in public, and people keep saying 'you got lucky.' Here's what actually went into it — and why luck is a terrible strategy for growing a dev business.",
    content: `Six months ago I started posting more openly about what I'm building, how projects are going, and what I'm learning. Here's an honest accounting of what that's done (and not done).

## What changed

**Accountability.** The biggest practical effect has been accountability. When you say publicly that you're going to ship something, you're more likely to ship it. Not because anyone is watching closely — they're usually not — but because the act of stating it changes your relationship to it.

**Clarity of thinking.** Writing about a problem forces you to understand it well enough to explain it. I've caught conceptual gaps in my own understanding more times than I can count by trying to write a post about something I thought I knew.

**Inbound conversations.** Not clients, exactly — more like peers. People who are working on similar problems, or who've already solved something I'm struggling with. That network has been genuinely useful.

## What didn't change

**Traffic.** Building in public is not an SEO or traffic strategy on its own. A handful of posts and some social shares don't move the needle unless there's consistent volume and the content is genuinely useful.

**Revenue, directly.** I haven't been able to trace a single client directly to a public post. Some indirect credibility effect, maybe. Nothing measurable.

## The things nobody tells you

**Most people don't read carefully.** They scan. If you're writing long-form technical content, the audience is small and specific. That's fine — small and specific can be valuable — but calibrate your expectations.

**Consistency matters more than quality.** A mediocre post published beats a great post that never ships. I've spent too much time polishing things that would have been fine 40% rougher.

**You will cringe at your early posts.** That's correct. That means you've learned something. Don't delete them.

## Is it worth it?

Yes, but not for the reasons I expected. The compounding value isn't in the posts themselves — it's in the thinking they force you to do, the relationships they occasionally start, and the record of what you were working on and why.

If you're building something, you should probably write about it. Not for the audience. For yourself.`,
    tags: ["building-in-public", "indie-dev", "opinion", "agency"],
    author: "KB",
    isPublished: true,
    publishedAt: "2026-03-16T09:00:00.000Z", // Day before St. Patrick's Day 🍀
  },
];

async function run() {
  const collection = db.collection("blogPosts");

  // Build a set of existing slugs to avoid duplicates
  const snapshot = await collection.get();
  const existingSlugs = new Set(snapshot.docs.map((d) => d.data().slug));

  let inserted = 0;
  let skipped = 0;

  for (const post of posts) {
    if (existingSlugs.has(post.slug)) {
      console.log(`  ⏭  Skipping (exists): ${post.slug}`);
      skipped++;
      continue;
    }

    const publishedAt = new Date(post.publishedAt);
    const now = new Date();

    await collection.add({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags,
      author: post.author,
      isPublished: post.isPublished,
      publishedAt: Timestamp.fromDate(publishedAt),
      createdAt: Timestamp.fromDate(publishedAt),
      updatedAt: Timestamp.fromDate(now),
      coverImageUrl: "",
    });

    console.log(`  ✅  Inserted: ${post.slug}`);
    inserted++;
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.\n`);
}

run().catch((err) => {
  console.error("\n❌  Seed failed:", err.message);
  process.exit(1);
});
