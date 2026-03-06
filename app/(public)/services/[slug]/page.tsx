import { notFound } from "next/navigation";
import { getPublishedServiceSlugs, getServiceBySlugRest } from "@/lib/firestore/rest";
import ServiceDetailClient from "./ServiceDetailClient";

export async function generateStaticParams() {
  const slugs = await getPublishedServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlugRest(slug);
  if (!service) notFound();
  return <ServiceDetailClient service={service} />;
}
