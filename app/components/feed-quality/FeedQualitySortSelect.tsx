"use client";

import { FilterDropdown, type FilterOption } from "../FilterDropdown";

export const SORT_KEYS = [
  "quality-best",
  "activities-most",
  "status-worst",
  "updated-newest",
  "name-asc",
  "name-desc",
] as const;

export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_LABELS: Record<SortKey, string> = {
  "quality-best": "Most qualitative first",
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
 * Pins the trigger to a fixed width so the toolbar doesn't reflow when the
 * selected label changes length.
 */
export function FeedQualitySortSelect({
  value,
  onChange,
}: FeedQualitySortSelectProps) {
  return (
    <div className="[&_button[aria-haspopup=listbox]]:w-72 [&_button[aria-haspopup=listbox]]:justify-between">
      <FilterDropdown
        label="Sort"
        options={SORT_OPTIONS}
        value={value}
        onChange={(next) => onChange(next as SortKey)}
      />
    </div>
  );
}
