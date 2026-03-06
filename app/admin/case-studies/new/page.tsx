import CaseStudyForm from "@/components/admin/CaseStudyForm/CaseStudyForm";
import styles from "../edit/page.module.css";

export default function NewCaseStudyPage() {
  return (
    <div className={styles.page}>
      <h1 className="text-h2">New Case Study</h1>
      <CaseStudyForm />
    </div>
  );
}
