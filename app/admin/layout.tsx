"use client";

import dynamic from "next/dynamic";

// Firebase cannot run during SSR — ssr: false requires a Client Component (Next.js 15)
const AdminAuthProvider = dynamic(
  () => import("@/components/admin/AdminAuthProvider/AdminAuthProvider"),
  { ssr: false }
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
