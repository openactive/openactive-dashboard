"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { groupFeedsByDataset, type FeedQualityGroup } from "../lib/feed-quality";
import { getFeedQuality } from "../services/feed-quality";
import type { FeedQualityRow } from "../types/feed-quality";

type FeedQualityResult = {
  rows: FeedQualityRow[];
  groups: FeedQualityGroup[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
};

export function useFeedQuality(enabled: boolean = true): FeedQualityResult {
  const [rows, setRows] = useState<FeedQualityRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getFeedQuality()
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load feed quality.");
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, reloadKey]);

  const groups = useMemo(() => groupFeedsByDataset(rows), [rows]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  return { rows, groups, isLoading, error, retry };
}
