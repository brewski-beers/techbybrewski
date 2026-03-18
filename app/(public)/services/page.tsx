import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedServicesRest } from "@/lib/firestore/rest";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Services",
  description: "Custom software solutions built for real business outcomes — operational dashboards, customer portals, workflow automation, and more.",
};

export default async function ServicesPage() {
  const services = await getPublishedServicesRest();

  return (
    <section className="section">
      <div className="container">
        <p className="text-overline">What We Do</p>
        <h1 className={`text-headline ${styles.title}`}>Services</h1>
        <p className={`text-body-lg text-muted ${styles.intro}`}>Custom software solutions built for real business outcomes.</p>

        {services.length === 0 ? (
          <p className="text-body text-muted">Services coming soon.</p>
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
                <span className={`text-label text-accent ${styles.cta}`}>Learn more →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
