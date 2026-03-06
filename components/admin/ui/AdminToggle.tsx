"use client";
import styles from "./AdminToggle.module.css";

interface AdminToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export default function AdminToggle({ label, checked, onChange, hint }: AdminToggleProps) {
  return (
    <label className={styles.wrapper}>
      <div className={styles.labelGroup}>
        <span className={styles.label}>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`${styles.track} ${checked ? styles.trackOn : ""}`}
        type="button"
      >
        <span className={`${styles.thumb} ${checked ? styles.thumbOn : ""}`} />
      </button>
    </label>
  );
}
