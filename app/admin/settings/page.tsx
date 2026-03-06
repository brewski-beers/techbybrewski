"use client";

import { useEffect, useState } from "react";
import { getSiteSettings } from "@/lib/firestore/queries";
import { saveSiteSettings } from "@/lib/firestore/mutations";
import { SiteSettings } from "@/lib/types";
import { AdminButton, AdminInput, AdminTextarea, AdminCard } from "@/components/admin/ui";
import styles from "./page.module.css";

const DEFAULT: SiteSettings = {
  brandName: "TechByBrewski",
  tagline: "",
  heroHeadline: "",
  heroSubheadline: "",
  primaryCTAType: "contact",
  calendlyUrl: "",
  contactEmail: "",
  socialLinks: { linkedin: "", github: "", instagram: "" },
  seoDefaults: { titleTemplate: "%s | TechByBrewski", defaultDescription: "" },
};

export default function SettingsPage() {
  const [form, setForm] = useState<SiteSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSiteSettings().then((s) => {
      if (s) setForm(s);
      setLoading(false);
    });
  }, []);

  const set = (key: keyof SiteSettings, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await saveSiteSettings(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="skeleton" />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className="text-h2">Site Settings</h1>
        <p className="text-body text-muted">Global content and SEO defaults.</p>
      </div>

      <form onSubmit={handleSave} className={styles.form}>
        <AdminCard>
          <h2 className={`text-h4 ${styles.cardTitle}`}>Brand</h2>
          <AdminInput label="Brand Name" value={form.brandName} onChange={(e) => set("brandName", e.target.value)} required />
          <AdminInput label="Tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="What you do in one line" />
          <AdminTextarea label="Hero Headline" value={form.heroHeadline} onChange={(e) => set("heroHeadline", e.target.value)} rows={2} />
          <AdminTextarea label="Hero Sub-headline" value={form.heroSubheadline} onChange={(e) => set("heroSubheadline", e.target.value)} rows={2} />
        </AdminCard>

        <AdminCard>
          <h2 className={`text-h4 ${styles.cardTitle}`}>CTA &amp; Contact</h2>
          <div className={styles.ctaRow}>
            <label className={styles.radioLabel}>
              <input type="radio" name="ctaType" value="contact" checked={form.primaryCTAType === "contact"} onChange={() => set("primaryCTAType", "contact")} />
              Contact form
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="ctaType" value="calendly" checked={form.primaryCTAType === "calendly"} onChange={() => set("primaryCTAType", "calendly")} />
              Calendly
            </label>
          </div>
          <AdminInput label="Contact Email" type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
          {form.primaryCTAType === "calendly" && (
            <AdminInput label="Calendly URL" type="url" value={form.calendlyUrl} onChange={(e) => set("calendlyUrl", e.target.value)} placeholder="https://calendly.com/..." />
          )}
        </AdminCard>

        <AdminCard>
          <h2 className={`text-h4 ${styles.cardTitle}`}>Social Links</h2>
          <AdminInput label="LinkedIn" type="url" value={form.socialLinks.linkedin} onChange={(e) => set("socialLinks", { ...form.socialLinks, linkedin: e.target.value })} />
          <AdminInput label="GitHub" type="url" value={form.socialLinks.github} onChange={(e) => set("socialLinks", { ...form.socialLinks, github: e.target.value })} />
          <AdminInput label="Instagram" type="url" value={form.socialLinks.instagram} onChange={(e) => set("socialLinks", { ...form.socialLinks, instagram: e.target.value })} />
        </AdminCard>

        <AdminCard>
          <h2 className={`text-h4 ${styles.cardTitle}`}>SEO Defaults</h2>
          <AdminInput label="Title Template" value={form.seoDefaults.titleTemplate} hint="Use %s for the page title. e.g. %s | TechByBrewski" onChange={(e) => set("seoDefaults", { ...form.seoDefaults, titleTemplate: e.target.value })} />
          <AdminTextarea label="Default Description" value={form.seoDefaults.defaultDescription} rows={3} onChange={(e) => set("seoDefaults", { ...form.seoDefaults, defaultDescription: e.target.value })} />
        </AdminCard>

        <div className={styles.actions}>
          <AdminButton type="submit" loading={saving}>{saved ? "Saved ✓" : "Save Settings"}</AdminButton>
        </div>
      </form>
    </div>
  );
}
