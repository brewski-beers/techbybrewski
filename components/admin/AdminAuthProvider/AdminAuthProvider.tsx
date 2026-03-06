"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AdminLogin from "@/components/admin/AdminLogin/AdminLogin";
import AdminShell from "@/components/admin/AdminShell/AdminShell";
import styles from "./AdminAuthProvider.module.css";

export default function AdminAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, "adminUsers", currentUser.uid));
        setUser(currentUser);
        setAuthorized(adminDoc.exists());
      } catch (err) {
        console.error("Admin auth check failed:", err);
        setError(
          "Firestore rules may not be deployed yet. See console for details."
        );
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-body text-muted">Checking access...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={styles.errorCard}>
          <p className="text-body font-semibold text-danger">Setup required</p>
          <p className="text-body-sm text-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (!user || !authorized) {
    return <AdminLogin />;
  }

  return <AdminShell>{children}</AdminShell>;
}
