"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";
import styles from "./Navbar.module.css";

interface NavService {
  name: string;
  slug: string;
}

const STATIC_LINKS = [
  { label: "Work", href: "/case-studies" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
  { label: "Client Portal", href: "/portal" },
];

export default function Navbar({ services = [] }: { services?: NavService[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const settings = useSiteSettings();

  const servicesActive = pathname.startsWith("/services");

  return (
    <header className={styles.header}>
      <nav className={`container ${styles.nav}`}>
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          {settings?.brandName || "TechByBrewski"}
        </Link>

        {/* Desktop links */}
        <div className={styles.desktopLinks}>
          {/* Services with dropdown */}
          <div className={styles.dropdown}>
            <Link
              href="/services"
              className={`${styles.link} ${servicesActive ? styles.linkActive : ""}`}
              aria-haspopup="true"
              aria-expanded={services.length > 0 ? undefined : false}
            >
              Services
            </Link>
            {services.length > 0 && (
              <div className={styles.dropdownMenu} role="menu" aria-label="Services">
                <Link href="/services" className={styles.dropdownAll}>
                  All Services →
                </Link>
                <div className={styles.dropdownDivider} />
                {services.map(s => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className={`${styles.dropdownItem} ${pathname === `/services/${s.slug}` ? styles.dropdownItemActive : ""}`}
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {STATIC_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.link} ${pathname.startsWith(l.href) ? styles.linkActive : ""}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className={styles.cta}>Start a Project</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          <span className={`${styles.bar} ${open ? styles.barTop : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barMid : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barBot : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-nav" className={styles.mobileMenu}>
          {/* Services accordion */}
          <button
            className={`${styles.mobileLink} ${styles.mobileLinkToggle} ${servicesActive ? styles.mobileLinkActive : ""}`}
            onClick={() => setServicesOpen(o => !o)}
            aria-expanded={servicesOpen}
          >
            Services
            <span className={`${styles.chevron} ${servicesOpen ? styles.chevronOpen : ""}`} />
          </button>
          {servicesOpen && (
            <div className={styles.mobileSubLinks}>
              <Link
                href="/services"
                className={styles.mobileSubLinkAll}
                onClick={() => setOpen(false)}
              >
                All Services →
              </Link>
              {services.map(s => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className={styles.mobileSubLink}
                  onClick={() => setOpen(false)}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}

          {STATIC_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={styles.mobileLink}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className={styles.mobileCta} onClick={() => setOpen(false)}>
            Start a Project
          </Link>
        </div>
      )}
    </header>
  );
}
