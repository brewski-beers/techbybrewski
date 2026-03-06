"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { getServiceById } from "@/lib/firestore/queries";
import { Service } from "@/lib/types";
import ServiceForm from "@/components/admin/ServiceForm/ServiceForm";
import styles from "./page.module.css";

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
