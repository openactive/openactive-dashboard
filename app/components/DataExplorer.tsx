"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { parseAreaScope } from "../lib/geo-hierarchy";
import {
  buildActivityOptions,
  computeExplorerSummary,
  ALL_FILTER,
  DEFAULT_EXPLORER_FILTERS,
  filterRows,
  getDistrictCounts,
  normalizeExplorerFilters,
  type ExplorerFilterOption,
  type ExplorerFilters,
} from "../lib/explore-filters";
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
  const [publisherOptions, setPublisherOptions] = useState<ExplorerFilterOption[]>(
    [{ value: ALL_FILTER, label: "All publishers" }]
  );
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("none");
  const publisherOptionsCacheRef = useRef<Map<string, ExplorerFilterOption[]>>(
    new Map()
  );
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

  const districtCodeByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const country of hierarchy.countries) {
      for (const region of country.regions) {
        for (const area of region.areas) {
          map.set(area.name, area.geoCode);
        }
      }
    }
    return map;
  }, [hierarchy]);

  const countryCodeById = useMemo(() => {
    const map = new Map<string, string>();
    for (const country of hierarchy.countries) {
      map.set(country.id, country.code);
    }
    return map;
  }, [hierarchy]);

  const regionCodeByScope = useMemo(() => {
    const map = new Map<string, string>();
    for (const country of hierarchy.countries) {
      for (const region of country.regions) {
        map.set(`${country.id}:${region.id}`, region.code);
      }
    }
    return map;
  }, [hierarchy]);

  useEffect(() => {
    let cancelled = false;

    const publisherQuery: Record<string, string> = {};

    if (filters.district !== ALL_FILTER) {
      const districtCode = districtCodeByName.get(filters.district);
      if (districtCode) publisherQuery.district = districtCode;
    } else {
      const parsedScope = parseAreaScope(filters.areaScope);
      if (parsedScope.type === "country" && parsedScope.countryId) {
        const code = countryCodeById.get(parsedScope.countryId);
        if (code) publisherQuery.country = code;
      } else if (
        parsedScope.type === "region" &&
        parsedScope.countryId &&
        parsedScope.regionId
      ) {
        const countryCode = countryCodeById.get(parsedScope.countryId);
        const regionCode = regionCodeByScope.get(
          `${parsedScope.countryId}:${parsedScope.regionId}`
        );
        if (countryCode) publisherQuery.country = countryCode;
        if (regionCode) publisherQuery.region = regionCode;
      }
    }

    const cacheKey = JSON.stringify(publisherQuery);
    const cachedOptions = publisherOptionsCacheRef.current.get(cacheKey);

    if (cachedOptions) {
      setPublisherOptions(cachedOptions);
      return;
    }

    setPublisherOptions([
      { value: ALL_FILTER, label: "All publishers" },
      { value: "__loading__", label: "Loading publishers…" },
    ]);

    getPublishers(publisherQuery)
      .then((publishers) => {
        if (cancelled) return;

        const options: ExplorerFilterOption[] = [
          { value: ALL_FILTER, label: "All publishers" },
          ...publishers.map((name) => ({ value: name, label: name })),
        ];

        publisherOptionsCacheRef.current.set(cacheKey, options);
        setPublisherOptions(options);

        setFilters((current) => {
          if (
            current.publisher !== ALL_FILTER &&
            !publishers.includes(current.publisher)
          ) {
            return { ...current, publisher: ALL_FILTER };
          }
          return current;
        });
      })
      .catch(() => {
        if (cancelled) return;
        setPublisherOptions([{ value: ALL_FILTER, label: "All publishers" }]);
      });

    return () => { cancelled = true; };
  }, [filters.district, filters.areaScope, districtCodeByName, countryCodeById, regionCodeByScope]);

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
