import { ReactNode } from "react";

interface PanelProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

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

function toId(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
