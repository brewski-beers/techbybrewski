"use client";
import Link from "next/link";
import { Service } from "@/lib/types";
import styles from "./page.module.css";

export default function ServiceDetailClient({ service }: { service: Service }) {
  return (
    <div className="section">
      <div className={`container ${styles.inner}`}>
        <Link href="/services" className={`text-label text-muted ${styles.back}`}>← Services</Link>
        <h1 className={`text-headline ${styles.title}`}>{service.name}</h1>
        <p className={`text-body-lg text-muted ${styles.summary}`}>{service.summary}</p>

        <div className={styles.cols}>
          {service.bullets.length > 0 && (
            <section className={styles.col}>
              <h2 className="text-h4">What&apos;s Included</h2>
              <ul className={styles.list}>
                {service.bullets.map((b, i) => <li key={i} className="text-body">{b}</li>)}
              </ul>
            </section>
          )}
          {service.useCases.length > 0 && (
            <section className={styles.col}>
              <h2 className="text-h4">Who It&apos;s For</h2>
              <ul className={styles.list}>
                {service.useCases.map((u, i) => <li key={i} className="text-body">{u}</li>)}
              </ul>
            </section>
          )}
        </div>

        <div className={styles.cta}>
          <Link href="/contact" className={styles.ctaBtn}>Start a Project →</Link>
        </div>
      </div>
    </div>
  );
}
