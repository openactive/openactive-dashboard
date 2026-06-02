"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useLocationScopedFilterOptions } from "../hooks/useLocationScopedFilterOptions";
import { useReactiveAreaHierarchy } from "../hooks/useReactiveAreaHierarchy";
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
  computeExplorerSummary,
  ALL_FILTER,
  DEFAULT_EXPLORER_FILTERS,
  filterRows,
  getDistrictCounts,
  normalizeExplorerFilters,
  type ExplorerFilters,
} from "../lib/explore-filters";
import { getActivities } from "../services/activities";
import { getPublishers } from "../services/publishers";

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

  const pickerHierarchy = useReactiveAreaHierarchy({
    publisher: filters.publisher,
    activity: filters.activity,
    fallback: hierarchy,
  });

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

  const codeMaps = useMemo(() => {
    const districtCodeByName = new Map<string, string>();
    const countryCodeById = new Map<string, string>();
    const regionCodeByScope = new Map<string, string>();

    for (const country of hierarchy.countries) {
      countryCodeById.set(country.id, country.code);
      for (const region of country.regions) {
        regionCodeByScope.set(`${country.id}:${region.id}`, region.code);
        for (const area of region.areas) {
          districtCodeByName.set(area.name, area.geoCode);
        }
      }
    }

    return { districtCodeByName, countryCodeById, regionCodeByScope };
  }, [hierarchy]);

  const onPublishersFetched = useCallback((names: string[]) => {
    setFilters((current) => {
      if (
        names.length === 0 ||
        (current.publisher !== ALL_FILTER &&
          !names.includes(current.publisher))
      ) {
        return { ...current, publisher: ALL_FILTER };
      }
      return current;
    });
  }, []);

  const onActivitiesFetched = useCallback((names: string[]) => {
    setFilters((current) => {
      if (
        names.length === 0 ||
        (current.activity !== ALL_FILTER &&
          !names.includes(current.activity))
      ) {
        return { ...current, activity: ALL_FILTER };
      }
      return current;
    });
  }, []);

  const areaFilters = useMemo(
    () => ({
      district: filters.district,
      areaScope: filters.areaScope,
    }),
    [filters.district, filters.areaScope]
  );

  const publisherOptions = useLocationScopedFilterOptions({
    item: "publishers",
    allLabel: "All publishers",
    loadingLabel: "Loading publishers…",
    hierarchy,
    filters: areaFilters,
    maps: codeMaps,
    fetchNames: getPublishers,
    onFetched: onPublishersFetched,
    activity: filters.activity,
  });

  const activityOptions = useLocationScopedFilterOptions({
    item: "activities",
    allLabel: "All activities and facilities",
    loadingLabel: "Loading activities…",
    hierarchy,
    filters: areaFilters,
    maps: codeMaps,
    fetchNames: getActivities,
    onFetched: onActivitiesFetched,
    publisher: filters.publisher,
  });

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
      hierarchy: pickerHierarchy,
      filters,
      publisherOptions,
      activityOptions,
      onFiltersChange: setFiltersNormalized,
      onPublisherChange,
      onActivityChange,
    }),
    [
      pickerHierarchy,
      filters,
      publisherOptions,
      activityOptions,
      setFiltersNormalized,
      onPublisherChange,
      onActivityChange,
    ]
  );

  return (
    <div className="mt-10" aria-label="Interactive map explorer">
      {/* Desktop filter bar — sits above the map for a calmer composition */}
      <div id="explorer-filters" className="hidden lg:block">
        <ExplorerFilterBar layout="stacked" {...filterControlProps} />
      </div>

      <div
        className={`relative mt-4 min-h-[min(88vh,780px)] overflow-hidden rounded-xl shadow-[0_12px_48px_rgba(34,53,130,0.12)] ring-1 ring-oa-grey-300/60 [&_.oa-glass]:overflow-visible ${
          mobilePanel !== "none" ? "max-lg:touch-none" : ""
        }`}
      >
        {/* Mobile chrome stays docked over the map (sheets open from the bottom) */}
        <div className="lg:hidden" id="explorer-filters-mobile">
          <ExplorerMobileChrome
            panel={mobilePanel}
            onPanelChange={setMobilePanel}
            summary={summary}
            selectionLabel={selectionLabel}
            filterProps={filterControlProps}
          />
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
    </div>
  );
}
