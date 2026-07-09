import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import type { ComponentType, SVGProps } from "react";
import { STATUS_LABELS } from "../../lib/feed-quality";
import type { FeedStatus } from "../../types/feed-quality";

const STATUS_ICONS: Record<
  FeedStatus,
  { Icon: ComponentType<SVGProps<SVGSVGElement>>; colorClass: string }
> = {
  OK: { Icon: CheckCircleIcon, colorClass: "text-oa-cyan" },
  WARNING: { Icon: ExclamationTriangleIcon, colorClass: "text-oa-yellow" },
  ERROR: { Icon: XCircleIcon, colorClass: "text-oa-scarlet" },
};

interface FeedQualityStatusIconProps {
  status: FeedStatus;
  sizeClass?: string;
  /** When true, the parent control supplies the accessible name. */
  decorative?: boolean;
}

export function FeedQualityStatusIcon({
  status,
  sizeClass = "h-5 w-5",
  decorative = false,
}: FeedQualityStatusIconProps) {
  const { Icon, colorClass } = STATUS_ICONS[status];
  return (
    <Icon
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : STATUS_LABELS[status]}
      className={`${colorClass} ${sizeClass}`}
    />
  );
}
