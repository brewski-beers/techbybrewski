"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";
import { getPublishedServices, getFeaturedCaseStudies, getPublishedTestimonials } from "@/lib/firestore/queries";
import { Service, CaseStudy, Testimonial } from "@/lib/types";
import styles from "./page.module.css";

export default function HomePage() {
  const settings = useSiteSettings();
  const [services, setServices] = useState<Service[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    Promise.all([
      getPublishedServices(),
      getFeaturedCaseStudies(3),
      getPublishedTestimonials(),
    ]).then(([sv, cs, t]) => {
      setServices(sv);
      setCaseStudies(cs);
      setTestimonials(t);
    });
  }, []);

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
            {settings?.heroHeadline || "We build software that scales with you."}
          </h1>
          <p className={`text-body-lg text-muted ${styles.sub}`}>
            {settings?.heroSubheadline || "From internal tools to client-facing platforms — custom-built, Firebase-powered, and production-ready from day one."}
          </p>
          <div className={styles.heroCtas}>
            {ctaIsExternal ? (
              <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={styles.ctaPrimary}>
                Let&apos;s Talk
              </a>
            ) : (
              <Link href={ctaHref} className={styles.ctaPrimary}>Let&apos;s Talk</Link>
            )}
            <Link href="/case-studies" className={styles.ctaSecondary}>See Our Work →</Link>
          </div>
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className={`section ${styles.section}`}>
          <div className="container">
            <p className="text-overline">What We Do</p>
            <h2 className={`text-h2 ${styles.sectionTitle}`}>Services</h2>
            <div className={`grid-3 grid gap-6 ${styles.serviceGrid}`}>
              {services.map(s => (
                <Link key={s.id} href={`/services/${s.slug}`} className={styles.serviceCard}>
                  <h3 className="text-h4">{s.name}</h3>
                  <p className={`text-body-sm text-muted ${styles.serviceSum}`}>{s.summary}</p>
                  <span className={`text-label text-accent ${styles.learn}`}>Learn more →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
                    <Image src={c.images[0].url} alt={c.images[0].alt} className={styles.caseImg} width={600} height={400} />
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
          <h2 className={`text-h2 text-inverse ${styles.ctaTitle}`}>Ready to build something?</h2>
          <p className="text-body-lg text-inverse">Let&apos;s talk about your project.</p>
          {ctaIsExternal ? (
            <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={styles.ctaBannerBtn}>Get in Touch</a>
          ) : (
            <Link href={ctaHref} className={styles.ctaBannerBtn}>Get in Touch</Link>
          )}
        </div>
      </section>
    </>
  );
}
