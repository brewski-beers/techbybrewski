import type { Metadata } from "next";
import { getPublishedFAQsRest } from "@/lib/firestore/rest";
import FAQAccordion from "@/components/public/FAQAccordion/FAQAccordion";
import type { FAQ } from "@/lib/types";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about TechByBrewski — our process, pricing, technology choices, and how we work with clients.",
  alternates: { canonical: "/faq" },
  openGraph: { images: ["/og-image.png"] },
};

function buildFAQSchema(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export default async function FAQPage() {
  const faqs = await getPublishedFAQsRest();

  return (
    <section className="section">
      <div className="container">
        <div className={styles.header}>
          <p className="text-overline">Knowledge Base</p>
          <h1 className={`text-headline ${styles.title}`}>Frequently Asked Questions</h1>
          <p className={`text-body-lg text-muted ${styles.subtitle}`}>
            Everything you need to know about working with TechByBrewski.
          </p>
        </div>

        <FAQAccordion faqs={faqs} />

        {faqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQSchema(faqs)) }}
          />
        )}
      </div>
    </section>
  );
}
