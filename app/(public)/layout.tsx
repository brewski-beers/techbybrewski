import { SiteSettingsProvider } from "@/lib/context/SiteSettingsContext";
import Navbar from "@/components/public/Navbar/Navbar";
import Footer from "@/components/public/Footer/Footer";
import styles from "./layout.module.css";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProvider>
      <div className={styles.wrapper}>
        <Navbar />
        <main className={styles.main}>{children}</main>
        <Footer />
      </div>
    </SiteSettingsProvider>
  );
}
