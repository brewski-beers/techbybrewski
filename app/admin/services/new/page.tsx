import ServiceForm from "@/components/admin/ServiceForm/ServiceForm";
import styles from "../[id]/page.module.css";

export default function NewServicePage() {
  return (
    <div className={styles.page}>
      <h1 className="text-h2">New Service</h1>
      <ServiceForm />
    </div>
  );
}
