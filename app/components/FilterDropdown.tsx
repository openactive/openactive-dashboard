"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useListbox, type ListboxOption } from "../hooks/useListbox";
import {
  ALL_FILTER,
  FILTER_EMPTY_VALUE,
  FILTER_LOADING_VALUE,
} from "../lib/explore-filters";
import {
  EXPLORER_GLASS_BACKDROP_BLUR_MD,
  EXPLORER_LABEL_BASE,
  EXPLORER_LABEL_DEFAULT_TEXT,
  EXPLORER_LABEL_GLASS_TEXT,
  EXPLORER_SHADOW_LG,
  EXPLORER_TRIGGER_FIELD_TAILWIND,
  EXPLORER_TRIGGER_GLASS_TAILWIND,
} from "../lib/explorer-ui-styles";

export type FilterOption = ListboxOption;

function isMessageOption(option: FilterOption): boolean {
  return (
    option.value === FILTER_LOADING_VALUE ||
    option.value === FILTER_EMPTY_VALUE
  );
}

function filterOptions(options: FilterOption[], query: string): FilterOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;

  return options.filter(
    (o) => !isMessageOption(o) && o.label.toLowerCase().includes(q)
  );
}

function getTriggerLabel(
  options: FilterOption[],
  value: string
): string {
  const emptyOption = options.find((o) => o.value === FILTER_EMPTY_VALUE);
  const hasSelectable = options.some((o) => !isMessageOption(o));

  if (emptyOption && !hasSelectable) {
    return emptyOption.label;
  }

  const selected = options.find((o) => o.value === value);
  if (selected && !isMessageOption(selected)) {
    return selected.label;
  }

  const allOption = options.find((o) => o.value === ALL_FILTER);
  return allOption?.label ?? "All";
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
  layout?: "inline" | "field" | "glass" | "sheet";
  /** Show a search field to filter options (for long lists). */
  searchable?: boolean;
}

/**
 * Accessible custom select
 */
