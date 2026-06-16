"use client";

import { FilterDropdown } from "./FilterDropdown";
import { AreaHierarchyPicker } from "./AreaHierarchyPicker";
import type { GeoHierarchy } from "../lib/geo-hierarchy";
import {
  ALL_FILTER,
  DEFAULT_EXPLORER_FILTERS,
  type ExplorerFilterOption,
  type ExplorerFilters,
} from "../lib/explore-filters";

interface ExplorerFilterBarProps {
  hierarchy: GeoHierarchy;
  filters: ExplorerFilters;
  publisherOptions: ExplorerFilterOption[];
  activityOptions: ExplorerFilterOption[];
  onFiltersChange: (filters: ExplorerFilters) => void;
  onPublisherChange: (value: string) => void;
  onActivityChange: (value: string) => void;
  layout?: "stacked" | "overlay" | "sheet";
}

function hasActiveFilters(filters: ExplorerFilters): boolean {
  return (
    filters.district !== ALL_FILTER ||
    filters.areaScope !== ALL_FILTER ||
    filters.publisher !== ALL_FILTER ||
    filters.activity !== ALL_FILTER
  );
}

export function ExplorerFilterBar({
  hierarchy,
  filters,
  publisherOptions,
  activityOptions,
  onFiltersChange,
  onPublisherChange,
  onActivityChange,
  layout = "stacked",
}: ExplorerFilterBarProps) {
  const isOverlay = layout === "overlay";
  const isSheet = layout === "sheet";
  const showClear = hasActiveFilters(filters);
  const onClearAll = () => onFiltersChange(DEFAULT_EXPLORER_FILTERS);

  return (
    <fieldset
      className={
        isSheet
          ? "min-w-0 border-0 bg-transparent p-0"
          : isOverlay
            ? "oa-glass oa-glass-strong overflow-visible rounded-xl p-4 ring-1 ring-white/70 lg:p-4"
            : "overflow-visible rounded-sm border border-oa-grey-300 bg-white"
      }
    >
      <legend className="sr-only">Filter explorer data</legend>

      {!isOverlay && !isSheet && (
        <div className="flex items-center justify-between gap-3 rounded-t-sm border-b-4 border-oa-cyan bg-oa-navy px-4 py-3 sm:px-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
            Refine your view
          </p>
          {showClear && (
            <button
              type="button"
              onClick={onClearAll}
              className="cursor-pointer rounded-sm px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 underline-offset-2 hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {isOverlay && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-oa-navy">Refine your view</p>
          {showClear && (
            <button
              type="button"
              onClick={onClearAll}
              className="cursor-pointer rounded-sm text-xs font-medium text-oa-blue underline-offset-2 hover:text-oa-purple hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {isSheet && showClear && (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={onClearAll}
            className="cursor-pointer rounded-sm text-xs font-medium text-oa-blue underline-offset-2 hover:text-oa-purple hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
          >
            Clear all filters
          </button>
        </div>
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
            searchable
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
            searchable
          />
        </div>
      </div>
    </fieldset>
  );
}
