"use client";
import { useState } from "react";
import type { FAQ } from "@/lib/types";
import styles from "./FAQAccordion.module.css";

interface Props {
  faqs: FAQ[];
}

function groupByCategory(faqs: FAQ[]): Record<string, FAQ[]> {
  return faqs.reduce<Record<string, FAQ[]>>((acc, faq) => {
    const key = faq.category || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});
}

export default function FAQAccordion({ faqs }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (faqs.length === 0) {
    return (
      <div className={styles.empty}>
        <p className="text-body text-muted">No FAQs available yet. Check back soon.</p>
      </div>
    );
  }

  const grouped = groupByCategory(faqs);
  const categories = Object.keys(grouped);

  return (
    <div className={styles.root}>
      {categories.map((category) => (
        <section key={category} className={styles.categorySection}>
          <h2 className={`text-h3 ${styles.categoryHeading}`}>{category}</h2>
          <div className={styles.list}>
            {grouped[category].map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id} className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}>
                  <button
                    className={styles.question}
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <span className="text-body">{faq.question}</span>
                    <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} aria-hidden="true" />
                  </button>
                  <div
                    id={`faq-answer-${faq.id}`}
                    className={`${styles.answerWrapper} ${isOpen ? styles.answerWrapperOpen : ""}`}
                    aria-hidden={!isOpen}
                  >
                    <div className={styles.answerInner}>
                      <p className={`text-body text-muted ${styles.answerText}`}>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
