import styles from "./AdminCard.module.css";

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function AdminCard({ children, className = "" }: AdminCardProps) {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
}
