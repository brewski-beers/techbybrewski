"use client";
import { useState } from "react";
import styles from "./ArrayField.module.css";

interface ArrayFieldProps {
  label: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function ArrayField({
  label,
  hint,
  values,
  onChange,
  placeholder = "Add item...",
}: ArrayFieldProps) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setDraft("");
  };

  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); add(); }
  };

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {hint && <span className={styles.hint}>{hint}</span>}

      <ul className={styles.list}>
        {values.map((val, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.itemText}>{val}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className={styles.removeBtn}
              aria-label={`Remove "${val}"`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.addRow}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.addInput}
        />
        <button type="button" onClick={add} className={styles.addBtn}>Add</button>
      </div>
    </div>
  );
}
