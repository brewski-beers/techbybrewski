"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getServiceById } from "@/lib/firestore/queries";
import { Service } from "@/lib/types";
import ServiceForm from "@/components/admin/ServiceForm/ServiceForm";
import styles from "./page.module.css";

export default function EditServiceClient() {
  const id = useSearchParams().get("id") ?? "";
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getServiceById(id).then(setService).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className={`skeleton ${styles.formSkeleton}`} />;
  if (!service) return <p className="text-body text-muted">Service not found.</p>;

  return (
    <div className={styles.page}>
      <h1 className="text-h2">{service.name}</h1>
      <ServiceForm existing={service} />
    </div>
  );
}
