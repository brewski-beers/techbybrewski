"use client";
import { Suspense } from "react";
import EditCaseStudyClient from "./EditCaseStudyClient";
import styles from "./page.module.css";

export default function EditCaseStudyPage() {
  return (
    <Suspense fallback={<div className={`skeleton ${styles.formSkeleton}`} />}>
      <EditCaseStudyClient />
    </Suspense>
  );
}
