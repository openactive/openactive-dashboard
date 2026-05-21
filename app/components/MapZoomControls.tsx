"use client";

interface MapZoomControlsProps {
  className: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function MapZoomControls({
  className,
  onZoomIn,
  onZoomOut,
  onReset,
}: MapZoomControlsProps) {
  const btnClass =
    "flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-lg font-medium text-oa-navy hover:bg-oa-grey-100 focus:outline-none focus:ring-2 focus:ring-oa-cyan";

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
        className={`${btnClass} text-base font-semibold uppercase tracking-wide`}
        onClick={onReset}
        aria-label="Reset map view"
        title="Reset view"
      >
        ⟲
      </button>
    </div>
  );
}
