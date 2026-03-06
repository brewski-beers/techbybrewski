"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublishedCaseStudies } from "@/lib/firestore/queries";
import { CaseStudy } from "@/lib/types";
import styles from "./page.module.css";

export default function CaseStudiesPage() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getPublishedCaseStudies().then(setItems).finally(() => setLoading(false)); }, []);

  return (
    <div className="section">
      <div className="container">
        <p className="text-overline">Our Work</p>
        <h1 className={`text-headline ${styles.title}`}>Case Studies</h1>
        <p className={`text-body-lg text-muted ${styles.intro}`}>Real projects. Real outcomes.</p>

        {loading ? (
          <div className={`grid gap-6 ${styles.grid}`}>{[1,2,3].map(n => <div key={n} className={`skeleton ${styles.skeleton}`} />)}</div>
        ) : items.length === 0 ? (
          <p className="text-body text-muted">Case studies coming soon.</p>
        ) : (
          <div className={`grid gap-6 ${styles.grid}`}>
            {items.map(c => (
              <Link key={c.id} href={`/case-studies/${c.slug}`} className={styles.card}>
                {c.images?.[0] && (
                  <div className={styles.imgWrapper}>
                    <Image src={c.images[0].url} alt={c.images[0].alt} fill className={styles.img} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                  </div>
                )}
                <div className={styles.body}>
                  <p className="text-caption text-muted">{c.industry}</p>
                  <h2 className="text-h3">{c.title}</h2>
                  <p className={`text-body text-muted ${styles.overview}`}>{c.overview}</p>
                  {c.stack.length > 0 && (
                    <div className={styles.stack}>{c.stack.slice(0, 5).map(t => <span key={t} className={styles.tag}>{t}</span>)}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
