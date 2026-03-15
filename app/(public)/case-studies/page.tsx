import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedCaseStudiesRest } from "@/lib/firestore/rest";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Real projects. Real outcomes. See how TechByBrewski has helped businesses solve operational challenges with custom software.",
};

export default async function CaseStudiesPage() {
  const items = await getPublishedCaseStudiesRest();

  return (
    <div className="section">
      <div className="container">
        <p className="text-overline">Our Work</p>
        <h1 className={`text-headline ${styles.title}`}>Case Studies</h1>
        <p className={`text-body-lg text-muted ${styles.intro}`}>Real projects. Real outcomes.</p>

        {items.length === 0 ? (
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
