import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Our Process",
  description: "How TechByBrewski takes projects from idea to launch — discovery, system design, development, testing, and ongoing support.",
};

const STEPS = [
  {
    num: "01",
    title: "Discovery",
    desc: "We start by understanding your business deeply — the workflows, pain points, goals, and constraints. This phase produces a clear picture of what needs to be built and why, so we're solving the right problem before writing a single line of code.",
  },
  {
    num: "02",
    title: "System Design",
    desc: "With a solid understanding of the problem, we map out the architecture — data models, user flows, integrations, and system boundaries. You'll know exactly how the system will work before development begins.",
  },
  {
    num: "03",
    title: "Development",
    desc: "We build in focused iterations, delivering working software at each stage. Systems are built for security, scalability, and maintainability from the start — not bolted on later.",
  },
  {
    num: "04",
    title: "Testing",
    desc: "Every system is tested against real-world scenarios before it goes live. We validate functionality, performance, and edge cases to ensure the software behaves exactly as expected under real conditions.",
  },
  {
    num: "05",
    title: "Launch",
    desc: "We handle deployment, configuration, and go-live support. Whether you're replacing an existing system or launching something new, we make sure the transition is smooth and the system performs from day one.",
  },
  {
    num: "06",
    title: "Ongoing Support",
    desc: "Software is never truly done. After launch we provide continued support, improvements, and enhancements as your business evolves. We build long-term relationships, not one-time projects.",
  },
];

export default function ProcessPage() {
  return (
    <section className="section">
      <div className="container">
        <div className={styles.header}>
          <p className="text-overline">How We Work</p>
          <h1 className={`text-headline ${styles.title}`}>Our Process</h1>
          <p className={`text-body-lg text-muted ${styles.intro}`}>
            Every project follows a structured process built around clarity, communication, and delivering software that actually solves the problem.
          </p>
        </div>

        <div className={styles.steps}>
          {STEPS.map((s) => (
            <div key={s.num} className={styles.step}>
              <div className={styles.stepLeft}>
                <span className={styles.stepNum}>{s.num}</span>
                <div className={styles.stepLine} />
              </div>
              <div className={styles.stepContent}>
                <h2 className={`text-h3 ${styles.stepTitle}`}>{s.title}</h2>
                <p className="text-body text-muted">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <h2 className="text-h3">Ready to get started?</h2>
          <p className="text-body text-muted">Tell us about your project and we&apos;ll walk you through how we&apos;d approach it.</p>
          <Link href="/contact" className={styles.ctaBtn}>Start a Project →</Link>
        </div>
      </div>
    </section>
  );
}
