"use client";
import Image from "next/image";
import Link from "next/link";
import { CaseStudy } from "@/lib/types";
import styles from "./page.module.css";

export default function CaseStudyDetailClient({ item }: { item: CaseStudy }) {
  return (
    <article className="section">
      <div className={`container ${styles.inner}`}>
        <Link href="/case-studies" className={`text-label text-muted ${styles.back}`}>← Case Studies</Link>

        <header className={styles.header}>
          <p className="text-overline">{item.industry}</p>
          <h1 className={`text-headline ${styles.title}`}>{item.title}</h1>
          <p className="text-body-lg text-muted">{item.overview}</p>
          {item.stack.length > 0 && (
            <div className={styles.stack}>{item.stack.map(t => <span key={t} className={styles.tag}>{t}</span>)}</div>
          )}
        </header>

        {item.images.length > 0 && (
          <div className={styles.gallery}>
            {item.images.sort((a, b) => a.order - b.order).map((img, i) => (
              <Image key={i} src={img.url} alt={img.alt} className={styles.galleryImg} width={1200} height={675} />
            ))}
          </div>
        )}

        <div className={styles.content}>
          {item.problem.length > 0 && (
            <section className={styles.section}>
              <h2 className="text-h3">The Problem</h2>
              <ul className={styles.list}>{item.problem.map((p, i) => <li key={i} className="text-body">{p}</li>)}</ul>
            </section>
          )}
          {item.solution.length > 0 && (
            <section className={styles.section}>
              <h2 className="text-h3">The Solution</h2>
              <ul className={styles.list}>{item.solution.map((s, i) => <li key={i} className="text-body">{s}</li>)}</ul>
            </section>
          )}
          {item.outcomes.length > 0 && (
            <section className={styles.section}>
              <h2 className="text-h3">Outcomes</h2>
              <ul className={styles.outcomes}>{item.outcomes.map((o, i) => <li key={i} className={styles.outcome}><span className={`text-h4 ${styles.outcomeText}`}>{o}</span></li>)}</ul>
            </section>
          )}
        </div>

        <div className={styles.cta}>
          <h2 className="text-h3">Ready to build something similar?</h2>
          <Link href="/contact" className={styles.ctaBtn}>Let&apos;s Talk →</Link>
        </div>
      </div>
    </article>
  );
}
