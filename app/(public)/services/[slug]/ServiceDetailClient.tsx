"use client";
import Image from "next/image";
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
        {service.imageUrl && (
          <div className={styles.imageWrapper}>
            <Image src={service.imageUrl} alt={service.name} fill className={styles.image} sizes="(min-width: 768px) 768px, 100vw" />
          </div>
        )}

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
          <h2 className="text-h3">Ready to get started?</h2>
          <p className="text-body text-muted">Tell us about your project and we&apos;ll walk you through how we&apos;d approach it.</p>
          <Link href="/contact" className="btn-primary">Start a Project →</Link>
        </div>
      </div>
    </div>
  );
}
