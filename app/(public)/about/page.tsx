import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "TechByBrewski builds custom software systems and automation tools that help businesses operate more efficiently and grow with clarity.",
};

const WHO_WE_HELP = [
  "Retail and ecommerce companies",
  "Local service businesses",
  "Operations-heavy organizations",
  "Businesses that have outgrown spreadsheets",
  "Companies looking to automate internal processes",
];

const VALUES = [
  {
    title: "Useful over impressive",
    desc: "We build software that solves real problems, not software that looks good in a demo. Every decision is made with the end user in mind.",
  },
  {
    title: "Clarity at every stage",
    desc: "No black boxes. You'll always know what we're building, why we're building it, and how it works. Transparent process, transparent code.",
  },
  {
    title: "Built to last",
    desc: "We architect systems for longevity — maintainable codebases, sensible data models, and infrastructure that scales as your business grows.",
  },
  {
    title: "Long-term relationships",
    desc: "We're not interested in one-time projects. The best software improves over time, and we want to be the team that helps you do that.",
  },
];

export default function AboutPage() {
  return (
    <div className="section">
      <div className="container">

        {/* Mission */}
        <div className={styles.mission}>
          <p className="text-overline">About Us</p>
          <h1 className={`text-headline ${styles.title}`}>We Build Software That Works</h1>
          <p className={`text-body-lg text-muted ${styles.missionText}`}>
            TechByBrewski is a custom software studio focused on building operational systems, automation tools, and digital infrastructure for growing businesses. We believe the best software is the kind that makes a business run better — not just the kind that looks good.
          </p>
        </div>

        {/* Values */}
        <section className={styles.section}>
          <p className="text-overline">Our Approach</p>
          <h2 className={`text-h2 ${styles.sectionTitle}`}>How We Think</h2>
          <div className={styles.valuesGrid}>
            {VALUES.map(v => (
              <div key={v.title} className={styles.valueCard}>
                <h3 className="text-h4">{v.title}</h3>
                <p className="text-body text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who We Help */}
        <section className={styles.section}>
          <p className="text-overline">Who We Work With</p>
          <h2 className={`text-h2 ${styles.sectionTitle}`}>Who We Help</h2>
          <p className={`text-body-lg text-muted ${styles.whoIntro}`}>
            TechByBrewski works with growing businesses that want better visibility, organization, and efficiency in their operations.
          </p>
          <ul className={styles.whoList}>
            {WHO_WE_HELP.map(w => (
              <li key={w} className={styles.whoItem}>
                <span className={styles.whoDot} />
                <span className="text-body">{w}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <div className={styles.cta}>
          <h2 className="text-h3">Have a project in mind?</h2>
          <p className="text-body text-muted">Tell us about your business and what you&apos;re looking to build.</p>
          <Link href="/contact" className={styles.ctaBtn}>Start a Project →</Link>
        </div>

      </div>
    </div>
  );
}
