"use client";
import { Suspense } from "react";
import EditTestimonialClient from "./EditTestimonialClient";
import styles from "@/styles/adminForm.module.css";

export default function EditTestimonialPage() {
  return (
    <Suspense fallback={<div className={`skeleton ${styles.formSkeleton}`} />}>
      <EditTestimonialClient />
    </Suspense>
  );
}
