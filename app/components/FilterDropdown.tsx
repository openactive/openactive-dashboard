"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
  /** @deprecated use layout="field" */
  variant?: "default" | "onDark";
  layout?: "inline" | "field" | "glass";
}

/**
 * Accessible custom select — square corners, minimal shadow.
 */
export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  id,
  variant = "default",
  layout,
}: FilterDropdownProps) {
  const resolvedLayout =
    layout ?? (variant === "onDark" ? "glass" : "inline");
  const isGlass = resolvedLayout === "glass";
  const isField = resolvedLayout === "field" || isGlass;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = id
    ? `${id}-listbox`
    : `filter-${label.toLowerCase().replace(/\s+/g, "-")}-listbox`;

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
  }

  const triggerClass = isGlass
    ? "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-white/80 bg-white/70 px-3 py-2.5 text-left text-sm font-medium text-oa-navy shadow-sm backdrop-blur-sm hover:border-oa-cyan/50 hover:bg-white/85 focus:outline-none focus:border-oa-cyan focus:ring-2 focus:ring-oa-cyan/25"
    : resolvedLayout === "field"
      ? "flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm border border-oa-grey-300 bg-oa-grey-50 px-3 py-2.5 text-left text-sm font-medium text-oa-navy hover:border-oa-cyan hover:bg-white focus:outline-none focus:border-oa-cyan focus:ring-1 focus:ring-oa-cyan"
      : "inline-flex cursor-pointer items-center gap-2 rounded-sm border border-oa-grey-300 bg-white px-3 py-2 text-sm font-medium text-oa-grey-700 hover:bg-oa-grey-50 focus:outline-none focus:border-oa-cyan focus:ring-1 focus:ring-oa-cyan";

  const listClass = isGlass
    ? "absolute left-0 right-0 z-50 mt-1 max-h-60 w-full max-w-full min-w-0 overflow-auto rounded-lg border border-white/90 bg-white/95 py-1 shadow-lg backdrop-blur-md focus:outline-none"
    : "absolute left-0 right-0 z-50 mt-1 max-h-60 w-full max-w-full min-w-0 overflow-auto rounded-sm border border-oa-navy bg-white py-0 shadow-[4px_4px_0_0_#223582] focus:outline-none";

  if (isField) {
    return (
      <div
        ref={containerRef}
        className="relative w-full"
        onKeyDown={handleKeyDown}
      >
        <label
          htmlFor={id ? `${id}-trigger` : undefined}
          className={`block text-[11px] font-semibold uppercase tracking-widest mb-1.5 ${isGlass ? "text-oa-grey-500" : "font-bold tracking-[0.12em] text-oa-grey-500"}`}
        >
          {label}
        </label>
        <button
          id={id ? `${id}-trigger` : undefined}
          type="button"
          className={triggerClass}
          onClick={() => setOpen(!open)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label={`${label}: ${selectedOption?.label ?? "All"}`}
        >
          <span className="truncate">{selectedOption?.label ?? "All"}</span>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-oa-grey-500 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
        {open && (
          <ul id={listboxId} role="listbox" aria-label={label} className={listClass}>
            {options.map((option) => (
              <OptionItem
                key={option.value}
                option={option}
                selected={option.value === value}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              />
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block" onKeyDown={handleKeyDown}>
      <button
        type="button"
        className={`${triggerClass} cursor-pointer`}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={`${label}: ${selectedOption?.label ?? "All"}`}
      >
        <span className="text-oa-grey-500 font-normal">{label}:</span>
        <span>{selectedOption?.label ?? "All"}</span>
        <ChevronDownIcon
          className={`h-4 w-4 text-oa-grey-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul id={listboxId} role="listbox" aria-label={label} className={listClass}>
          {options.map((option) => (
            <OptionItem
              key={option.value}
              option={option}
              selected={option.value === value}
              onSelect={() => {
                onChange(option.value);
                setOpen(false);
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function OptionItem({
  option,
  selected,
  onSelect,
}: {
  option: FilterOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li
      role="option"
      aria-selected={selected}
      className={`cursor-pointer truncate border-b border-oa-grey-100 px-3 py-2 text-sm last:border-b-0 first:rounded-t-sm last:rounded-b-sm ${
        selected
          ? "bg-oa-navy text-white font-medium"
          : "text-oa-grey-800 hover:bg-oa-grey-50"
      }`}
      onClick={onSelect}
      title={option.label}
    >
      {option.label}
    </li>
  );
}
