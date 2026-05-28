"use client";

import { FilterDropdown } from "./FilterDropdown";
import { AreaHierarchyPicker } from "./AreaHierarchyPicker";
import type { GeoHierarchy } from "../lib/geo-hierarchy";
import type { ExplorerFilterOption } from "../lib/explore-filters";
import type { ExplorerFilters } from "../lib/explore-filters";

interface ExplorerFilterBarProps {
  hierarchy: GeoHierarchy;
  filters: ExplorerFilters;
  districtsWithData: Set<string>;
  publisherOptions: ExplorerFilterOption[];
  activityOptions: ExplorerFilterOption[];
  onFiltersChange: (filters: ExplorerFilters) => void;
  onPublisherChange: (value: string) => void;
  onActivityChange: (value: string) => void;
  layout?: "stacked" | "overlay" | "sheet";
}

/**
 * Filter bar for the data explorer.
 */
export function ExplorerFilterBar({
  hierarchy,
  filters,
  districtsWithData,
  publisherOptions,
  activityOptions,
  onFiltersChange,
  onPublisherChange,
  onActivityChange,
  layout = "stacked",
}: ExplorerFilterBarProps) {
  const isOverlay = layout === "overlay";
  const isSheet = layout === "sheet";

  return (
    <fieldset
      className={
        isSheet
          ? "min-w-0 border-0 bg-transparent p-0"
          : isOverlay
            ? "oa-glass oa-glass-strong overflow-visible rounded-xl p-4 ring-1 ring-white/70 lg:p-4"
            : "overflow-hidden rounded-sm border border-oa-grey-300 bg-white"
      }
    >
      <legend className="sr-only">Filter explorer data</legend>

      {!isOverlay && !isSheet && (
        <div className="border-b-4 border-oa-cyan bg-oa-navy px-4 py-3 sm:px-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-oa-aqua">
            Refine your view
          </p>
        </div>
      )}

      {isOverlay && (
        <p className="mb-3 text-sm font-semibold text-oa-navy">
          Refine your view
        </p>
      )}

      <div
        className={
          isOverlay || isSheet
            ? "flex flex-col gap-3"
            : "grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-oa-grey-200"
        }
        role="group"
        aria-label="Data filters"
      >
        <div className={isOverlay || isSheet ? "" : "border-b border-oa-grey-200 p-4 md:border-b-0"}>
          <AreaHierarchyPicker
            variant={isSheet ? "sheet" : isOverlay ? "glass" : "default"}
            hierarchy={hierarchy}
            filters={filters}
            districtsWithData={districtsWithData}
            onChange={onFiltersChange}
          />
        </div>
        <div className={isOverlay || isSheet ? "" : "border-b border-oa-grey-200 p-4 md:border-b-0"}>
          <FilterDropdown
            id="explorer-publisher"
            label="Publisher"
            layout={isSheet ? "sheet" : isOverlay ? "glass" : "field"}
            options={publisherOptions}
            value={filters.publisher}
            onChange={onPublisherChange}
          />
        </div>
        <div className={isOverlay || isSheet ? "" : "p-4"}>
          <FilterDropdown
            id="explorer-activity"
            label="Activity"
            layout={isSheet ? "sheet" : isOverlay ? "glass" : "field"}
            options={activityOptions}
            value={filters.activity}
            onChange={onActivityChange}
          />
        </div>
      </div>
    </fieldset>
  );
}
