/**
 * Firestore REST API helpers for server-side (build-time) data fetching.
 * Used in Next.js Server Components + generateStaticParams.
 * No Firebase SDK — plain fetch over HTTP.
 */

import { Service, CaseStudy, CaseStudyImage, Testimonial, SiteSettings } from "@/lib/types";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ── Firestore value decoder ────────────────────────────────────

type FsValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { arrayValue: { values?: FsValue[] } }
  | { mapValue: { fields?: Record<string, FsValue> } };

function decode(v: FsValue): unknown {
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  if ("timestampValue" in v) return null; // drop timestamps; not needed client-side for display
  if ("arrayValue" in v) return (v.arrayValue.values ?? []).map(decode);
  if ("mapValue" in v) return decodeMap(v.mapValue.fields ?? {});
  return null;
}

function decodeMap(fields: Record<string, FsValue>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([k, val]) => [k, decode(val)]));
}

function docId(name: string) {
  return name.split("/").pop()!;
}

// ── Structured query runner ────────────────────────────────────

interface FieldFilter {
  field: string;
  op: "EQUAL" | "GREATER_THAN" | "LESS_THAN" | "ARRAY_CONTAINS";
  value: string | number | boolean;
}

async function runQuery(
  collectionId: string,
  filters: FieldFilter[],
  orderBy?: { field: string; direction?: "ASCENDING" | "DESCENDING" },
  limitTo?: number,
  cache: RequestCache = "no-store"
): Promise<Array<Record<string, unknown> & { id: string }>> {
  function toFsValue(val: string | number | boolean): FsValue {
    if (typeof val === "string") return { stringValue: val };
    if (typeof val === "boolean") return { booleanValue: val };
    return { integerValue: String(val) };
  }

  const where =
    filters.length === 1
      ? {
          fieldFilter: {
            field: { fieldPath: filters[0].field },
            op: filters[0].op,
            value: toFsValue(filters[0].value),
          },
        }
      : {
          compositeFilter: {
            op: "AND",
            filters: filters.map((f) => ({
              fieldFilter: {
                field: { fieldPath: f.field },
                op: f.op,
                value: toFsValue(f.value),
              },
            })),
          },
        };

  const body: Record<string, unknown> = {
    structuredQuery: {
      from: [{ collectionId }],
      where,
    },
  };

  if (orderBy) {
    (body.structuredQuery as Record<string, unknown>).orderBy = [
      { field: { fieldPath: orderBy.field }, direction: orderBy.direction ?? "ASCENDING" },
    ];
  }

  if (limitTo) {
    (body.structuredQuery as Record<string, unknown>).limit = limitTo;
  }

  const res = await fetch(`${BASE}:runQuery?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache,
  });

  if (!res.ok) {
    throw new Error(`Firestore REST query failed: ${res.status} ${res.statusText}`);
  }

  const rows = (await res.json()) as Array<{
    document?: { name: string; fields: Record<string, FsValue> };
  }>;

  return rows
    .filter((r) => r.document)
    .map((r) => ({
      id: docId(r.document!.name),
      ...(decodeMap(r.document!.fields) as Record<string, unknown>),
    }));
}

// ── Public query helpers ───────────────────────────────────────

// ── Single-document fetch ──────────────────────────────────────

async function getDocument(
  collectionId: string,
  docId: string
): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${BASE}/${collectionId}/${docId}?key=${API_KEY}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Firestore REST getDocument failed: ${res.status} ${res.statusText}`);
  }
  const doc = (await res.json()) as { fields?: Record<string, FsValue> };
  if (!doc.fields) return null;
  return decodeMap(doc.fields);
}

export async function getSiteSettingsRest(): Promise<SiteSettings | null> {
  const d = await getDocument("siteSettings", "main");
  if (!d) return null;
  const socialLinks = (d.socialLinks as Record<string, unknown>) ?? {};
  const seoDefaults = (d.seoDefaults as Record<string, unknown>) ?? {};
  return {
    brandName: (d.brandName as string) ?? "",
    tagline: (d.tagline as string) ?? "",
    heroHeadline: (d.heroHeadline as string) ?? "",
    heroSubheadline: (d.heroSubheadline as string) ?? "",
    primaryCTAType: ((d.primaryCTAType as string) ?? "contact") as "calendly" | "contact",
    calendlyUrl: (d.calendlyUrl as string) ?? "",
    contactEmail: (d.contactEmail as string) ?? "",
    socialLinks: {
      linkedin: (socialLinks.linkedin as string) ?? "",
      github: (socialLinks.github as string) ?? "",
      instagram: (socialLinks.instagram as string) ?? "",
    },
    seoDefaults: {
      titleTemplate: (seoDefaults.titleTemplate as string) ?? "",
      defaultDescription: (seoDefaults.defaultDescription as string) ?? "",
    },
  };
}

export async function getPublishedServicesRest(): Promise<Service[]> {
  const docs = await runQuery(
    "services",
    [{ field: "isPublished", op: "EQUAL", value: true }],
    { field: "order", direction: "ASCENDING" }
  );
  return docs.map((d) => ({
    id: d.id,
    name: (d.name as string) ?? "",
    slug: (d.slug as string) ?? "",
    summary: (d.summary as string) ?? "",
    imageUrl: (d.imageUrl as string) ?? "",
    bullets: (d.bullets as string[]) ?? [],
    useCases: (d.useCases as string[]) ?? [],
    order: (d.order as number) ?? 0,
    isActive: (d.isActive as boolean) ?? false,
    isPublished: (d.isPublished as boolean) ?? false,
  }));
}

