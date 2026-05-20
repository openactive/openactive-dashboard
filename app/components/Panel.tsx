import { ReactNode } from "react";

interface PanelProps {
  /** Optional panel title rendered as an h2 */
  title?: string;
  /** Optional description below the title */
  description?: string;
  /** Panel content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether to remove default padding (useful for full-bleed charts) */
  noPadding?: boolean;
}

/**
 * Panel — a white card container used to group related content
 * such as charts, tables, or stat grids within a dashboard layer.
 */
export function Panel({
  title,
  description,
  children,
  className = "",
  noPadding = false,
}: PanelProps) {
  return (
    <section
      className={`rounded-lg border border-oa-grey-200 bg-white shadow-sm ${
        noPadding ? "" : "p-6"
      } ${className}`}
      aria-labelledby={title ? toId(title) : undefined}
    >
      {title && (
        <header className={noPadding ? "px-6 pt-6" : ""}>
          <h2
            id={toId(title)}
            className="text-lg font-semibold text-oa-grey-900"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-oa-grey-500">{description}</p>
          )}
        </header>
      )}
      <div className={title && noPadding ? "mt-4" : title ? "mt-4" : ""}>
        {children}
      </div>
    </section>
  );
}

/** Convert a title string into a valid HTML id */
function toId(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
