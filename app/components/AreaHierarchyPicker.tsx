"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import type { GeoCountry, GeoHierarchy, GeoRegion } from "../lib/geo-hierarchy";
import { getAreaSelectionLabel } from "../lib/geo-hierarchy";
import { ALL_FILTER } from "../lib/explore-filters";
import type { ExplorerFilters } from "../lib/explore-filters";
import { selectArea, selectAreaScope } from "../lib/explore-filters";

type DrillLevel =
  | { type: "root" }
  | { type: "country"; country: GeoCountry }
  | { type: "region"; country: GeoCountry; region: GeoRegion };

interface AreaHierarchyPickerProps {
  hierarchy: GeoHierarchy;
  filters: ExplorerFilters;
  districtsWithData: Set<string>;
  onChange: (filters: ExplorerFilters) => void;
  variant?: "default" | "glass" | "sheet";
}

/**
 * Drill-down area picker: country → region → local area.
 */
export function AreaHierarchyPicker({
  hierarchy,
  filters,
  districtsWithData,
  onChange,
  variant = "default",
}: AreaHierarchyPickerProps) {
  const isGlass = variant === "glass";
  const isSheet = variant === "sheet";
  const [open, setOpen] = useState(false);
  const [drill, setDrill] = useState<DrillLevel>({ type: "root" });
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const triggerLabel = getAreaSelectionLabel(
    hierarchy,
    filters.district,
    filters.areaScope
  );

  const closePicker = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, open, closePicker);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDrill({ type: "root" });
    }
  }, [open]);

  function applyScope(scope: string) {
    onChange(selectAreaScope(filters, scope));
    setOpen(false);
  }

  function applyArea(name: string) {
    onChange(selectArea(filters, name));
    setOpen(false);
  }

  function renderListItems() {
    if (drill.type === "root") {
      return (
        <>
          <PickerRow
            label="All areas"
            subLabel="United Kingdom & Ireland"
            onSelect={() => applyScope(ALL_FILTER)}
          />
          {hierarchy.countries.map((country) => (
            <PickerRow
              key={country.id}
              label={country.label}
              subLabel={`${country.regions.length} regions`}
              hasChildren
              onSelect={() => {
                if (country.regions.length === 1) {
                  const region = country.regions[0];
                  if (region.areas.length <= 1 && region.areas[0]) {
                    applyArea(region.areas[0].name);
                  } else {
                    setDrill({ type: "region", country, region });
                  }
                } else {
                  setDrill({ type: "country", country });
                }
              }}
            />
          ))}
        </>
      );
    }

    if (drill.type === "country") {
      const { country } = drill;
      return (
        <>
          <PickerRow
            label={`All of ${country.label}`}
            subLabel="Country-wide"
            onSelect={() => applyScope(`country:${country.id}`)}
          />
          {country.regions.map((region) => (
            <PickerRow
              key={region.id}
              label={region.label}
              subLabel={`${region.areas.length} areas`}
              hasChildren
              onSelect={() => {
                if (region.areas.length === 1 && region.areas[0]) {
                  applyArea(region.areas[0].name);
                } else {
                  setDrill({ type: "region", country, region });
                }
              }}
            />
          ))}
        </>
      );
    }

    const { country, region } = drill;
    const q = query.trim().toLowerCase();
    const areas = region.areas.filter((a) =>
      q ? a.name.toLowerCase().includes(q) : true
    );

    return (
      <>
        <PickerRow
          label={`All of ${region.label}`}
          subLabel={`${country.label} — region-wide`}
          onSelect={() =>
            applyScope(`region:${country.id}:${region.id}`)
          }
        />
        {areas.map((area) => (
          <PickerRow
            key={area.id}
            label={area.name}
            subLabel={
              districtsWithData.has(area.name)
                ? "Has data"
                : "No data in extract"
            }
            muted={!districtsWithData.has(area.name)}
            onSelect={() => applyArea(area.name)}
          />
        ))}
        {areas.length === 0 && (
          <p className="px-4 py-6 text-sm text-oa-grey-500 text-center">
            No areas match your search.
          </p>
        )}
      </>
    );
  }

  const panelTitle =
    drill.type === "root"
      ? "Choose a country"
      : drill.type === "country"
        ? drill.country.label
        : `${drill.country.label} › ${drill.region.label}`;

  return (
    <div ref={containerRef} className="relative w-full">
      <label
        htmlFor={`${listboxId}-trigger`}
        className={`block text-[11px] font-semibold uppercase tracking-widest mb-1.5 ${isGlass ? "text-oa-grey-500" : "font-bold tracking-[0.12em] text-oa-grey-500"}`}
      >
        Area
      </label>
      <button
        id={`${listboxId}-trigger`}
        type="button"
        className={
          isGlass
            ? "flex w-full cursor-pointer items-center gap-2 rounded-lg border border-white/80 bg-white/70 px-3 py-2.5 text-left text-sm text-oa-navy shadow-sm backdrop-blur-sm transition-colors hover:border-oa-cyan/50 hover:bg-white/85 focus:outline-none focus:border-oa-cyan focus:ring-2 focus:ring-oa-cyan/25"
            : "flex w-full cursor-pointer items-center gap-2 rounded-lg border border-oa-grey-300 bg-oa-grey-50 px-3 py-2.5 text-left text-sm text-oa-navy transition-colors hover:border-oa-cyan hover:bg-white focus:outline-none focus:border-oa-cyan focus:ring-2 focus:ring-oa-cyan/25"
        }
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
      >
        <span className="flex-1 truncate font-medium">{triggerLabel}</span>
        <ChevronRightIcon
          className={`h-4 w-4 shrink-0 text-oa-grey-500 transition-transform ${open ? "rotate-90" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 right-0 z-50 mt-1 w-full max-w-full min-w-0 border bg-white ${
            isGlass
              ? "overflow-hidden rounded-lg border-white/90 bg-white/95 shadow-lg backdrop-blur-md"
              : isSheet
                ? "overflow-hidden rounded-lg border-oa-grey-200 shadow-lg"
                : "overflow-hidden rounded-sm border-oa-navy shadow-[6px_6px_0_0_#223582]"
          }`}
          role="presentation"
        >
          <div className="flex items-center gap-1 border-b border-oa-grey-200 bg-oa-grey-50 px-2 py-2">
            {drill.type !== "root" && (
              <button
                type="button"
                className="cursor-pointer rounded-sm p-1.5 text-oa-navy hover:bg-oa-grey-200 focus:outline-none focus:ring-1 focus:ring-oa-cyan"
                onClick={() => {
                  if (drill.type === "region") {
                    setDrill({ type: "country", country: drill.country });
                  } else {
                    setDrill({ type: "root" });
                  }
                  setQuery("");
                }}
                aria-label="Go back"
              >
                <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <p className="text-xs font-bold uppercase tracking-wide text-oa-navy">
              {panelTitle}
            </p>
          </div>

          {drill.type === "region" && drill.region.areas.length > 8 && (
            <div className="border-b border-oa-grey-200 px-2 py-2">
              <label htmlFor={`${listboxId}-search`} className="sr-only">
                Search areas in {drill.region.label}
              </label>
              <input
                id={`${listboxId}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search areas…"
                className="w-full rounded-sm border border-oa-grey-300 bg-white px-2 py-1.5 text-sm text-oa-grey-800 placeholder:text-oa-grey-400 focus:border-oa-cyan focus:outline-none focus:ring-1 focus:ring-oa-cyan"
              />
            </div>
          )}

          <ul
            id={listboxId}
            role="listbox"
            aria-label={panelTitle}
            className={
              isSheet
                ? "max-h-[min(36dvh,380px)] overflow-y-auto"
                : "max-h-60 overflow-y-auto"
            }
          >
            {renderListItems()}
          </ul>
        </div>
      )}
    </div>
  );
}

function PickerRow({
  label,
  subLabel,
  hasChildren,
  muted,
  onSelect,
}: {
  label: string;
  subLabel?: string;
  hasChildren?: boolean;
  muted?: boolean;
  onSelect: () => void;
}) {
  return (
    <li role="presentation" className="border-b border-oa-grey-100 last:border-b-0">
      <button
        type="button"
        role="option"
        className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus:bg-oa-cyan/10 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-oa-cyan ${
          muted
            ? "text-oa-grey-400 hover:bg-oa-grey-50"
            : "text-oa-grey-800 hover:bg-oa-grey-50"
        }`}
        onClick={onSelect}
      >
        <span className="flex-1 min-w-0">
          <span className="block font-medium truncate">{label}</span>
          {subLabel && (
            <span className="block text-xs text-oa-grey-500 truncate">
              {subLabel}
            </span>
          )}
        </span>
        {hasChildren && (
          <ChevronRightIcon
            className="h-3.5 w-3.5 shrink-0 text-oa-grey-400"
            aria-hidden="true"
          />
        )}
      </button>
    </li>
  );
}