export async function getFeaturedCaseStudiesRest(max = 3): Promise<CaseStudy[]> {
  const docs = await runQuery(
    "caseStudies",
    [
      { field: "isPublished", op: "EQUAL", value: true },
      { field: "featured", op: "EQUAL", value: true },
    ],
    { field: "order", direction: "ASCENDING" },
    max
  );
  return docs.map((d) => {
    const rawImages = (d.images as Array<Record<string, unknown>>) ?? [];
    return {
      id: d.id,
      title: (d.title as string) ?? "",
      slug: (d.slug as string) ?? "",
      clientName: (d.clientName as string) ?? "",
      industry: (d.industry as string) ?? "",
      overview: (d.overview as string) ?? "",
      problem: (d.problem as string[]) ?? [],
      solution: (d.solution as string[]) ?? [],
      outcomes: (d.outcomes as string[]) ?? [],
      stack: (d.stack as string[]) ?? [],
      images: rawImages.map((img) => ({
        url: (img.url as string) ?? "",
        alt: (img.alt as string) ?? "",
        order: (img.order as number) ?? 0,
      })),
      featured: (d.featured as boolean) ?? false,
      order: (d.order as number) ?? 0,
      publishedAt: null,
      updatedAt: null,
      isPublished: (d.isPublished as boolean) ?? false,
    };
  });
}

export async function getPublishedCaseStudiesRest(): Promise<CaseStudy[]> {
  const docs = await runQuery(
    "caseStudies",
    [{ field: "isPublished", op: "EQUAL", value: true }],
    { field: "order", direction: "ASCENDING" }
  );
  return docs.map((d) => {
    const rawImages = (d.images as Array<Record<string, unknown>>) ?? [];
    return {
      id: d.id,
      title: (d.title as string) ?? "",
      slug: (d.slug as string) ?? "",
      clientName: (d.clientName as string) ?? "",
      industry: (d.industry as string) ?? "",
      overview: (d.overview as string) ?? "",
      problem: (d.problem as string[]) ?? [],
      solution: (d.solution as string[]) ?? [],
      outcomes: (d.outcomes as string[]) ?? [],
      stack: (d.stack as string[]) ?? [],
      images: rawImages.map((img) => ({
        url: (img.url as string) ?? "",
        alt: (img.alt as string) ?? "",
        order: (img.order as number) ?? 0,
      })),
      featured: (d.featured as boolean) ?? false,
      order: (d.order as number) ?? 0,
      publishedAt: null,
      updatedAt: null,
      isPublished: (d.isPublished as boolean) ?? false,
    };
  });
}

export async function getPublishedTestimonialsRest(): Promise<Testimonial[]> {
  const docs = await runQuery(
    "testimonials",
    [{ field: "isPublished", op: "EQUAL", value: true }],
    { field: "order", direction: "ASCENDING" }
  );
  return docs.map((d) => ({
    id: d.id,
    quote: (d.quote as string) ?? "",
    name: (d.name as string) ?? "",
    title: (d.title as string) ?? "",
    company: (d.company as string) ?? "",
    avatarUrl: (d.avatarUrl as string) ?? "",
    order: (d.order as number) ?? 0,
    isPublished: (d.isPublished as boolean) ?? false,
  }));
}

export async function getPublishedServiceSlugs(): Promise<string[]> {
  const docs = await runQuery("services", [{ field: "isPublished", op: "EQUAL", value: true }]);
  return docs.map((d) => d.slug as string).filter(Boolean);
}

export async function getServiceBySlugRest(slug: string): Promise<Service | null> {
  const docs = await runQuery("services", [
    { field: "isPublished", op: "EQUAL", value: true },
    { field: "slug", op: "EQUAL", value: slug },
  ]);
  if (!docs[0]) return null;
  const d = docs[0];
  return {
    id: d.id,
    name: (d.name as string) ?? "",
    slug: (d.slug as string) ?? "",
    summary: (d.summary as string) ?? "",
    imageUrl: (d.imageUrl as string) ?? "",
    bullets: (d.bullets as string[]) ?? [],
    useCases: (d.useCases as string[]) ?? [],
    order: (d.order as number) ?? 0,
    isActive: (d.isActive as boolean) ?? false,
    isPublished: (d.isPublished as boolean) ?? false,
  };
}

export async function getPublishedCaseStudySlugs(): Promise<string[]> {
  const docs = await runQuery("caseStudies", [{ field: "isPublished", op: "EQUAL", value: true }]);
  return docs.map((d) => d.slug as string).filter(Boolean);
}

export async function getCaseStudyBySlugRest(slug: string): Promise<CaseStudy | null> {
  const docs = await runQuery("caseStudies", [
    { field: "isPublished", op: "EQUAL", value: true },
    { field: "slug", op: "EQUAL", value: slug },
  ]);
  if (!docs[0]) return null;
  const d = docs[0];
  const rawImages = (d.images as Array<Record<string, unknown>>) ?? [];
  const images: CaseStudyImage[] = rawImages.map((img) => ({
    url: (img.url as string) ?? "",
    alt: (img.alt as string) ?? "",
    order: (img.order as number) ?? 0,
  }));
  return {
    id: d.id,
    title: (d.title as string) ?? "",
    slug: (d.slug as string) ?? "",
    clientName: (d.clientName as string) ?? "",
    industry: (d.industry as string) ?? "",
    overview: (d.overview as string) ?? "",
    problem: (d.problem as string[]) ?? [],
    solution: (d.solution as string[]) ?? [],
    outcomes: (d.outcomes as string[]) ?? [],
    stack: (d.stack as string[]) ?? [],
    images,
    featured: (d.featured as boolean) ?? false,
    order: (d.order as number) ?? 0,
    publishedAt: null,
    updatedAt: null,
    isPublished: (d.isPublished as boolean) ?? false,
  };
}
