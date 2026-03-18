"use client";

import Link from "next/link";
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";
import styles from "./Footer.module.css";

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/case-studies" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  const settings = useSiteSettings();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.top}>
          <Link href="/" className={styles.brand}>
            {settings?.brandName || "TechByBrewski"}
          </Link>
          <nav className={styles.nav} aria-label="Footer navigation">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className={styles.navLink}>{l.label}</Link>
            ))}
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {new Date().getFullYear()} {settings?.brandName || "TechByBrewski"}. All rights reserved.
          </p>
          {settings?.socialLinks && (
            <div className={styles.socials}>
              {settings.socialLinks.linkedin && (
                <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="LinkedIn">LinkedIn</a>
              )}
              {settings.socialLinks.github && (
                <a href={settings.socialLinks.github} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="GitHub">GitHub</a>
              )}
              {settings.socialLinks.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="Instagram">Instagram</a>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
