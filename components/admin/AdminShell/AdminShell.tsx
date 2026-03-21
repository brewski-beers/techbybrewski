"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./AdminShell.module.css";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Clients", href: "/admin/clients" },
  { label: "Site Settings", href: "/admin/settings" },
  { label: "Services", href: "/admin/services" },
  { label: "Case Studies", href: "/admin/case-studies" },
  { label: "Testimonials", href: "/admin/testimonials" },
  { label: "FAQs", href: "/admin/faqs" },
  { label: "Activity Log", href: "/admin/activity-log" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  const navContent = (
    <>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeDrawer}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href="/" className={`text-caption ${styles.viewSiteLink}`} onClick={closeDrawer}>
          ← View Site
        </Link>
        <button
          className={`text-caption ${styles.signOutButton}`}
          onClick={() => signOut(auth)}
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className={styles.shell}>

      {/* Mobile header */}
      <header className={styles.mobileHeader}>
        <button
          className={styles.hamburger}
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
        >
          <HamburgerIcon />
        </button>
        <span className={`text-label ${styles.mobileBrand}`}>TechByBrewski</span>
        <span className={`text-caption ${styles.adminBadge}`}>Admin</span>
      </header>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className={styles.overlay}
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerBrandGroup}>
            <span className={`text-label ${styles.mobileBrand}`}>TechByBrewski</span>
            <span className={`text-caption ${styles.adminBadge}`}>Admin</span>
          </div>
          <button
            className={styles.closeButton}
            onClick={closeDrawer}
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>
        </div>
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={`text-label ${styles.brand}`}>TechByBrewski</span>
          <span className={`text-caption ${styles.adminBadge}`}>Admin</span>
        </div>
        {navContent}
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>

    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="18" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="10" width="18" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="15" width="18" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
