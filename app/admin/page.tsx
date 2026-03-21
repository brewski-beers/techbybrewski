"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStats, getRecentActivity, DashboardStats } from "@/lib/firestore/queries";
import { ActivityLogEntry } from "@/lib/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import styles from "./page.module.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getRecentActivity(5)])
      .then(([s, a]) => { setStats(s); setActivity(a); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className="text-h2">Dashboard</h1>
        <p className="text-body text-muted">Welcome back. Here&apos;s what&apos;s live.</p>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className={`text-label text-muted ${styles.sectionLabel}`}>Quick Actions</h2>
        <div className={styles.quickActions}>
          {[
            { label: "New Case Study", href: "/admin/case-studies/new" },
            { label: "New Service", href: "/admin/services/new" },
            { label: "New Testimonial", href: "/admin/testimonials/new" },
            { label: "Edit Hero", href: "/admin/settings" },
          ].map((a) => (
            <Link key={a.href} href={a.href} className={styles.quickAction}>
              {a.label} →
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className={`text-label text-muted ${styles.sectionLabel}`}>Content Status</h2>
        {loading ? (
          <div className={styles.statsGrid}>
            {[1,2,3,4].map((n) => <div key={n} className={`skeleton ${styles.statSkeleton}`} />)}
          </div>
        ) : (
          <div className={styles.statsGrid}>
            {stats && Object.entries(stats).map(([col, counts]) => (
              <Card key={col} className={styles.statCard}>
                <p className={`text-label ${styles.statLabel}`}>{col}</p>
                <div className={styles.statCounts}>
                  <Badge variant="published">{counts.published} published</Badge>
                  <Badge variant="draft">{counts.draft} draft</Badge>
                </div>
                <Link href={`/admin/${col}`} className={styles.statLink}>
                  Manage →
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className={`text-label text-muted ${styles.sectionLabel}`}>Recent Activity</h2>
        <Card>
          {loading ? (
            <div className={styles.activityList}>
              {[1,2,3].map((n) => <div key={n} className={`skeleton ${styles.activitySkeleton}`} />)}
            </div>
          ) : activity.length === 0 ? (
            <p className="text-body-sm text-muted">No activity yet.</p>
          ) : (
            <ul className={styles.activityList}>
              {activity.map((entry) => (
                <li key={entry.id} className={styles.activityItem}>
                  <Badge variant="neutral">{entry.action}</Badge>
                  <span className="text-body-sm">{entry.changesSummary}</span>
                  <span className="text-caption text-muted">
                    {entry.timestamp?.toDate?.()?.toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
