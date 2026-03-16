import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedCaseStudySlugs, getCaseStudyBySlugRest } from "@/lib/firestore/rest";
import CaseStudyDetailClient from "./CaseStudyDetailClient";

export async function generateStaticParams() {
  const slugs = await getPublishedCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCaseStudyBySlugRest(slug);
  if (!item) return {};
  const firstImage = item.images?.[0];
  return {
    title: item.title,
    description: item.overview,
    openGraph: {
      title: item.title,
      description: item.overview,
      ...(firstImage ? { images: [{ url: firstImage.url, alt: firstImage.alt }] } : {}),
    },
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getCaseStudyBySlugRest(slug);
  if (!item) notFound();
  return <CaseStudyDetailClient item={item} />;
}
