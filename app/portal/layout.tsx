"use client";

import dynamic from "next/dynamic";

// Firebase cannot run during SSR — ssr: false requires a Client Component (Next.js 15)
const ClientAuthProvider = dynamic(
  () => import("@/components/portal/ClientAuthProvider/ClientAuthProvider"),
  { ssr: false }
);

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientAuthProvider>{children}</ClientAuthProvider>;
}
