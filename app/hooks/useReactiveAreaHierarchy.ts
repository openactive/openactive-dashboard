"use client";

import { useEffect, useRef, useState } from "react";
import { ALL_FILTER } from "../lib/explore-filters";
import { transformAreasToHierarchy } from "../lib/areas-to-hierarchy";
import type { GeoHierarchy } from "../lib/geo-hierarchy";
import { getAllAreas } from "../services/areas";

interface Params {
  publisher: string;
  activity: string;
  /** Used when no publisher/activity filter is active. */
  fallback: GeoHierarchy;
}

/**
 * Returns a hierarchy narrowed to the countries/regions/districts that
 * contain data given the current publisher/activity filters.
 *
 * When both filters are ALL, returns the provided fallback (no network call).
 * Otherwise fetches a narrowed /areas response and transforms it.
 */
export function useReactiveAreaHierarchy({
  publisher,
  activity,
  fallback,
}: Params): GeoHierarchy {
  const [hierarchy, setHierarchy] = useState<GeoHierarchy>(fallback);
  const cacheRef = useRef<Map<string, GeoHierarchy>>(new Map());

  useEffect(() => {
    const hasPublisher = publisher && publisher !== ALL_FILTER;
    const hasActivity = activity && activity !== ALL_FILTER;

    if (!hasPublisher && !hasActivity) {
      setHierarchy(fallback);
      return;
    }

    const query = {
      ...(hasPublisher ? { publisher } : {}),
      ...(hasActivity ? { activity } : {}),
    };
    const cacheKey = JSON.stringify(query);
    const cached = cacheRef.current.get(cacheKey);

    if (cached) {
      setHierarchy(cached);
      return;
    }

    let cancelled = false;
    getAllAreas(query)
      .then((raw) => {
        if (cancelled) return;
        const next = transformAreasToHierarchy(raw);
        cacheRef.current.set(cacheKey, next);
        setHierarchy(next);
      })
      .catch(() => {
        if (cancelled) return;
        setHierarchy(fallback);
      });

    return () => {
      cancelled = true;
    };
  }, [publisher, activity, fallback]);

  return hierarchy;
}
