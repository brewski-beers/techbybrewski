"use client";
import styles from "./Toggle.module.css";

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export default function Toggle({ label, checked, onChange, hint }: ToggleProps) {
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
