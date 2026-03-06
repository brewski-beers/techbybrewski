"use client";
import { useState } from "react";
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";
import styles from "./page.module.css";

export default function ContactPage() {
  const settings = useSiteSettings();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // mailto fallback — replace with your email service of choice
    const mailto = `mailto:${settings?.contactEmail || ""}?subject=Inquiry from ${encodeURIComponent(form.name)}&body=${encodeURIComponent(form.message + "\n\nFrom: " + form.email)}`;
    window.location.href = mailto;
    setSent(true);
    setSending(false);
  };

  return (
    <div className="section">
      <div className={`container ${styles.inner}`}>
        <div className={styles.header}>
          <p className="text-overline">Get In Touch</p>
          <h1 className={`text-headline ${styles.title}`}>Let&apos;s Build Something</h1>
          <p className={`text-body-lg text-muted`}>Tell us about your project and we&apos;ll get back to you within one business day.</p>
        </div>

        {sent ? (
          <div className={styles.success}>
            <p className="text-h3">Thanks for reaching out!</p>
            <p className="text-body text-muted">Your email client should have opened. We&apos;ll reply promptly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">Name</label>
              <input id="name" required className={styles.input} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email</label>
              <input id="email" type="email" required className={styles.input} value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@company.com" />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="message">Message</label>
              <textarea id="message" required className={styles.textarea} rows={6} value={form.message} onChange={e => set("message", e.target.value)} placeholder="Tell us about your project..." />
            </div>
            <button type="submit" disabled={sending} className={styles.submit}>
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
