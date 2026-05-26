"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  /** Label displayed on the trigger button */
  label: string;
  /** Available options */
  options: FilterOption[];
  /** Currently selected value */
  value: string;
  /** Callback when an option is selected */
  onChange: (value: string) => void;
  /** Optional id for linking with external label */
  id?: string;
}

/**
 * FilterDropdown — an accessible custom select/dropdown used for filtering data.
 * Uses a button + listbox pattern following WAI-ARIA guidelines.
 */
export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  id,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = id ? `${id}-listbox` : `filter-${label.toLowerCase().replace(/\s+/g, "-")}-listbox`;

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative inline-block" onKeyDown={handleKeyDown}>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md border border-oa-grey-300 bg-white px-3 py-2 text-sm font-medium text-oa-grey-700 shadow-sm hover:bg-oa-grey-50 focus:outline-none focus:ring-2 focus:ring-oa-cyan focus:ring-offset-1 transition-colors cursor-pointer"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={`${label}: ${selectedOption?.label ?? "None"}`}
      >
        <span className="text-oa-grey-500 font-normal">{label}:</span>
        <span>{selectedOption?.label ?? "All"}</span>
        <ChevronDownIcon
          className={`h-4 w-4 text-oa-grey-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute z-20 mt-1 max-h-60 w-full min-w-[10rem] overflow-auto rounded-md border border-oa-grey-200 bg-white py-1 shadow-lg focus:outline-none"
        >
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                option.value === value
                  ? "bg-oa-cyan/10 text-oa-cyan font-medium"
                  : "text-oa-grey-700 hover:bg-oa-grey-50"
              }`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
