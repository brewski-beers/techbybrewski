import styles from "./AdminInput.module.css";

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export default function AdminInput({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: AdminInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`${styles.field} ${className}`}>
      <label htmlFor={inputId} className={styles.label}>{label}</label>
      {hint && <span className={styles.hint}>{hint}</span>}
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
