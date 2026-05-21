"use client";

import { useCallback, useMemo, useState } from "react";
import { ExplorerFilterBar } from "./ExplorerFilterBar";
import { ExplorerSummary } from "./ExplorerSummary";
import { OpportunityMap } from "./OpportunityMap";
import type { CrossTabRow } from "../lib/explore-csv";
import type { GeoHierarchy } from "../lib/geo-hierarchy";
import { getAreaSelectionLabel } from "../lib/geo-hierarchy";
import { getAreaNamesInScope } from "../lib/geo-hierarchy";
import {
  buildActivityOptions,
  buildPublisherOptions,
  computeExplorerSummary,
  ALL_FILTER,
  DEFAULT_EXPLORER_FILTERS,
  filterRows,
  getDistrictCounts,
  normalizeExplorerFilters,
  type ExplorerFilters,
} from "../lib/explore-filters";

interface DataExplorerProps {
  rows: CrossTabRow[];
  hierarchy: GeoHierarchy;
}

/**
 * Map-first explorer
 */
export function DataExplorer({ rows, hierarchy }: DataExplorerProps) {
  const [filters, setFilters] = useState<ExplorerFilters>(
    DEFAULT_EXPLORER_FILTERS
  );

  const districtsWithData = useMemo(
    () => new Set(rows.map((r) => r.district).filter(Boolean)),
    [rows]
  );

  const setFiltersNormalized = useCallback(
    (next: ExplorerFilters) => {
      setFilters(normalizeExplorerFilters(rows, next, hierarchy));
    },
    [rows, hierarchy]
  );

  const updateFilter = useCallback(
    (key: keyof ExplorerFilters, value: string) => {
      setFiltersNormalized({ ...filters, [key]: value });
    },
    [filters, setFiltersNormalized]
  );

  const publisherOptions = useMemo(
    () =>
      buildPublisherOptions(
        rows,
        {
          district: filters.district,
          areaScope: filters.areaScope,
          activity: filters.activity,
        },
        hierarchy
      ),
    [rows, filters.district, filters.areaScope, filters.activity, hierarchy]
  );

  const activityOptions = useMemo(
    () =>
      buildActivityOptions(
        rows,
        {
          district: filters.district,
          areaScope: filters.areaScope,
          publisher: filters.publisher,
        },
        hierarchy
      ),
    [rows, filters.district, filters.areaScope, filters.publisher, hierarchy]
  );

  const filteredRows = useMemo(
    () => filterRows(rows, filters, hierarchy),
    [rows, filters, hierarchy]
  );

  const summary = useMemo(
    () => computeExplorerSummary(filteredRows),
    [filteredRows]
  );

  const districtCounts = useMemo(
    () => getDistrictCounts(filteredRows),
    [filteredRows]
  );

  const selectionLabel = getAreaSelectionLabel(
    hierarchy,
    filters.district,
    filters.areaScope
  );

  const mapScopeNames = useMemo(() => {
    if (filters.district !== ALL_FILTER) return [filters.district];
    if (filters.areaScope !== ALL_FILTER) {
      return getAreaNamesInScope(hierarchy, filters.areaScope);
    }
    return null;
  }, [filters, hierarchy]);

  return (
    <div
      className="relative mt-10 min-h-[min(88vh,780px)] overflow-hidden rounded-xl shadow-[0_12px_48px_rgba(34,53,130,0.12)] ring-1 ring-oa-grey-300/60 [&_.oa-glass]:overflow-visible"
      aria-label="Interactive map explorer"
    >
      {/* Full-bleed map */}
      <div className="absolute inset-0 h-full w-full">
        <OpportunityMap
          layout="immersive"
          districtCounts={districtCounts}
          scopeAreaNames={mapScopeNames}
          selectedDistrict={
            filters.district !== ALL_FILTER ? filters.district : null
          }
        />
      </div>

      {/* Floating filters — top-left on desktop; full-width top on mobile */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none sm:top-5 sm:left-5 sm:right-5 lg:right-auto lg:w-[min(18rem,calc(100%-30rem))] xl:w-[min(20rem,calc(100%-32rem))]">
        <div className="pointer-events-auto w-full">
          <ExplorerFilterBar
            layout="overlay"
            hierarchy={hierarchy}
            filters={filters}
            districtsWithData={districtsWithData}
            publisherOptions={publisherOptions}
            activityOptions={activityOptions}
            onFiltersChange={setFiltersNormalized}
            onPublisherChange={(value) => updateFilter("publisher", value)}
            onActivityChange={(value) => updateFilter("activity", value)}
          />
        </div>
      </div>

      {/* Floating summary — top-right (desktop) */}
      <div
        className="absolute z-20 pointer-events-none hidden lg:block top-5 right-5 w-[24rem] xl:right-6 xl:w-104 2xl:w-md"
        aria-labelledby="explorer-summary-heading"
      >
        <h3 id="explorer-summary-heading" className="sr-only">
          Summary statistics
        </h3>
        <div className="pointer-events-auto min-h-0 overflow-y-auto">
          <ExplorerSummary
            layout="overlay"
            summary={summary}
            selectionLabel={selectionLabel}
          />
        </div>
      </div>

      {/* Summary — bottom sheet on mobile */}
      <div
        className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none lg:hidden"
        aria-labelledby="explorer-summary-heading-mobile"
      >
        <h3 id="explorer-summary-heading-mobile" className="sr-only">
          Summary statistics
        </h3>
        <div className="pointer-events-auto max-h-[42vh] overflow-y-auto">
          <ExplorerSummary
            layout="overlay"
            summary={summary}
            selectionLabel={selectionLabel}
          />
        </div>
      </div>
    </div>
  );
}
