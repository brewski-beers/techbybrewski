"use client";
import { useState } from "react";
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";
import styles from "./page.module.css";

export default function ContactPage() {
  const settings = useSiteSettings();
  const [form, setForm] = useState({ name: "", businessName: "", email: "", whatBuilding: "", problem: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const body = [
      `Business: ${form.businessName}`,
      `What they want to build: ${form.whatBuilding}`,
      `Problem: ${form.problem}`,
      `From: ${form.email}`,
    ].join("\n\n");
    const mailto = `mailto:${settings?.contactEmail || ""}?subject=New Project Inquiry from ${encodeURIComponent(form.name)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
    setSending(false);
  };

  return (
    <div className="section">
      <div className={`container ${styles.inner}`}>
        <div className={styles.header}>
          <p className="text-overline">Start a Project</p>
          <h1 className={`text-headline ${styles.title}`}>Let&apos;s Build Something Useful</h1>
          <p className="text-body-lg text-muted">Tell us about your business and the system or project you&apos;re considering. We&apos;ll review the details and follow up to discuss next steps.</p>
        </div>

        {sent ? (
          <div className={styles.success}>
            <p className="text-h3">Thanks for reaching out!</p>
            <p className="text-body text-muted">Your email client should have opened. We&apos;ll be in touch shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">Your Name</label>
                <input id="name" required className={styles.input} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Jane Smith" />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="businessName">Business Name</label>
                <input id="businessName" required className={styles.input} value={form.businessName} onChange={e => set("businessName", e.target.value)} placeholder="Acme Co." />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email</label>
              <input id="email" type="email" required className={styles.input} value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@company.com" />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="whatBuilding">What are you looking to build?</label>
              <input id="whatBuilding" required className={styles.input} value={form.whatBuilding} onChange={e => set("whatBuilding", e.target.value)} placeholder="e.g. An operational dashboard, a customer portal..." />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="problem">Tell us about the problem you&apos;re trying to solve</label>
              <textarea id="problem" required className={styles.textarea} rows={6} value={form.problem} onChange={e => set("problem", e.target.value)} placeholder="Describe the challenge your business is facing and what better software would change..." />
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
