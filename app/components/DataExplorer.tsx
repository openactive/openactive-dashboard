"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { ExplorerFilterBar } from "./ExplorerFilterBar";
import { ExplorerSummary } from "./ExplorerSummary";
import {
  ExplorerMobileChrome,
  type MobilePanel,
} from "./ExplorerMobileChrome";
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
 * Map-first explorer: floating glass panels on desktop; compact dock + sheets on mobile/tablet.
 * Chrome is first in DOM order so keyboard users reach filters before map zoom controls.
 */
export function DataExplorer({ rows, hierarchy }: DataExplorerProps) {
  const [filters, setFilters] = useState<ExplorerFilters>(
    DEFAULT_EXPLORER_FILTERS
  );
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("none");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (isDesktop) setMobilePanel("none");
  }, [isDesktop]);

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

  const onPublisherChange = useCallback(
    (value: string) => updateFilter("publisher", value),
    [updateFilter]
  );

  const onActivityChange = useCallback(
    (value: string) => updateFilter("activity", value),
    [updateFilter]
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

  const filterControlProps = useMemo(
    () => ({
      hierarchy,
      filters,
      districtsWithData,
      publisherOptions,
      activityOptions,
      onFiltersChange: setFiltersNormalized,
      onPublisherChange,
      onActivityChange,
    }),
    [
      hierarchy,
      filters,
      districtsWithData,
      publisherOptions,
      activityOptions,
      setFiltersNormalized,
      onPublisherChange,
      onActivityChange,
    ]
  );

  return (
    <div
      className={`relative mt-10 min-h-[min(88vh,780px)] overflow-hidden rounded-xl shadow-[0_12px_48px_rgba(34,53,130,0.12)] ring-1 ring-oa-grey-300/60 [&_.oa-glass]:overflow-visible ${
        mobilePanel !== "none" ? "max-lg:touch-none" : ""
      }`}
      aria-label="Interactive map explorer"
    >
      {/* Keyboard tab order: chrome before map (map is visual only, position absolute) */}
      <div id="explorer-filters">
        <div className="lg:hidden">
          <ExplorerMobileChrome
          panel={mobilePanel}
          onPanelChange={setMobilePanel}
          summary={summary}
          selectionLabel={selectionLabel}
          filterProps={filterControlProps}
          />
        </div>

        <div className="absolute top-4 left-4 z-20 hidden pointer-events-none sm:top-5 sm:left-5 lg:block lg:w-[min(18rem,calc(100%-30rem))] xl:w-[min(20rem,calc(100%-32rem))]">
        <div className="pointer-events-auto w-full">
          <ExplorerFilterBar
            layout="overlay"
            {...filterControlProps}
          />
        </div>
        </div>
      </div>

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

      <div
        className="absolute inset-0 h-full w-full"
        inert={mobilePanel !== "none" ? true : undefined}
        aria-hidden={mobilePanel !== "none" ? true : undefined}
      >
        <OpportunityMap
          districtCounts={districtCounts}
          scopeAreaNames={mapScopeNames}
          selectedDistrict={
            filters.district !== ALL_FILTER ? filters.district : null
          }
        />
      </div>
    </div>
  );
}
