import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

type FieldProps = {
  label: string;
};

export function InputField({
  label,
  className = "",
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{label}</span>
      <input
        {...props}
        className={`mt-1 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none ring-[var(--color-track-soft)] focus:ring ${className}`.trim()}
      />
    </label>
  );
}

export function SelectField({
  label,
  className = "",
  children,
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{label}</span>
      <select
        {...props}
        className={`mt-1 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none ring-[var(--color-track-soft)] focus:ring ${className}`.trim()}
      >
        {children}
      </select>
    </label>
  );
}
