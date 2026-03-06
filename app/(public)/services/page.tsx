"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublishedServices } from "@/lib/firestore/queries";
import { Service } from "@/lib/types";
import styles from "./page.module.css";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getPublishedServices().then(setServices).finally(() => setLoading(false)); }, []);

  return (
    <div className="section">
      <div className="container">
        <p className="text-overline">What We Do</p>
        <h1 className={`text-headline ${styles.title}`}>Services</h1>
        <p className={`text-body-lg text-muted ${styles.intro}`}>Custom software solutions built for real business outcomes.</p>

        {loading ? (
          <div className={`grid-3 grid gap-6 ${styles.grid}`}>
            {[1,2,3].map(n => <div key={n} className={`skeleton ${styles.cardSkeleton}`} />)}
          </div>
        ) : (
          <div className={`grid-3 grid gap-6 ${styles.grid}`}>
            {services.map(s => (
              <Link key={s.id} href={`/services/${s.slug}`} className={styles.card}>
                <h2 className="text-h3">{s.name}</h2>
                <p className={`text-body text-muted ${styles.summary}`}>{s.summary}</p>
                {s.bullets.length > 0 && (
                  <ul className={styles.bullets}>
                    {s.bullets.slice(0, 3).map((b, i) => <li key={i} className="text-body-sm">{b}</li>)}
                  </ul>
                )}
                <span className="text-label text-accent">Learn more →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
