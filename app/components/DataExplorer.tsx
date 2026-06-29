"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { GeoHierarchy } from "../lib/geo-hierarchy";
import {
  getAreaSelectionLabel,
  getSelectedDistrictNames,
} from "../lib/area-selection";
import {
  DEFAULT_EXPLORER_FILTERS,
  type ExplorerFilters,
} from "../lib/explore-filters";
import type { LocationScopedItem } from "../lib/explorer-location-query";
import { getActivities } from "../services/activities";
import { getOrganizations } from "../services/organizations";
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

  // Tracks which location-scoped dropdowns are open so their option lists are
  // fetched only while open, instead of eagerly on every filter change.
  const [openFilters, setOpenFilters] = useState<Set<LocationScopedItem>>(
    () => new Set()
  );
  const onFilterOpenChange = useCallback(
    (item: LocationScopedItem, open: boolean) => {
      setOpenFilters((current) => {
        if (current.has(item) === open) return current;
        const next = new Set(current);
        if (open) next.add(item);
        else next.delete(item);
        return next;
      });
    },
    []
  );

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

  // Option lists are fetched lazily (only when a dropdown opens), so a
  // selection can outlive the data it filters.
  const onOpportunitiesResolved = useCallback((present: PresentNames) => {
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

  const areaFilters = useMemo(
    () => ({ areas: filters.areas }),
    [filters.areas]
  );

  const publisherOptions = useLocationScopedFilterOptions({
    item: "publishers",
    allLabel: "All publishers",
    loadingLabel: "Loading publishers…",
    hierarchy,
    filters: areaFilters,
    enabled: openFilters.has("publishers"),
    fetchNames: getPublishers,
    organization: filters.organization,
    activity: filters.activity,
  });

  const organizationOptions = useLocationScopedFilterOptions({
    item: "organizations",
    allLabel: "All providers",
    loadingLabel: "Loading providers…",
    hierarchy,
    filters: areaFilters,
    enabled: openFilters.has("organizations"),
    fetchNames: getOrganizations,
    publisher: filters.publisher,
    activity: filters.activity,
  });

  const activityOptions = useLocationScopedFilterOptions({
    item: "activities",
    allLabel: "All activities and facilities",
    loadingLabel: "Loading activities…",
    hierarchy,
    filters: areaFilters,
    enabled: openFilters.has("activities"),
    fetchNames: getActivities,
    publisher: filters.publisher,
    organization: filters.organization,
  });

  // Summary card + map choropleth are both driven by /opportunities.
  const { summary, districtCounts, isLoading: isOpportunitiesLoading } =
    useReactiveOpportunities({
      filters,
      hierarchy,
      onResolved: onOpportunitiesResolved,
    });

  const selectionLabel = getAreaSelectionLabel(filters.areas, hierarchy);

  const mapScopeNames = useMemo(() => {
    const names = getSelectedDistrictNames(filters.areas, hierarchy);
    return names.length > 0 ? names : null;
  }, [filters.areas, hierarchy]);

  // A single chosen district still gets the strong "selected" emphasis on the
  // map; broader multi-area selections rely on the scope highlight instead.
  const selectedDistrict =
    mapScopeNames?.length === 1 ? mapScopeNames[0] : null;

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
      onFilterOpenChange,
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
      onFilterOpenChange,
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
            selectedDistrict={selectedDistrict}
            isLoading={isOpportunitiesLoading}
            onReset={onMapReset}
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
            isLoading={isOpportunitiesLoading}
            onReset={onMapReset}
          />
        </div>
      </div>
    </div>
  );
}
