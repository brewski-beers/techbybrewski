"use client";

import { useEffect, useRef } from "react";
import styles from "./ScrollReveal.module.css";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: 0 | 100 | 200 | 300 | 400 | 500;
  className?: string;
}

export default function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(styles.visible);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayClass = delay > 0 ? styles[`delay${delay}`] : "";

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${delayClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
