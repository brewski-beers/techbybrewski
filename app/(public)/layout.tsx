import { SiteSettingsProvider } from "@/lib/context/SiteSettingsContext";
import Navbar from "@/components/public/Navbar/Navbar";
import Footer from "@/components/public/Footer/Footer";
import { getPublishedServicesRest } from "@/lib/firestore/rest";
import styles from "./layout.module.css";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Firestore may be unavailable at build time (no ADC in Cloud Build).
  // Fall back to empty nav services — they will load correctly at runtime.
  let navServices: { name: string; slug: string }[] = [];
  try {
    const services = await getPublishedServicesRest();
    navServices = services.map(s => ({ name: s.name, slug: s.slug }));
  } catch {
    // intentionally silent — runtime will have ADC and serve correct data
  }

  return (
    <SiteSettingsProvider>
      <div className={styles.wrapper}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Navbar services={navServices} />
        <main id="main-content" className={styles.main}>{children}</main>
        <Footer />
      </div>
    </SiteSettingsProvider>
  );
}
