"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  onAuthStateChanged,
  isSignInWithEmailLink,
  signInWithEmailLink,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import ClientLogin, {
  EMAIL_STORAGE_KEY,
} from "@/components/portal/ClientLogin/ClientLogin";
import ClientShell from "@/components/portal/ClientShell/ClientShell";
import styles from "./ClientAuthProvider.module.css";

// ── Context ────────────────────────────────────────────────────

interface PortalUser {
  user: User;
  clientId: string; // = user.uid
}

const PortalUserCtx = createContext<PortalUser | null>(null);

export function usePortalUser(): PortalUser {
  const ctx = useContext(PortalUserCtx);
  if (!ctx) throw new Error("usePortalUser must be used within ClientAuthProvider");
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────

export default function ClientAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cross-device: link opened on a different device than where it was requested
  const [needsEmail, setNeedsEmail] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const pendingLinkRef = useRef<string | null>(null);

  const completeSignIn = (email: string, link: string) =>
    signInWithEmailLink(auth, email, link)
      .then(() => {
        window.localStorage.removeItem(EMAIL_STORAGE_KEY);
        window.history.replaceState({}, document.title, "/portal");
      })
      .catch((err) => {
        console.error("Email link sign-in failed:", err);
        setError("Sign-in link is invalid or expired. Please request a new one.");
        setLoading(false);
      });

  useEffect(() => {
    // Complete email link sign-in if this is the callback URL
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const savedEmail = window.localStorage.getItem(EMAIL_STORAGE_KEY);
      if (savedEmail) {
        completeSignIn(savedEmail, window.location.href);
      } else {
        // Opened on a different device — need the user to confirm their email
        pendingLinkRef.current = window.location.href;
        setNeedsEmail(true);
        setLoading(false);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const tokenResult = await currentUser.getIdTokenResult(true);
        setUser(currentUser);
        setAuthorized(tokenResult.claims.client === true);
      } catch (err) {
        console.error("Portal auth check failed:", err);
        setError("Could not verify portal access. Please try again.");
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleConfirmEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingLinkRef.current || !confirmEmail) return;
    setConfirmLoading(true);
    await completeSignIn(confirmEmail, pendingLinkRef.current);
    setNeedsEmail(false);
    setConfirmLoading(false);
  };

  if (needsEmail) {
    return (
      <div className={styles.center}>
        <div className={styles.errorCard}>
          <p className="text-body font-semibold">Confirm your email</p>
          <p className="text-body-sm text-muted">
            Looks like you opened this link on a different device. Enter the email
            you used to request the sign-in link.
          </p>
          <form onSubmit={handleConfirmEmail} className={styles.confirmForm}>
            <input
              type="email"
              className={styles.confirmInput}
              placeholder="your@email.com"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              required
              autoFocus
            />
            <button
              type="submit"
              className={styles.confirmButton}
              disabled={confirmLoading || !confirmEmail}
            >
              {confirmLoading ? "Signing in…" : "Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.center}>
        <span className="text-body text-muted">Loading portal…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.center}>
        <div className={styles.errorCard}>
          <p className="text-body font-semibold text-danger">Access error</p>
          <p className="text-body-sm text-muted">{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => {
              setError(null);
              setLoading(true);
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!user || !authorized) {
    return <ClientLogin />;
  }

  return (
    <PortalUserCtx.Provider value={{ user, clientId: user.uid }}>
      <ClientShell>{children}</ClientShell>
    </PortalUserCtx.Provider>
  );
}
