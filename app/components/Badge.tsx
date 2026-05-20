import { ReactNode } from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

interface BadgeProps {
  /** The badge content (text or icon + text) */
  children: ReactNode;
  /** Visual variant — maps to semantic colours */
  variant?: BadgeVariant;
  /** Optional accessible label when badge content alone is insufficient */
  "aria-label"?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  error: "bg-red-50 text-red-700 ring-red-600/20",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20",
  neutral: "bg-oa-grey-100 text-oa-grey-600 ring-oa-grey-500/20",
};

/**
 * Badge — a small inline status indicator used to display data quality,
 * feed status, or categorical labels across the dashboard.
 */
export function Badge({
  children,
  variant = "neutral",
  "aria-label": ariaLabel,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variantStyles[variant]}`}
      aria-label={ariaLabel}
    >
      {children}
    </span>
  );
}
