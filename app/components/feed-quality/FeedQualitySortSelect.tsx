"use client";

import { FilterDropdown, type FilterOption } from "../FilterDropdown";

const SORT_KEYS = [
  "quality-best",
  "activities-most",
  "status-worst",
  "updated-newest",
  "name-asc",
  "name-desc",
] as const;

export type SortKey = (typeof SORT_KEYS)[number];

const SORT_LABELS: Record<SortKey, string> = {
  "quality-best": "Highest quality first",
  "activities-most": "Most activities first",
  "status-worst": "Issues first",
  "updated-newest": "Last assessed (newest)",
  "name-asc": "Publisher (A–Z)",
  "name-desc": "Publisher (Z–A)",
};

const SORT_OPTIONS: FilterOption[] = SORT_KEYS.map((key) => ({
  value: key,
  label: SORT_LABELS[key],
}));

interface FeedQualitySortSelectProps {
  value: SortKey;
  onChange: (next: SortKey) => void;
}

/**
 * Pins the trigger to a fixed width on desktop so the toolbar doesn't reflow
 * when the selected label changes length. On mobile the trigger fills its
 * container so the dropdown sits flush with the search bar above it.
 */
export function FeedQualitySortSelect({
  value,
  onChange,
}: FeedQualitySortSelectProps) {
  return (
    <div className="w-full lg:w-auto [&_button[aria-haspopup=listbox]]:w-full [&_button[aria-haspopup=listbox]]:justify-between lg:[&_button[aria-haspopup=listbox]]:w-72">
      <FilterDropdown
        label="Sort"
        options={SORT_OPTIONS}
        value={value}
        onChange={(next) => onChange(next as SortKey)}
      />
    </div>
  );
}
