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
  const cacheRef = useRef<Map<string, GeoHierarchy>>(new Map());

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
