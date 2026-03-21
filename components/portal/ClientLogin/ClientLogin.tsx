"use client";

import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./ClientLogin.module.css";

export const EMAIL_STORAGE_KEY = "portal_email_for_sign_in";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const actionCodeSettings = {
      url: `${window.location.origin}/portal`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
      setSent(true);
    } catch (err) {
      console.error("Failed to send sign-in link:", err);
      setError("Failed to send sign-in link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.checkIcon} aria-hidden="true">
            <CheckIcon />
          </div>
          <h1 className={`text-h3 ${styles.title}`}>Check your email</h1>
          <p className={`text-body ${styles.subtitle}`}>
            We sent a sign-in link to <strong>{email}</strong>. Click the link
            to access your portal.
          </p>
          <button className={styles.retryLink} onClick={() => setSent(false)}>
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={`text-label ${styles.brandName}`}>TechByBrewski</span>
          <span className={`text-caption ${styles.portalBadge}`}>Client Portal</span>
        </div>
        <h1 className={`text-h3 ${styles.title}`}>Welcome back</h1>
        <p className={`text-body ${styles.subtitle}`}>
          Enter your email to receive a secure sign-in link.
        </p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="email"
            className={styles.emailInput}
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          {error && <p className={`text-body-sm ${styles.error}`}>{error}</p>}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !email}
          >
            {loading ? "Sending…" : "Send sign-in link"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="14" fill="var(--color-success-muted, #dcfce7)" />
      <path
        d="M8.5 14l4 4 7-8"
        stroke="var(--color-success, #16a34a)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
