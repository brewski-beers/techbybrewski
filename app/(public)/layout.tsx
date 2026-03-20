import { SiteSettingsProvider } from "@/lib/context/SiteSettingsContext";
import Navbar from "@/components/public/Navbar/Navbar";
import Footer from "@/components/public/Footer/Footer";
import { getPublishedServicesRest } from "@/lib/firestore/rest";
import styles from "./layout.module.css";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const services = await getPublishedServicesRest();
  const navServices = services.map(s => ({ name: s.name, slug: s.slug }));

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
