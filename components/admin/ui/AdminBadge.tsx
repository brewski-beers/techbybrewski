import styles from "./AdminBadge.module.css";

type BadgeVariant = "published" | "draft" | "featured" | "neutral";

interface AdminBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export default function AdminBadge({ variant = "neutral", children }: AdminBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>
  );
}
