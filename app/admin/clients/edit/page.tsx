"use client";
import { Suspense } from "react";
import EditClientClient from "./EditClientClient";
import styles from "@/styles/adminForm.module.css";

export default function EditClientPage() {
  return (
    <Suspense fallback={<div className={`skeleton ${styles.formSkeleton}`} />}>
      <EditClientClient />
    </Suspense>
  );
}
