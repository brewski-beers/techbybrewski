import styles from "./AdminTextarea.module.css";

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export default function AdminTextarea({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: AdminTextareaProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`${styles.field} ${className}`}>
      <label htmlFor={inputId} className={styles.label}>{label}</label>
      {hint && <span className={styles.hint}>{hint}</span>}
      <textarea
        id={inputId}
        className={`${styles.textarea} ${error ? styles.textareaError : ""}`}
        rows={4}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
