"use client";

import type { ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useListbox, type ListboxOption } from "../hooks/useListbox";
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

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
  layout?: "inline" | "field" | "glass" | "sheet";
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
}: FilterDropdownProps) {
  const isGlass = layout === "glass";
  const isSheet = layout === "sheet";
  const isField = layout === "field" || isGlass || isSheet;

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
  } = useListbox({ options, value, onChange, idPrefix: id });

  const selectedOption = options.find((o) => o.value === value);

  const triggerClass = isGlass
    ? `flex w-full cursor-pointer items-center justify-between gap-2 ${EXPLORER_TRIGGER_GLASS_TAILWIND} font-medium`
    : isSheet || layout === "field"
      ? `flex w-full cursor-pointer items-center justify-between gap-2 ${EXPLORER_TRIGGER_FIELD_TAILWIND} font-medium`
      : "inline-flex cursor-pointer items-center gap-2 rounded-sm border border-oa-grey-300 bg-white px-3 py-2 text-sm font-medium text-oa-grey-700 hover:bg-oa-grey-50 focus:outline-none focus:border-oa-cyan focus:ring-1 focus:ring-oa-cyan";

  const listClass = isGlass
    ? `absolute left-0 right-0 z-50 mt-1 max-h-60 w-full max-w-full min-w-0 overflow-auto rounded-lg border border-white/90 bg-white/95 py-1 ${EXPLORER_SHADOW_LG} ${EXPLORER_GLASS_BACKDROP_BLUR_MD}`
    : isSheet
      ? `absolute left-0 right-0 z-50 mt-1 max-h-[min(28dvh,220px)] w-full max-w-full min-w-0 overflow-auto rounded-lg border border-oa-grey-200 bg-white py-1 ${EXPLORER_SHADOW_LG}`
      : "absolute left-0 right-0 z-50 mt-1 max-h-60 w-full max-w-full min-w-0 overflow-auto rounded-sm border border-oa-navy bg-white py-0 shadow-[4px_4px_0_0_#223582]";

  const listbox = open ? (
    <ul
      ref={listboxRef}
      id={listboxId}
      role="listbox"
      aria-labelledby={isField ? labelId : undefined}
      aria-label={isField ? undefined : label}
      className={listClass}
    >
      {options.map((option, index) => {
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
    </ul>
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
          <span className="truncate">{selectedOption?.label ?? "All"}</span>
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
      aria-label={`${label}: ${selectedOption?.label ?? "All"}`}
    >
      <span className="font-normal text-oa-grey-500">{label}:</span>
      <span>{selectedOption?.label ?? "All"}</span>
      <ChevronDownIcon
        className={`h-4 w-4 text-oa-grey-500 transition-transform ${open ? "rotate-180" : ""}`}
        aria-hidden="true"
      />
    </button>
  );
}
