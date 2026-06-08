"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useLocationScopedFilterOptions } from "../hooks/useLocationScopedFilterOptions";
import { useReactiveAreaHierarchy } from "../hooks/useReactiveAreaHierarchy";
import { useReactiveOpportunities } from "../hooks/useReactiveOpportunities";
import { ExplorerFilterBar } from "./ExplorerFilterBar";
import { ExplorerSummary } from "./ExplorerSummary";
import {
  ExplorerMobileChrome,
  type MobilePanel,
} from "./ExplorerMobileChrome";
import { OpportunityMap } from "./OpportunityMap";
import type { GeoHierarchy } from "../lib/geo-hierarchy";
import { getAreaSelectionLabel } from "../lib/geo-hierarchy";
import { getAreaNamesInScope } from "../lib/geo-hierarchy";
import {
  ALL_FILTER,
  DEFAULT_EXPLORER_FILTERS,
  type ExplorerFilters,
} from "../lib/explore-filters";
import { getActivities } from "../services/activities";
import { getPublishers } from "../services/publishers";

interface DataExplorerProps {
  hierarchy: GeoHierarchy;
}

/**
 * Map-first explorer: floating glass panels on desktop; compact dock + sheets on mobile/tablet.
 * Chrome is first in DOM order so keyboard users reach filters before map zoom controls.
 */
export function DataExplorer({ hierarchy }: DataExplorerProps) {
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

  const updateFilter = useCallback(
    (key: keyof ExplorerFilters, value: string) => {
      setFilters((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const onPublisherChange = useCallback(
    (value: string) => updateFilter("publisher", value),
    [updateFilter]
  );

  const onActivityChange = useCallback(
    (value: string) => updateFilter("activity", value),
    [updateFilter]
  );

  const onMapReset = useCallback(
    () => setFilters(DEFAULT_EXPLORER_FILTERS),
    []
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

  // Summary card + map choropleth are both driven by /opportunities.
  const { summary, districtCounts, isLoading: isOpportunitiesLoading } =
    useReactiveOpportunities({
      filters,
      maps: codeMaps,
    });

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
      onFiltersChange: setFilters,
      onPublisherChange,
      onActivityChange,
    }),
    [
      pickerHierarchy,
      filters,
      publisherOptions,
      activityOptions,
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

      {/* Desktop layout: panel on the left, map on the right. */}
      <div className="mt-4 hidden lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-5 xl:grid-cols-[24rem_minmax(0,1fr)] 2xl:grid-cols-[28rem_minmax(0,1fr)]">
        <aside
          className="h-[min(calc(100vh-13rem),640px)]"
          aria-labelledby="explorer-summary-heading"
        >
          <h3 id="explorer-summary-heading" className="sr-only">
            Summary statistics
          </h3>
          <ExplorerSummary
            layout="panel"
            summary={summary}
            selectionLabel={selectionLabel}
            isLoading={isOpportunitiesLoading}
          />
        </aside>

        <div className="relative h-[min(calc(100vh-13rem),640px)] overflow-hidden rounded-xl shadow-[0_12px_48px_rgba(34,53,130,0.12)] ring-1 ring-oa-grey-300/60">
          <OpportunityMap
            districtCounts={districtCounts}
            scopeAreaNames={mapScopeNames}
            selectedDistrict={
              filters.district !== ALL_FILTER ? filters.district : null
            }
            onReset={onMapReset}
          />
        </div>
      </div>

      {/* Mobile / tablet: map fills the frame, chrome docks at the bottom. */}
      <div
        className={`relative mt-4 min-h-[min(88vh,780px)] overflow-hidden rounded-xl shadow-[0_12px_48px_rgba(34,53,130,0.12)] ring-1 ring-oa-grey-300/60 lg:hidden ${
          mobilePanel !== "none" ? "max-lg:touch-none" : ""
        }`}
      >
        <div id="explorer-filters-mobile">
          <ExplorerMobileChrome
            panel={mobilePanel}
            onPanelChange={setMobilePanel}
            summary={summary}
            selectionLabel={selectionLabel}
            filterProps={filterControlProps}
            isLoading={isOpportunitiesLoading}
          />
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
            onReset={onMapReset}
          />
        </div>
      </div>
    </div>
  );
}
