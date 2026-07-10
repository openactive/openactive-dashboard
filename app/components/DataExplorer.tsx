"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useLocationScopedFilterOptions } from "../hooks/useLocationScopedFilterOptions";
import { useReactiveOpportunities } from "../hooks/useReactiveOpportunities";
import type { PresentNames } from "../hooks/useReactiveOpportunities";
import { ExplorerFilterBar } from "./ExplorerFilterBar";
import { ExplorerSummary } from "./ExplorerSummary";
import {
  ExplorerMobileChrome,
  type MobilePanel,
} from "./ExplorerMobileChrome";
import { OpportunityMap } from "./OpportunityMap";
import { usePublishFeedQualityFilters } from "./FeedQualityFilterProvider";
import type { GeoHierarchy } from "../lib/geo-hierarchy";
import {
  getAreaSelectionLabel,
  getNhsTrustLabel,
  getSelectedDistrictNames,
  partitionAreaRefsToCodes,
  resolveDistrictNameFromMap,
  setDistrictSelected,
} from "../lib/area-selection";
import {
  DEFAULT_EXPLORER_FILTERS,
  type ExplorerFilters,
} from "../lib/explore-filters";
import { buildFeedQualityQuery } from "../lib/explorer-location-query";
import { useNhsTrustOptions } from "../hooks/useNhsTrustOptions";
import { getActivities } from "../services/activities";
import { getOrganizations } from "../services/organizations";
import { getPublishers } from "../services/publishers";
import type { MapAreaSelectPayload } from "./OpportunityMap";

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
  // Option lists read a deferred copy of the filters so the map and summary
  // commit first and the lists refresh after, so it never blocks the map.
  const deferredFilters = useDeferredValue(filters);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("none");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (isDesktop) setMobilePanel("none");
  }, [isDesktop]);

  // Gate so the initial load fetches opportunities before warming the three
  // option lists, instead of firing all four requests in parallel on mount.
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const onPublisherChange = useCallback(
    (values: string[]) =>
      setFilters((current) => ({ ...current, publisher: values })),
    []
  );

  const onOrganizationChange = useCallback(
    (values: string[]) =>
      setFilters((current) => ({ ...current, organization: values })),
    []
  );

  const onActivityChange = useCallback(
    (values: string[]) =>
      setFilters((current) => ({ ...current, activity: values })),
    []
  );

  const onMapReset = useCallback(
    () => setFilters(DEFAULT_EXPLORER_FILTERS),
    []
  );

  // Clicking a choropleth area replaces the location filter with that place
  // LAD uses district name refs; NHS uses trust codes.
  const onMapAreaSelect = useCallback(
    ({ key, name, code, boundaryType }: MapAreaSelectPayload) => {
      setFilters((current) => {
        if (boundaryType === "nhs") {
          if (
            current.boundaryType === "nhs" &&
            current.nhsTrusts.length === 1 &&
            current.nhsTrusts[0] === key
          ) {
            return current;
          }
          return {
            ...current,
            boundaryType: "nhs",
            nhsTrusts: [key],
            areas: [],
          };
        }

        const districtName =
          resolveDistrictNameFromMap(hierarchy, name, code) ?? name;
        const nextAreas = setDistrictSelected([], hierarchy, districtName, true);
        if (nextAreas.length === 0) return current;
        if (
          current.boundaryType === "lad" &&
          sameAreaList(current.areas, nextAreas)
        ) {
          return current;
        }
        return {
          ...current,
          boundaryType: "lad",
          areas: nextAreas,
          nhsTrusts: [],
        };
      });
    },
    [hierarchy]
  );

  // Opportunities is the source of truth for valid selections: drop any chosen
  // publisher, provider or activity it didn't return for the current filters.
  const onOpportunitiesResolved = useCallback((present: PresentNames) => {
    setHasLoadedOnce(true);
    setFilters((current) => {
      const publisher = current.publisher.filter((p) =>
        present.publishers.has(p)
      );
      const organization = current.organization.filter((o) =>
        present.organizations.has(o)
      );
      const activity = current.activity.filter((a) =>
        present.activities.has(a)
      );
      if (
        publisher.length === current.publisher.length &&
        organization.length === current.organization.length &&
        activity.length === current.activity.length
      ) {
        return current;
      }
      return { ...current, publisher, organization, activity };
    });
  }, []);

  const locationFilters = useMemo(
    () => ({
      boundaryType: deferredFilters.boundaryType,
      areas: deferredFilters.areas,
      nhsTrusts: deferredFilters.nhsTrusts,
    }),
    [
      deferredFilters.boundaryType,
      deferredFilters.areas,
      deferredFilters.nhsTrusts,
    ]
  );

  // Publish the current search to the Feed Quality section below, which fetches the feeds matching these filters.
  const publishFeedQualityFilters = usePublishFeedQualityFilters();
  const feedQualityQuery = useMemo(
    () => buildFeedQualityQuery(deferredFilters, hierarchy),
    [deferredFilters, hierarchy]
  );
  useEffect(() => {
    publishFeedQualityFilters(feedQualityQuery);
  }, [feedQualityQuery, publishFeedQualityFilters]);

  const publisherOptions = useLocationScopedFilterOptions({
    item: "publishers",
    allLabel: "All publishers",
    loadingLabel: "Loading publishers…",
    hierarchy,
    filters: locationFilters,
    enabled: hasLoadedOnce,
    fetchNames: getPublishers,
    organization: deferredFilters.organization,
    activity: deferredFilters.activity,
  });

  const organizationOptions = useLocationScopedFilterOptions({
    item: "organizations",
    allLabel: "All providers",
    loadingLabel: "Loading providers…",
    hierarchy,
    filters: locationFilters,
    enabled: hasLoadedOnce,
    fetchNames: getOrganizations,
    publisher: deferredFilters.publisher,
    activity: deferredFilters.activity,
  });

  const activityOptions = useLocationScopedFilterOptions({
    item: "activities",
    allLabel: "All activities and facilities",
    loadingLabel: "Loading activities…",
    hierarchy,
    filters: locationFilters,
    enabled: hasLoadedOnce,
    fetchNames: getActivities,
    publisher: deferredFilters.publisher,
    organization: deferredFilters.organization,
  });

  const { summary, districtCounts, isLoading: isOpportunitiesLoading } =
    useReactiveOpportunities({
      filters,
      hierarchy,
      onResolved: onOpportunitiesResolved,
    });

  // NHS Trust names for the selection label, loaded lazily only in NHS mode
  // (the picker uses the same cached hook, so this adds no extra fetch).
  const { options: nhsOptions } = useNhsTrustOptions(
    filters.boundaryType === "nhs"
  );

  // The "SELECTION" heading: LAD areas by name, NHS Trusts by their picker label.
  const selectionLabel =
    filters.boundaryType === "nhs"
      ? getNhsTrustLabel(filters.nhsTrusts, nhsOptions)
      : getAreaSelectionLabel(filters.areas, hierarchy);

  // What the map treats as "in scope". Local Authority mode scopes by district
  // name and code (basemap labels can drift from /areas names); NHS by trust code.
  const mapScopeNames = useMemo(() => {
    if (filters.boundaryType === "nhs") {
      return filters.nhsTrusts.length > 0 ? filters.nhsTrusts : null;
    }
    const names = getSelectedDistrictNames(filters.areas, hierarchy);
    if (names.length === 0) return null;
    const { district } = partitionAreaRefsToCodes(filters.areas, hierarchy);
    return district.length > 0 ? [...names, ...district] : names;
  }, [filters.boundaryType, filters.nhsTrusts, filters.areas, hierarchy]);

  // A single chosen area/trust still gets the strong "selected" emphasis on the
  // map; broader multi-selections rely on the scope highlight instead.
  // Prefer geo_code for a lone LAD so highlight still works when names differ.
  const selectedDistrict = useMemo(() => {
    if (filters.boundaryType === "nhs") {
      return filters.nhsTrusts.length === 1 ? filters.nhsTrusts[0] : null;
    }
    const { country, region, district } = partitionAreaRefsToCodes(
      filters.areas,
      hierarchy
    );
    if (country.length === 0 && region.length === 0 && district.length === 1) {
      return district[0];
    }
    const names = getSelectedDistrictNames(filters.areas, hierarchy);
    return names.length === 1 ? names[0] : null;
  }, [filters.boundaryType, filters.nhsTrusts, filters.areas, hierarchy]);

  const filterControlProps = useMemo(
    () => ({
      hierarchy,
      filters,
      publisherOptions,
      organizationOptions,
      activityOptions,
      onFiltersChange: setFilters,
      onPublisherChange,
      onOrganizationChange,
      onActivityChange,
    }),
    [
      hierarchy,
      filters,
      publisherOptions,
      organizationOptions,
      activityOptions,
      onPublisherChange,
      onOrganizationChange,
      onActivityChange,
    ]
  );

  return (
    <div className="mt-10" aria-label="Interactive map explorer">
      {/* Desktop filter bar — sits above the map */}
      <div id="explorer-filters" tabIndex={-1} className="hidden scroll-mt-4 lg:block focus:outline-none">
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
            selectedDistrict={selectedDistrict}
            boundaryType={filters.boundaryType}
            isLoading={isOpportunitiesLoading}
            onReset={onMapReset}
            onAreaSelect={onMapAreaSelect}
          />
        </div>
      </div>

      {/* Mobile / tablet: map fills the frame, chrome docks at the bottom. */}
      <div
        className={`relative mt-4 min-h-[min(88svh,780px)] overflow-hidden rounded-xl shadow-[0_12px_48px_rgba(34,53,130,0.12)] ring-1 ring-oa-grey-300/60 lg:hidden ${
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
            selectedDistrict={selectedDistrict}
            boundaryType={filters.boundaryType}
            isLoading={isOpportunitiesLoading}
            onReset={onMapReset}
            onAreaSelect={onMapAreaSelect}
          />
        </div>
      </div>
    </div>
  );
}

function sameAreaList(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}
