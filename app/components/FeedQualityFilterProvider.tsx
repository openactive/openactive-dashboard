"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FilterQuery } from "../services/filter-params";

// A thin bus that carries the explorer's current search down to the Feed
// Quality section, which is a sibling on the page. The explorer publishes its
// derived query; Feed Quality reads it. Keeping only the finished query here
// means Feed Quality stays decoupled from the explorer's filter internals.
type FeedQualityFilterContextValue = {
  query: FilterQuery;
  setQuery: (query: FilterQuery) => void;
};

const FeedQualityFilterContext =
  createContext<FeedQualityFilterContextValue | null>(null);

// Stable fallbacks
const EMPTY_QUERY: FilterQuery = {};
const NOOP = () => {};

export function FeedQualityFilterProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState<FilterQuery>(EMPTY_QUERY);
  const value = useMemo(() => ({ query, setQuery }), [query]);
  return (
    <FeedQualityFilterContext.Provider value={value}>
      {children}
    </FeedQualityFilterContext.Provider>
  );
}

/** The explorer calls this to publish its current feed-quality query. */
export function usePublishFeedQualityFilters(): (query: FilterQuery) => void {
  return useContext(FeedQualityFilterContext)?.setQuery ?? NOOP;
}

/** Feed Quality reads the current query to fetch the matching feeds. */
export function useFeedQualityFilters(): FilterQuery {
  return useContext(FeedQualityFilterContext)?.query ?? EMPTY_QUERY;
}
