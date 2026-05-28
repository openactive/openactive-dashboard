"use client";

import * as d3 from "d3";
import { formatFullNumber } from "../lib/format";

interface MapLegendProps {
  id: string;
  className: string;
  focusedDistrict: string | null;
  focusedCount: number | undefined;
  selectedDistrict: string | null;
}

const LEGEND_STOPS = [0, 0.25, 0.5, 0.75, 1];

export function MapLegend({
  id,
  className,
  focusedDistrict,
  focusedCount,
  selectedDistrict,
}: MapLegendProps) {
  return (
    <div id={id} className={className} aria-live="polite" aria-atomic="true">
      <p className="min-h-5 text-sm text-oa-grey-700">
        {focusedDistrict ? (
          <>
            <span className="font-semibold text-oa-navy">{focusedDistrict}</span>
            {": "}
            {focusedCount != null && focusedCount > 0
              ? `${formatFullNumber(focusedCount)} opportunities`
              : "No opportunities in current selection"}
          </>
        ) : selectedDistrict ? (
          <>
            Viewing <span className="font-semibold text-oa-navy">{selectedDistrict}</span>
            . Drag to pan · scroll to zoom.
          </>
        ) : (
          <span className="text-oa-grey-600">
            Drag to pan · scroll or pinch to zoom. Use the area filter to explore local authorities.
          </span>
        )}
      </p>

      <div
        className="flex items-center gap-2 shrink-0"
        role="img"
        aria-label="Colour scale from fewer to more opportunities"
      >
        <span className="text-xs font-medium text-oa-grey-500">Fewer</span>
        <div className="flex h-2 w-28 overflow-hidden rounded-md border border-oa-grey-200/80">
          {LEGEND_STOPS.map((t) => (
            <div
              key={t}
              className="flex-1"
              style={{ background: d3.interpolate("#5eb8e8", "#223582")(t) }}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="text-xs font-medium text-oa-grey-500">More</span>
      </div>
    </div>
  );
}
