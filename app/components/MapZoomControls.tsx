"use client";

interface MapZoomControlsProps {
  className: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  compact?: boolean;
}

export function MapZoomControls({
  className,
  onZoomIn,
  onZoomOut,
  onReset,
  compact = false,
}: MapZoomControlsProps) {
  const btnClass = compact
    ? "flex h-7 w-7 cursor-pointer items-center justify-center rounded text-sm font-medium text-oa-navy hover:bg-oa-grey-100 focus:outline-none focus:ring-2 focus:ring-oa-cyan lg:h-9 lg:w-9 lg:rounded-md lg:text-lg"
    : "flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-lg font-medium text-oa-navy hover:bg-oa-grey-100 focus:outline-none focus:ring-2 focus:ring-oa-cyan";

  return (
    <div className={className} role="group" aria-label="Map zoom controls">
      <button type="button" className={btnClass} onClick={onZoomIn} aria-label="Zoom in">
        +
      </button>
      <button type="button" className={btnClass} onClick={onZoomOut} aria-label="Zoom out">
        −
      </button>
      <button
        type="button"
        className={`${btnClass} ${compact ? "text-xs lg:text-base" : "text-base"} font-semibold uppercase tracking-wide`}
        onClick={onReset}
        aria-label="Reset map view"
        title="Reset view"
      >
        ⟲
      </button>
    </div>
  );
}
