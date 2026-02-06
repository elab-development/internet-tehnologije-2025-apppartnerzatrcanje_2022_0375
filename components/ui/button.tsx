import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const base =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-track)] text-white hover:bg-[var(--color-track-strong)] focus-visible:ring-[var(--color-track)]",
  secondary:
    "border border-[var(--color-line)] bg-white text-[var(--color-ink)] hover:border-[var(--color-track)] hover:text-[var(--color-track-strong)] focus-visible:ring-[var(--color-track)]",
  danger:
    "border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 focus-visible:ring-rose-400",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...props} className={`${base} ${variants[variant]} ${className}`.trim()} />;
}
