import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedServiceSlugs, getServiceBySlugRest } from "@/lib/firestore/rest";
import ServiceDetailClient from "./ServiceDetailClient";

export async function generateStaticParams() {
  try {
    const slugs = await getPublishedServiceSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    // Firestore unavailable at build time (e.g. no ADC in Cloud Build).
    // Return empty — Next.js will render pages dynamically at runtime.
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlugRest(slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.summary,
    openGraph: {
      title: service.name,
      description: service.summary,
      ...(service.imageUrl ? { images: [{ url: service.imageUrl }] } : {}),
    },
  };
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