export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  id,
  layout = "inline",
  searchable = false,
}: FilterDropdownProps) {
  const isGlass = layout === "glass";
  const isSheet = layout === "sheet";
  const isField = layout === "field" || isGlass || isSheet;
  const searchId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const displayOptions = useMemo(
    () => (searchable ? filterOptions(options, query) : options),
    [options, query, searchable]
  );

  const selectableOptions = useMemo(
    () => displayOptions.filter((o) => !isMessageOption(o)),
    [displayOptions]
  );

  const messageOptions = useMemo(
    () => displayOptions.filter(isMessageOption),
    [displayOptions]
  );

  const triggerLabel = getTriggerLabel(options, value);
  const hasSelectableSource = options.some((o) => !isMessageOption(o));

  const {
    open,
    setOpen,
    rootRef,
    triggerRef,
    listboxRef,
    triggerId,
    labelId,
    listboxId,
    openListbox,
    selectIndex,
    setOptionRef,
    handleTriggerKeyDown,
    handleRootKeyDown,
    handleOptionKeyDown,
    handleFocusLeave,
  } = useListbox({
    options: selectableOptions,
    value,
    onChange,
    idPrefix: id,
    focusOptionOnOpen: !searchable && selectableOptions.length > 0,
    typeahead: !searchable,
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    if (!searchable) return;
    requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [open, searchable]);

  const triggerClass = isGlass
    ? `flex w-full cursor-pointer items-center justify-between gap-2 ${EXPLORER_TRIGGER_GLASS_TAILWIND} font-medium`
    : isSheet || layout === "field"
      ? `flex w-full cursor-pointer items-center justify-between gap-2 ${EXPLORER_TRIGGER_FIELD_TAILWIND} font-medium`
      : "inline-flex cursor-pointer items-center gap-2 rounded-sm border border-oa-grey-300 bg-white px-3 py-2 text-sm font-medium text-oa-grey-700 hover:bg-oa-grey-50 focus:outline-none focus:border-oa-cyan focus:ring-1 focus:ring-oa-cyan";

  const listClass = isGlass
    ? `absolute left-0 right-0 z-50 mt-1 max-h-60 w-full max-w-full min-w-0 overflow-auto rounded-lg border border-white/90 bg-white/95 py-1 ${EXPLORER_SHADOW_LG} ${EXPLORER_GLASS_BACKDROP_BLUR_MD}`
    : isSheet
      ? `absolute left-0 right-0 z-50 mt-1 max-h-[min(28dvh,220px)] w-full max-w-full min-w-0 overflow-auto rounded-lg border border-oa-grey-200 bg-white py-1 ${EXPLORER_SHADOW_LG}`
      : "absolute left-0 right-0 z-50 mt-1 max-h-60 w-full max-w-full min-w-0 overflow-auto rounded-lg border border-oa-grey-200 bg-white py-1 shadow-lg";

  const optionList = (
    <>
      {messageOptions.map((option) => (
        <li
          key={option.value}
          role="presentation"
          className="border-b border-oa-grey-100 px-3 py-3 text-center text-sm text-oa-grey-500 last:border-b-0"
        >
          {option.label}
        </li>
      ))}
      {selectableOptions.map((option, index) => {
        const selected = option.value === value;
        return (
          <li
            key={option.value}
            role="presentation"
            className="border-b border-oa-grey-100 last:border-b-0"
          >
            <button
              ref={setOptionRef(index)}
              type="button"
              role="option"
              aria-selected={selected}
              className={`w-full cursor-pointer truncate px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-oa-cyan first:rounded-t-sm last:rounded-b-sm ${
                selected
                  ? "bg-oa-navy font-medium text-white"
                  : "text-oa-grey-800 hover:bg-oa-grey-50 focus:bg-oa-cyan/10"
              }`}
              onClick={() => selectIndex(index)}
              onKeyDown={(e) => handleOptionKeyDown(e, index)}
              title={option.label}
            >
              {option.label}
            </button>
          </li>
        );
      })}
      {searchable &&
        selectableOptions.length === 0 &&
        messageOptions.length === 0 && (
          <li className="px-3 py-4 text-center text-sm text-oa-grey-500">
            No matches for your search.
          </li>
        )}
    </>
  );

  const listbox = open ? (
    searchable ? (
      <div
        className={`${listClass} flex flex-col overflow-hidden py-0`}
      >
        {hasSelectableSource && (
        <div className="sticky top-0 z-10 shrink-0 border-b border-oa-grey-200 bg-white px-2 py-2">
          <label htmlFor={searchId} className="sr-only">
            Search {label.toLowerCase()}
          </label>
          <input
            ref={searchInputRef}
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                listboxRef.current
                  ?.querySelector<HTMLButtonElement>("button[role=option]")
                  ?.focus();
              }
            }}
            placeholder={`Search ${label.toLowerCase()}…`}
            className="w-full rounded-sm border border-oa-grey-300 bg-white px-2 py-1.5 text-sm text-oa-grey-800 placeholder:text-oa-grey-400 focus:border-oa-cyan focus:outline-none focus:ring-1 focus:ring-oa-cyan"
          />
        </div>
        )}
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={isField ? labelId : undefined}
          aria-label={isField ? undefined : label}
          className="max-h-48 overflow-y-auto py-1"
        >
          {optionList}
        </ul>
      </div>
    ) : (
      <ul
        ref={listboxRef}
        id={listboxId}
        role="listbox"
        aria-labelledby={isField ? labelId : undefined}
        aria-label={isField ? undefined : label}
        className={listClass}
      >
        {optionList}
      </ul>
    )
  ) : null;

  const root = (trigger: ReactNode) => (
    <div
      ref={rootRef}
      className={isField ? "relative w-full" : "relative inline-block"}
      onBlur={handleFocusLeave}
      onKeyDown={handleRootKeyDown}
    >
      {trigger}
      {listbox}
    </div>
  );

  if (isField) {
    return root(
      <>
        <label
          id={labelId}
          htmlFor={triggerId}
          className={`${EXPLORER_LABEL_BASE} ${
            isGlass ? EXPLORER_LABEL_GLASS_TEXT : EXPLORER_LABEL_DEFAULT_TEXT
          }`}
        >
          {label}
        </label>
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          className={triggerClass}
          onClick={() => (open ? setOpen(false) : openListbox())}
          onKeyDown={handleTriggerKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-labelledby={labelId}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-oa-grey-500 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </>
    );
  }

  return root(
    <button
      ref={triggerRef}
      id={triggerId}
      type="button"
      className={`${triggerClass} cursor-pointer`}
      onClick={() => (open ? setOpen(false) : openListbox())}
      onKeyDown={handleTriggerKeyDown}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-label={`${label}: ${triggerLabel}`}
    >
      <span className="font-normal text-oa-grey-500">{label}:</span>
      <span>{triggerLabel}</span>
      <ChevronDownIcon
        className={`h-4 w-4 text-oa-grey-500 transition-transform ${open ? "rotate-180" : ""}`}
        aria-hidden="true"
      />
    </button>
  );
}
