import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getSiteSettingsRest,
  getFeaturedCaseStudiesRest,
  getPublishedTestimonialsRest,
} from "@/lib/firestore/rest";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "TechByBrewski — Custom Software & Automation for Growing Businesses",
  description: "TechByBrewski designs and builds custom web applications, operational dashboards, and automation systems that help businesses operate more efficiently and scale with clarity.",
  openGraph: {
    title: "TechByBrewski — Custom Software & Automation for Growing Businesses",
    description: "TechByBrewski designs and builds custom web applications, operational dashboards, and automation systems that help businesses operate more efficiently and scale with clarity.",
    url: "https://techbybrewski.com",
  },
};

export default async function HomePage() {
  const [settings, caseStudies, testimonials] = await Promise.all([
    getSiteSettingsRest(),
    getFeaturedCaseStudiesRest(3),
    getPublishedTestimonialsRest(),
  ]);

  const ctaHref =
    settings?.primaryCTAType === "calendly" && settings?.calendlyUrl
      ? settings.calendlyUrl
      : "/contact";
  const ctaIsExternal = settings?.primaryCTAType === "calendly" && !!settings?.calendlyUrl;

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          {settings?.tagline && (
            <p className={`text-overline ${styles.eyebrow}`}>{settings.tagline}</p>
          )}
          <h1 className={`text-display ${styles.headline}`}>
            {settings?.heroHeadline || "Custom Software and Automation Systems for Growing Businesses"}
          </h1>
          <p className={`text-body-lg text-muted ${styles.sub}`}>
            {settings?.heroSubheadline || "TechByBrewski designs and builds custom web applications, operational dashboards, and automation systems that help businesses operate more efficiently and scale with clarity."}
          </p>
          <div className={styles.heroCtas}>
            {ctaIsExternal ? (
              <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={styles.ctaPrimary}>
                Start a Project
              </a>
            ) : (
              <Link href={ctaHref} className={styles.ctaPrimary}>Start a Project</Link>
            )}
            <Link href="/case-studies" className={styles.ctaSecondary}>View Our Work →</Link>
          </div>
        </div>
      </section>

      {/* Systems We Build */}
      <section className={`section ${styles.sectionAlt}`}>
        <div className="container">
          <p className="text-overline">What We Build</p>
          <h2 className={`text-h2 ${styles.sectionTitle}`}>Systems We Build</h2>
          <p className={`text-body-lg text-muted ${styles.sectionIntro}`}>
            If your business runs on spreadsheets, manual handoffs, or disconnected tools — these are the systems we replace them with.
          </p>
          <div className={styles.systemsGrid}>
            {["Operational Dashboards", "Customer Portals", "Inventory & Resource Tracking", "Workflow Automation Tools", "Internal Management Systems", "Data Reporting Platforms"].map(s => (
              <div key={s} className={styles.systemChip}>{s}</div>
            ))}
          </div>
          <div className={styles.systemsLink}>
            <Link href="/services" className={styles.ctaSecondary}>View our service offerings →</Link>
          </div>
        </div>
      </section>

      {/* Process Preview */}
      <section className={`section ${styles.section}`}>
        <div className="container">
          <p className="text-overline">How We Work</p>
          <h2 className={`text-h2 ${styles.sectionTitle}`}>Our Process</h2>
          <div className={styles.processStrip}>
            {[
              { step: "01", title: "Discovery", desc: "Understanding your business and operational needs." },
              { step: "02", title: "System Design", desc: "Planning architecture, workflows, and data models." },
              { step: "03", title: "Development", desc: "Building secure, scalable software systems." },
              { step: "04", title: "Launch & Support", desc: "Deployment, improvements, and ongoing support." },
            ].map(p => (
              <div key={p.step} className={styles.processStep}>
                <span className={styles.processNum}>{p.step}</span>
                <h3 className={`text-h4 ${styles.processTitle}`}>{p.title}</h3>
                <p className="text-body-sm text-muted">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className={styles.processLink}>
            <Link href="/contact" className={styles.ctaSecondary}>Start a conversation →</Link>
          </div>
        </div>
      </section>

      {/* Featured Case Studies */}
      {caseStudies.length > 0 && (
        <section className={`section ${styles.sectionAlt}`}>
          <div className="container">
            <p className="text-overline">Recent Work</p>
            <h2 className={`text-h2 ${styles.sectionTitle}`}>Case Studies</h2>
            <div className={`grid gap-6 ${styles.caseGrid}`}>
              {caseStudies.map(c => (
                <Link key={c.id} href={`/case-studies/${c.slug}`} className={styles.caseCard}>
                  {c.images?.[0] && (
                    <Image src={c.images[0].url} alt={c.images[0].alt} className={styles.caseImg} width={600} height={400} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
                  )}
                  <div className={styles.caseBody}>
                    <p className="text-caption text-muted">{c.industry}</p>
                    <h3 className="text-h4">{c.title}</h3>
                    <p className={`text-body-sm text-muted ${styles.caseOverview}`}>{c.overview}</p>
                    {c.stack.length > 0 && (
                      <div className={styles.stack}>
                        {c.stack.slice(0, 4).map(t => <span key={t} className={styles.tag}>{t}</span>)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className={styles.viewAll}><Link href="/case-studies" className={styles.ctaSecondary}>View All Work →</Link></div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className={`section ${styles.section}`}>
          <div className="container">
            <p className="text-overline">From Clients</p>
            <h2 className={`text-h2 ${styles.sectionTitle}`}>What People Say</h2>
            <div className={`grid gap-6 ${styles.testiGrid}`}>
              {testimonials.map(t => (
                <blockquote key={t.id} className={styles.testimonial}>
                  <p className={`text-body-lg ${styles.quote}`}>&ldquo;{t.quote}&rdquo;</p>
                  <footer className={styles.testiFooter}>
                    {t.avatarUrl && (
                      <Image src={t.avatarUrl} alt={t.name} className={styles.avatar} width={44} height={44} />
                    )}
                    <div>
                      <p className="text-label">{t.name}</p>
                      <p className="text-caption text-muted">{t.title}{t.company ? ` · ${t.company}` : ""}</p>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className={`container ${styles.ctaBannerInner}`}>
          <h2 className={`text-h2 text-inverse ${styles.ctaTitle}`}>Let&apos;s Build Something Useful</h2>
          <p className="text-body-lg text-inverse">If your business has a process that could be improved with better software, we&apos;d love to learn more about it.</p>
          {ctaIsExternal ? (
            <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={styles.ctaBannerBtn}>Start a Project</a>
          ) : (
            <Link href={ctaHref} className={styles.ctaBannerBtn}>Start a Project</Link>
          )}
        </div>
      </section>
    </>
  );
}
