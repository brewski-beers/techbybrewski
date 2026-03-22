import type { MetadataRoute } from "next";
import { getPublishedServiceSlugs, getPublishedCaseStudySlugs } from "@/lib/firestore/rest";
import { getPublishedBlogPostSlugsRest } from "@/lib/firestore/blog-rest";

const BASE_URL = "https://techbybrewski.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Firestore may be unavailable at build time (no ADC in Cloud Build).
  // Fall back to empty arrays — sitemap will contain static pages only.
  const [serviceSlugs, caseStudySlugs, blogSlugs] = await Promise.all([
    getPublishedServiceSlugs().catch(() => [] as string[]),
    getPublishedCaseStudySlugs().catch(() => [] as string[]),
    getPublishedBlogPostSlugsRest().catch(() => [] as string[]),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/services`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/case-studies`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/process`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, changeFrequency: "yearly", priority: 0.8 },
  ];

  const servicePages: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const caseStudyPages: MetadataRoute.Sitemap = caseStudySlugs.map((slug) => ({
    url: `${BASE_URL}/case-studies/${slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...servicePages, ...caseStudyPages, ...blogPages];
}
