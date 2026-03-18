"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/case-studies" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const settings = useSiteSettings();

  return (
    <header className={styles.header}>
      <nav className={`container ${styles.nav}`}>
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          {settings?.brandName || "TechByBrewski"}
        </Link>

        {/* Desktop links */}
        <div className={styles.desktopLinks}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className={`${styles.link} ${pathname.startsWith(l.href) ? styles.linkActive : ""}`}>{l.label}</Link>
          ))}
          <Link href="/contact" className={styles.cta}>Start a Project</Link>
        </div>

        {/* Mobile hamburger */}
        <button className={styles.hamburger} onClick={() => setOpen(o => !o)} aria-label="Toggle menu" aria-expanded={open} aria-controls="mobile-nav">
          <span className={`${styles.bar} ${open ? styles.barTop : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barMid : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barBot : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-nav" className={styles.mobileMenu}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className={styles.mobileLink} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <Link href="/contact" className={styles.mobileCta} onClick={() => setOpen(false)}>Start a Project</Link>
        </div>
      )}
    </header>
  );
}
