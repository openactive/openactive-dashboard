"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ExplorerFilters } from "../lib/explore-filters";
import { buildLocationFilterQuery } from "../lib/explorer-location-query";
import type { GeoHierarchy } from "../lib/geo-hierarchy";
import {
  EMPTY_SOCIO_CONTEXT,
  resolveSocioContext,
  type SocioContextView,
} from "../lib/socio-context";
import { getSocioContext } from "../services/socio";
import type { SocioAreaRow, SocioQuery } from "../types/socio";

type Params = {
  filters: ExplorerFilters;
  hierarchy: GeoHierarchy;
  totalOpportunities: number;
};

type Result = {
  context: SocioContextView;
  isLoading: boolean;
};

function toSocioQuery(
  locationQuery: ReturnType<typeof buildLocationFilterQuery>,
): SocioQuery {
  return {
    ...(locationQuery.district?.length
      ? { district: locationQuery.district }
      : {}),
    ...(locationQuery.region?.length ? { region: locationQuery.region } : {}),
    ...(locationQuery.country?.length ? { country: locationQuery.country } : {}),
  };
}

/**
 * Fetch /socio for the current location selection and reduce rows into the
 * view model the explorer context panel needs.
 *
 * Disabled in NHS mode — socio data is keyed by ONS geography, not trusts.
 * Raw rows are cached per location query; opportunitiesPer1000 is recomputed
 * when totalOpportunities changes without refetching.
 */
export function useSocioContext({
  filters,
  hierarchy,
  totalOpportunities,
}: Params): Result {
  const enabled = filters.boundaryType === "lad";
  const locationQuery = buildLocationFilterQuery(filters, hierarchy);
  const socioQuery = toSocioQuery(locationQuery);
  const cacheKey = JSON.stringify(socioQuery);

  const [rows, setRows] = useState<SocioAreaRow[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  const cacheRef = useRef<Map<string, Promise<SocioAreaRow[]>>>(new Map());

  useEffect(() => {
    if (!enabled) {
      setRows([]);
      setIsLoading(false);
      return;
    }

    let promise = cacheRef.current.get(cacheKey);
    if (!promise) {
      setIsLoading(true);
      promise = getSocioContext(socioQuery).catch((err) => {
        cacheRef.current.delete(cacheKey);
        throw err;
      });
      cacheRef.current.set(cacheKey, promise);
    }

    let cancelled = false;
    promise
      .then((next) => {
        if (cancelled) return;
        setRows(next);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cacheKey covers socioQuery
  }, [enabled, cacheKey]);

  const context = useMemo(() => {
    if (!enabled) return EMPTY_SOCIO_CONTEXT;
    return resolveSocioContext(rows, totalOpportunities);
  }, [enabled, rows, totalOpportunities]);

  return {
    context,
    isLoading: enabled && isLoading,
  };
}
