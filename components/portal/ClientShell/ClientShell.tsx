"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePortalUser } from "@/components/portal/ClientAuthProvider/ClientAuthProvider";
import { subscribeToUnreadMessageCount } from "@/lib/firestore/portalQueries";
import styles from "./ClientShell.module.css";

const BASE_NAV_ITEMS = [
  { label: "Dashboard", href: "/portal" },
  { label: "Documents", href: "/portal/documents" },
  { label: "Contracts", href: "/portal/contracts" },
  { label: "Messages", href: "/portal/messages" },
  { label: "Invoices", href: "/portal/invoices" },
  { label: "Settings", href: "/portal/settings" },
];

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { clientId } = usePortalUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToUnreadMessageCount(clientId, setUnreadCount);
    return unsub;
  }, [clientId]);

  const closeDrawer = () => setDrawerOpen(false);

  const navContent = (
    <>
      <nav className={styles.nav}>
        {BASE_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);
          const showBadge = item.href === "/portal/messages" && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeDrawer}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <span className={styles.navItemLabel}>{item.label}</span>
              {showBadge && (
                <span className={styles.unreadBadge} aria-label={`${unreadCount} unread messages`}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href="/" className={`text-caption ${styles.viewSiteLink}`} onClick={closeDrawer}>
          ← Back to site
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
        <span className={`text-caption ${styles.portalBadge}`}>Portal</span>
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
            <span className={`text-caption ${styles.portalBadge}`}>Portal</span>
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
          <span className={`text-caption ${styles.portalBadge}`}>Portal</span>
        </div>
        {navContent}
      </aside>

      {/* Main content area */}
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
