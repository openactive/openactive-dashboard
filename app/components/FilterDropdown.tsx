"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useListbox, type ListboxOption } from "../hooks/useListbox";
import {
  ALL_FILTER,
  FILTER_EMPTY_VALUE,
  FILTER_LOADING_VALUE,
} from "../lib/explore-filters";
import { isCoarsePointer } from "../lib/pointer";
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

const MULTI_DEBOUNCE_MS = 300;
const MAX_VISIBLE_PILLS = 2;

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

function getSingleTriggerLabel(
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

function getMultiTriggerLabel(
  options: FilterOption[],
  selected: readonly string[]
): string {
  if (selected.length === 0) {
    const allOption = options.find((o) => o.value === ALL_FILTER);
    return allOption?.label ?? "All";
  }
  if (selected.length === 1) {
    const opt = options.find((o) => o.value === selected[0]);
    return opt?.label ?? selected[0];
  }
  return `${selected.length} selected`;
}

type FilterDropdownSingleProps = {
  mode?: "single";
  value: string;
  onChange: (value: string) => void;
};

type FilterDropdownMultiProps = {
  mode: "multi";
  value: string[];
  onChange: (values: string[]) => void;
};

type FilterDropdownProps = (
  | FilterDropdownSingleProps
  | FilterDropdownMultiProps
) & {
  label: string;
  options: FilterOption[];
  id?: string;
  layout?: "inline" | "field" | "glass" | "sheet";
  searchable?: boolean;
};

export function FilterDropdown(props: FilterDropdownProps) {
  const { label, options, id, layout = "inline", searchable = false } = props;
  const isMulti = props.mode === "multi";
  const isGlass = layout === "glass";
  const isSheet = layout === "sheet";
  const isField = layout === "field" || isGlass || isSheet;
  const searchId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);
  // The sheet dropdown is portaled out of the explorer's overflow-hidden frame
  // so it can open downward over the content below. This ref marks that
  // portaled panel as "inside" for the close-on-outside / focus-leave logic.
  const portalRef = useRef<HTMLDivElement>(null);
  const [sheetCoords, setSheetCoords] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const [query, setQuery] = useState("");

  // Multi-select draft. Local Set for fast has/add/delete; synced from
  // props on open, committed via 300ms debounce, flushed on close.
  const [draft, setDraft] = useState<Set<string>>(
    () => new Set(isMulti ? (props as FilterDropdownMultiProps).value : [])
  );
  const draftRef = useRef(draft);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(props.onChange);

  // The debounce timer and the unmount cleanup read these refs after
  // render, so they need the latest values.
  useEffect(() => {
    draftRef.current = draft;
    onChangeRef.current = props.onChange;
  }, [draft, props.onChange]);

  const commitDraft = () => {
    if (!isMulti) return;
    (onChangeRef.current as FilterDropdownMultiProps["onChange"])(
      Array.from(draftRef.current)
    );
  };

  const scheduleCommit = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      commitDraft();
    }, MULTI_DEBOUNCE_MS);
  };

  const toggleValue = (val: string) => {
    if (val === ALL_FILTER) {
      // The 'All' row clears the multi-select draft. ALL_FILTER is the
      // single-mode sentinel; in multi mode an empty array is its
      // equivalent (no filter active).
      setDraft(new Set());
    } else {
      setDraft((prev) => {
        const next = new Set(prev);
        if (next.has(val)) next.delete(val);
        else next.add(val);
        return next;
      });
    }
    scheduleCommit();
  };

  // Skip the debounce: a pill click is a one-shot action, not part of
  // a series of toggles. Move focus back to the trigger because the
  // pill that had focus is about to be removed from the DOM.
  const removeValue = (val: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const next = new Set(draftRef.current);
    next.delete(val);
    setDraft(next);
    (onChangeRef.current as FilterDropdownMultiProps["onChange"])(
      Array.from(next)
    );
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  // Flush any pending draft on unmount so a sheet/modal close that
  // tears down the dropdown mid-debounce doesn't drop the toggles
  // the user just made.
  useEffect(
    () => () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        commitDraft();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount only
    []
  );

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

  const triggerLabel = isMulti
    ? getMultiTriggerLabel(
        options,
        (props as FilterDropdownMultiProps).value
      )
    : getSingleTriggerLabel(
        options,
        (props as FilterDropdownSingleProps).value
      );
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
    closeListbox,
    selectIndex,
    setOptionRef,
    handleTriggerKeyDown,
    handleRootKeyDown,
    handleOptionKeyDown,
    handleFocusLeave,
  } = useListbox({
    options: selectableOptions,
    value: isMulti ? "" : (props as FilterDropdownSingleProps).value,
    onChange: isMulti
      ? () => {}
      : (props as FilterDropdownSingleProps).onChange,
    idPrefix: id,
    focusOptionOnOpen: !searchable && selectableOptions.length > 0,
    typeahead: !searchable,
    outsideRef: portalRef,
  });

  // Multi mode: snapshot the parent value into the draft on open (handles
  // external resets like 'Clear all') and flush any pending commit on close.
  useEffect(() => {
    if (!isMulti) return;
    if (open) {
      setDraft(new Set((props as FilterDropdownMultiProps).value));
      return;
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      commitDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only fire on open transitions
  }, [isMulti, open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    if (!searchable) return;

    if (isCoarsePointer()) return;
    requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [open, searchable]);

  // Sheet layout: the options panel is portaled to the body so it escapes the
  // explorer's overflow-hidden frame and opens downward over the content
  // below. Anchor it to the trigger and let it use the space down to the
  // viewport bottom. Touch scroll is locked while the sheet is open, but
  // recompute on resize/scroll so it stays put if the layout shifts.
  useEffect(() => {
    if (!isSheet || !open) {
      setSheetCoords(null);
      return;
    }
    const compute = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const margin = 8;
      setSheetCoords({
        top: r.bottom + 4,
        left: r.left,
        width: r.width,
        maxHeight: window.innerHeight - r.bottom - margin,
      });
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [isSheet, open, triggerRef]);

  const triggerClass = isGlass
    ? `flex w-full cursor-pointer items-center justify-between gap-2 ${EXPLORER_TRIGGER_GLASS_TAILWIND} font-medium`
    : isSheet || layout === "field"
      ? `flex w-full cursor-pointer items-center justify-between gap-2 ${EXPLORER_TRIGGER_FIELD_TAILWIND} font-medium`
      : "inline-flex cursor-pointer items-center gap-2 rounded-sm border border-oa-grey-300 bg-white px-3 py-2 text-sm font-medium text-oa-grey-700 hover:bg-oa-grey-50 focus:outline-none focus:border-oa-cyan focus:ring-1 focus:ring-oa-cyan";

  const listClass = isGlass
    ? `absolute left-0 right-0 z-50 mt-1 max-h-60 w-full max-w-full min-w-0 overflow-auto rounded-lg border border-white/90 bg-white/95 py-1 ${EXPLORER_SHADOW_LG} ${EXPLORER_GLASS_BACKDROP_BLUR_MD}`
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
        const selected = isMulti
          ? option.value === ALL_FILTER
            ? draft.size === 0
            : draft.has(option.value)
          : option.value === (props as FilterDropdownSingleProps).value;
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
              className={`${
                isMulti
                  ? "flex w-full items-center gap-2"
                  : "w-full truncate"
              } cursor-pointer px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-oa-cyan first:rounded-t-sm last:rounded-b-sm ${
                selected
                  ? "bg-oa-navy font-medium text-white"
                  : "text-oa-grey-800 hover:bg-oa-grey-50 focus:bg-oa-cyan/10"
              }`}
              onClick={() =>
                isMulti ? toggleValue(option.value) : selectIndex(index)
              }
              onKeyDown={(e) => {
                // Multi mode: Enter closes (and flushes via the open/close
                // effect). Space falls through to the button's default
                // click → toggleValue, leaving the dropdown open.
                if (isMulti && e.key === "Enter") {
                  e.preventDefault();
                  closeListbox();
                  return;
                }
                handleOptionKeyDown(e, index);
              }}
              title={option.label}
            >
              {isMulti ? (
                <>
                  <span
                    aria-hidden="true"
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                      selected
                        ? "border-white bg-white text-oa-navy"
                        : "border-oa-grey-400 bg-white"
                    }`}
                  >
                    {selected && <CheckIcon className="h-3 w-3" />}
                  </span>
                  <span className="truncate">{option.label}</span>
                </>
              ) : (
                option.label
              )}
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
          aria-multiselectable={isMulti || undefined}
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
        aria-multiselectable={isMulti || undefined}
        aria-labelledby={isField ? labelId : undefined}
        aria-label={isField ? undefined : label}
        className={listClass}
      >
        {optionList}
      </ul>
    )
  ) : null;

  // Sheet layout: render the same anchored card, but portal it to the body so
  // it escapes the explorer's overflow-hidden frame and overlays the content
  // below the trigger instead of being clipped or cramped inside the sheet.
  const sheetPanel =
    isSheet && open && sheetCoords && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={portalRef}
            style={{
              position: "fixed",
              top: sheetCoords.top,
              left: sheetCoords.left,
              width: sheetCoords.width,
              maxHeight: sheetCoords.maxHeight,
            }}
            className={`z-[60] flex flex-col overflow-hidden rounded-lg border border-oa-grey-200 bg-white ${EXPLORER_SHADOW_LG}`}
          >
            {searchable && hasSelectableSource && (
              <div className="shrink-0 border-b border-oa-grey-200 bg-white px-2 py-2">
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
                  className="w-full rounded-sm border border-oa-grey-300 bg-white px-2 py-1.5 text-base text-oa-grey-800 placeholder:text-oa-grey-400 focus:border-oa-cyan focus:outline-none focus:ring-1 focus:ring-oa-cyan"
                />
              </div>
            )}
            <ul
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              aria-multiselectable={isMulti || undefined}
              aria-labelledby={labelId}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1"
            >
              {optionList}
            </ul>
          </div>,
          document.body
        )
      : null;

  const root = (trigger: ReactNode) => (
    <div
      ref={rootRef}
      className={isField ? "relative w-full" : "relative inline-block"}
      onBlur={handleFocusLeave}
      onKeyDown={handleRootKeyDown}
    >
      {trigger}
      {isSheet ? sheetPanel : listbox}
    </div>
  );

  if (isField) {
    if (isMulti) {
      const selected = (props as FilterDropdownMultiProps).value;
      const visiblePills = selected.slice(0, MAX_VISIBLE_PILLS);
      const overflow = selected.length - visiblePills.length;
      const allOption = options.find((o) => o.value === ALL_FILTER);
      const emptyLabel = allOption?.label ?? "All";

      // Pills sit alongside the trigger, not inside it: a button can't
      // contain another button. The wrapper carries the field styling
      // so they read as one control.
      const multiWrapperClass = isGlass
        ? "flex min-h-[2.625rem] w-full flex-wrap items-center gap-1.5 rounded-lg border border-white/80 bg-white/70 px-2 py-1.5 shadow-sm backdrop-blur-sm transition-colors hover:border-oa-cyan/50 hover:bg-white/85 focus-within:border-oa-cyan focus-within:ring-2 focus-within:ring-oa-cyan/25"
        : "flex min-h-[2.625rem] w-full flex-wrap items-center gap-1.5 rounded-lg border border-oa-grey-300 bg-oa-grey-50 px-2 py-1.5 transition-colors hover:border-oa-cyan hover:bg-white focus-within:border-oa-cyan focus-within:ring-2 focus-within:ring-oa-cyan/25";

      const pillClass =
        "inline-flex max-w-full cursor-pointer items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-oa-navy ring-1 ring-oa-grey-300 transition-colors hover:bg-oa-grey-50 hover:ring-oa-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan";

      const compactTriggerClass =
        "ml-auto inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-oa-grey-600 hover:text-oa-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan";

      const emptyTriggerClass =
        "flex flex-1 cursor-pointer items-center justify-between gap-2 rounded px-1 py-0.5 text-left text-sm text-oa-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan";

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
          <div className={multiWrapperClass}>
            {visiblePills.map((name) => {
              const optLabel =
                options.find((o) => o.value === name)?.label ?? name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => removeValue(name)}
                  aria-label={`Remove ${optLabel}`}
                  className={pillClass}
                  title={optLabel}
                >
                  <span className="truncate max-w-[10rem]">{optLabel}</span>
                  <XMarkIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                </button>
              );
            })}
            <button
              ref={triggerRef}
              id={triggerId}
              type="button"
              className={
                selected.length === 0 ? emptyTriggerClass : compactTriggerClass
              }
              onClick={() => (open ? setOpen(false) : openListbox())}
              onKeyDown={handleTriggerKeyDown}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-labelledby={`${labelId} ${triggerId}-state`}
            >
              <span id={`${triggerId}-state`} className="sr-only">
                {selected.length === 0
                  ? emptyLabel
                  : `${selected.length} selected`}
              </span>
              {selected.length === 0 ? (
                <span aria-hidden="true" className="truncate">
                  {emptyLabel}
                </span>
              ) : overflow > 0 ? (
                <span aria-hidden="true">+{overflow} more</span>
              ) : null}
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 text-oa-grey-500 transition-transform ${open ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </>
      );
    }

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
