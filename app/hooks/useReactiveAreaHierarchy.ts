"use client";

import { useEffect, useRef, useState } from "react";
import { transformAreasToHierarchy } from "../lib/areas-to-hierarchy";
import type { GeoHierarchy } from "../lib/geo-hierarchy";
import { getAllAreas } from "../services/areas";

interface Params {
  publisher: string[];
  organization: string[];
  activity: string[];
  fallback: GeoHierarchy;
}

/**
 * Hierarchy narrowed to the countries/regions/districts that contain
 * data for the current publisher/organization/activity filters. Returns
 * `fallback` (no network call) when all three are ALL.
 */
export function useReactiveAreaHierarchy({
  publisher,
  organization,
  activity,
  fallback,
}: Params): GeoHierarchy {
  const [hierarchy, setHierarchy] = useState<GeoHierarchy>(fallback);
  // Stores in-flight Promises (not resolved values). Resolved promises stay in the map for cheap re-use.
  const cacheRef = useRef<Map<string, Promise<GeoHierarchy>>>(new Map());

  useEffect(() => {
    const hasPublisher = publisher.length > 0;
    const hasOrganization = organization.length > 0;
    const hasActivity = activity.length > 0;

    if (!hasPublisher && !hasOrganization && !hasActivity) {
      setHierarchy(fallback);
      return;
    }

    const query = {
      ...(hasPublisher ? { publisher } : {}),
      ...(hasOrganization ? { organization } : {}),
      ...(hasActivity ? { activity } : {}),
    };
    const cacheKey = JSON.stringify(query);

    let promise = cacheRef.current.get(cacheKey);
    if (!promise) {
      promise = getAllAreas(query)
        .then(transformAreasToHierarchy)
        .catch((err) => {
          // Evict on failure so a later retry can actually re-fetch.
          cacheRef.current.delete(cacheKey);
          throw err;
        });
      cacheRef.current.set(cacheKey, promise);
    }

    let cancelled = false;
    promise
      .then((next) => {
        if (!cancelled) setHierarchy(next);
      })
      .catch(() => {
        if (!cancelled) setHierarchy(fallback);
      });

    return () => {
      cancelled = true;
    };
  }, [publisher, organization, activity, fallback]);

  return hierarchy;
}
