import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <article
      className={`rounded-2xl border border-[var(--color-line)] bg-white/95 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] ${className}`.trim()}
    >
      {children}
    </article>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold text-[var(--color-ink)]">{children}</h2>;
}

export function CardText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm text-[var(--color-muted)] ${className}`.trim()}>{children}</p>;
}
