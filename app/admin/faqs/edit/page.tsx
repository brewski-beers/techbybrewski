"use client";
import { Suspense } from "react";
import EditFAQClient from "./EditFAQClient";
import styles from "@/styles/adminForm.module.css";

export default function EditFAQPage() {
  return (
    <Suspense fallback={<div className={`skeleton ${styles.formSkeleton}`} />}>
      <EditFAQClient />
    </Suspense>
  );
}
