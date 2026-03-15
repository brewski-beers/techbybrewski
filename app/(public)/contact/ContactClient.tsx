"use client";
import { useActionState } from "react";
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";
import styles from "./page.module.css";

type ActionState = { ok: true } | { ok: false; error: string } | null;

async function submitContact(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const res = await fetch("/api/contact", { method: "POST", body: formData });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error ?? "Failed to send. Please try again." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export default function ContactClient() {
  const settings = useSiteSettings();
  const [state, action, isPending] = useActionState(submitContact, null);

  return (
    <div className="section">
      <div className={`container ${styles.inner}`}>
        <div className={styles.header}>
          <p className="text-overline">Start a Project</p>
          <h1 className={`text-headline ${styles.title}`}>Let&apos;s Build Something Useful</h1>
          <p className="text-body-lg text-muted">Tell us about your business and the system or project you&apos;re considering. We&apos;ll review the details and follow up to discuss next steps.</p>
          {settings?.contactEmail && (
            <p className="text-body-sm text-muted">Or email us directly at <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></p>
          )}
        </div>

        {state?.ok ? (
          <div className={styles.success}>
            <p className="text-h3">Thanks for reaching out!</p>
            <p className="text-body text-muted">We&apos;ve received your message and will be in touch shortly.</p>
          </div>
        ) : (
          <form action={action} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">Your Name</label>
                <input id="name" name="name" required className={styles.input} placeholder="Jane Smith" />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="businessName">Business Name</label>
                <input id="businessName" name="businessName" required className={styles.input} placeholder="Acme Co." />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className={styles.input} placeholder="you@company.com" />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="whatBuilding">What are you looking to build?</label>
              <input id="whatBuilding" name="whatBuilding" required className={styles.input} placeholder="e.g. An operational dashboard, a customer portal..." />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="problem">Tell us about the problem you&apos;re trying to solve</label>
              <textarea id="problem" name="problem" required className={styles.textarea} rows={6} placeholder="Describe the challenge your business is facing and what better software would change..." />
            </div>
            {state?.ok === false && (
              <p className={styles.errorMsg}>{state.error}</p>
            )}
            <button type="submit" disabled={isPending} className={styles.submit}>
              {isPending ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
