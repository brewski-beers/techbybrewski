import { Suspense } from "react";
import EditBlogPostClient from "./EditBlogPostClient";
import styles from "@/styles/adminForm.module.css";

export default function EditBlogPostPage() {
  return (
    <Suspense fallback={<div className={`skeleton ${styles.formSkeleton}`} />}>
      <EditBlogPostClient />
    </Suspense>
  );
}
