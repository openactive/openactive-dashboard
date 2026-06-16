import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

interface ExternalDataLinkProps {
  href: string;
  label: string;
  className?: string;
}

export function ExternalDataLink({ href, label, className }: ExternalDataLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={href}
      className={`inline-flex items-baseline gap-1 rounded-sm hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan ${className ?? ""}`}
    >
      {label}
      <ArrowTopRightOnSquareIcon
        aria-hidden="true"
        className="h-3 w-3 shrink-0 self-center text-oa-grey-400"
      />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
