"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCaseStudyById } from "@/lib/firestore/queries";
import { CaseStudy } from "@/lib/types";
import CaseStudyForm from "@/components/admin/CaseStudyForm/CaseStudyForm";
import styles from "./page.module.css";

export default function EditCaseStudyClient() {
  const id = useSearchParams().get("id") ?? "";
  const [item, setItem] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getCaseStudyById(id).then(setItem).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className={`skeleton ${styles.formSkeleton}`} />;
  if (!item) return <p className="text-body text-muted">Case study not found.</p>;

  return (
    <div className={styles.page}>
      <h1 className="text-h2">{item.title}</h1>
      <CaseStudyForm existing={item} />
    </div>
  );
}
