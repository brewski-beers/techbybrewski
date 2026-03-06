import { notFound } from "next/navigation";
import { getPublishedCaseStudySlugs, getCaseStudyBySlugRest } from "@/lib/firestore/rest";
import CaseStudyDetailClient from "./CaseStudyDetailClient";

export async function generateStaticParams() {
  const slugs = await getPublishedCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
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
