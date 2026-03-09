"use client";

import Link from "next/link";
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";
import styles from "./Footer.module.css";

export default function Footer() {
  const settings = useSiteSettings();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>{settings?.brandName || "TechByBrewski"}</span>
          <p className={`text-body-sm ${styles.tagline}`}>
            {settings?.tagline || "Custom software & Firebase solutions for growing businesses."}
          </p>
          {/* Social links */}
          {settings?.socialLinks && (
            <div className={styles.socials}>
              {settings.socialLinks.linkedin && (
                <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="LinkedIn">
                  LinkedIn
                </a>
              )}
              {settings.socialLinks.github && (
                <a href={settings.socialLinks.github} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="GitHub">
                  GitHub
                </a>
              )}
              {settings.socialLinks.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="Instagram">
                  Instagram
                </a>
              )}
            </div>
          )}
        </div>
        <nav className={styles.links}>
          <Link href="/services" className={styles.link}>Services</Link>
          <Link href="/case-studies" className={styles.link}>Work</Link>
          <Link href="/contact" className={styles.link}>Contact</Link>
        </nav>
      </div>
      <div className={`container ${styles.bottom}`}>
        <p className={`text-caption ${styles.copyright}`}>
          © {new Date().getFullYear()} {settings?.brandName || "TechByBrewski"}. All rights reserved.
        </p>
        {settings?.contactEmail && (
          <a href={`mailto:${settings.contactEmail}`} className={`text-caption ${styles.emailLink}`}>
            {settings.contactEmail}
          </a>
        )}
      </div>
    </footer>
  );
}
