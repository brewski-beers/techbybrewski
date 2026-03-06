"use client";
import { Suspense } from "react";
import EditServiceClient from "./EditServiceClient";
import styles from "./page.module.css";

export default function EditServicePage() {
  return (
    <Suspense fallback={<div className={`skeleton ${styles.formSkeleton}`} />}>
      <EditServiceClient />
    </Suspense>
  );
}
