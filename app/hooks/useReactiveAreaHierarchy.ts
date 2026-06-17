"use client";

import { useEffect, useRef, useState } from "react";
import { ALL_FILTER } from "../lib/explore-filters";
import { transformAreasToHierarchy } from "../lib/areas-to-hierarchy";
import type { GeoHierarchy } from "../lib/geo-hierarchy";
import { getAllAreas } from "../services/areas";

interface Params {
  publisher: string;
  activity: string[];
  fallback: GeoHierarchy;
}

/**
 * Hierarchy narrowed to the countries/regions/districts that contain
 * data for the current publisher/activity filters. Returns `fallback`
 * (no network call) when both filters are ALL.
 */
export function useReactiveAreaHierarchy({
  publisher,
  activity,
  fallback,
}: Params): GeoHierarchy {
  const [hierarchy, setHierarchy] = useState<GeoHierarchy>(fallback);
  // Stores in-flight Promises (not resolved values). Resolved promises stay in the map for cheap re-use.
  const cacheRef = useRef<Map<string, Promise<GeoHierarchy>>>(new Map());

  useEffect(() => {
    const hasPublisher = publisher && publisher !== ALL_FILTER;
    const hasActivity = activity.length > 0;

    if (!hasPublisher && !hasActivity) {
      setHierarchy(fallback);
      return;
    }

    const query = {
      ...(hasPublisher ? { publisher } : {}),
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
  }, [publisher, activity, fallback]);

  return hierarchy;
}
