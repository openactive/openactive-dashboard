"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { useDisclosureTriggerKeyDown } from "../hooks/useDisclosureTriggerKeyDown";
import { useEscapeClose } from "../hooks/useEscapeClose";
import { useFocusLeaveClose } from "../hooks/useFocusLeaveClose";
import { useTabExitClose } from "../hooks/useTabExitClose";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import type { GeoCountry, GeoHierarchy, GeoRegion } from "../lib/geo-hierarchy";
import { getAreaSelectionLabel } from "../lib/geo-hierarchy";
import { ALL_FILTER } from "../lib/explore-filters";
import type { ExplorerFilters } from "../lib/explore-filters";
import { selectArea, selectAreaScope } from "../lib/explore-filters";
import {
  EXPLORER_GLASS_BACKDROP_BLUR_MD,
  EXPLORER_LABEL_BASE,
  EXPLORER_LABEL_DEFAULT_TEXT,
  EXPLORER_LABEL_GLASS_TEXT,
  EXPLORER_SHADOW_LG,
  EXPLORER_TRIGGER_FIELD_TAILWIND,
  EXPLORER_TRIGGER_GLASS_TAILWIND,
} from "../lib/explorer-ui-styles";

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
  const listRef = useRef<HTMLUListElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const titleId = `${listboxId}-title`;

  const triggerLabel = getAreaSelectionLabel(
    hierarchy,
    filters.district,
    filters.areaScope
  );

  const closePicker = useCallback(() => setOpen(false), []);
  const openPicker = useCallback(() => setOpen(true), []);
  useClickOutside(containerRef, open, closePicker);
  useEscapeClose(open, closePicker);
  const handleTriggerKeyDown = useDisclosureTriggerKeyDown({
    open,
    onOpen: openPicker,
    onClose: closePicker,
  });
  const handleFocusLeave = useFocusLeaveClose(containerRef, open, closePicker);
  const handleTabExit = useTabExitClose(containerRef, open, closePicker);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDrill({ type: "root" });
    }
  }, [open]);

  const goBack = useCallback(() => {
    setDrill((current) => {
      if (current.type === "region") {
        return { type: "country", country: current.country };
      }
      return { type: "root" };
    });
    setQuery("");
  }, []);

  const focusPanelEntry = useCallback(() => {
    requestAnimationFrame(() => {
      if (backRef.current) {
        backRef.current.focus();
        return;
      }
      listRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    focusPanelEntry();
  }, [open, drill, focusPanelEntry]);

  function applyScope(scope: string) {
    onChange(selectAreaScope(filters, scope));
    setOpen(false);
  }

  function applyArea(name: string) {
    onChange(selectArea(filters, name));
    setOpen(false);
  }

  function drillToCountry(country: GeoCountry) {
    if (country.regions.length === 1) {
      const region = country.regions[0];
      if (region.areas.length <= 1 && region.areas[0]) {
        applyArea(region.areas[0].name);
        return;
      }
      setDrill({ type: "region", country, region });
      return;
    }
    setDrill({ type: "country", country });
  }

  function drillToRegion(country: GeoCountry, region: GeoRegion) {
    if (region.areas.length === 1 && region.areas[0]) {
      applyArea(region.areas[0].name);
      return;
    }
    setDrill({ type: "region", country, region });
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
              onSelect={() => drillToCountry(country)}
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
              onSelect={() => drillToRegion(country, region)}
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
            key={area.geoCode}
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
          <li className="px-4 py-6 text-center text-sm text-oa-grey-500">
            No areas match your search.
          </li>
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

  const backLabel =
    drill.type === "region"
      ? `Back to ${drill.country.label} regions`
      : drill.type === "country"
        ? "Back to all countries"
        : "";

  const focusSiblingOption = (current: HTMLElement, direction: 1 | -1) => {
    const options = listRef.current
      ? Array.from(
          listRef.current.querySelectorAll<HTMLButtonElement>(
            "button[data-picker-option]"
          )
        )
      : [];
    const index = options.indexOf(current as HTMLButtonElement);
    if (index < 0) return;
    const next = options[index + direction];
    next?.focus();
  };

  const handlePanelKeyDown = (e: React.KeyboardEvent) => {
    handleTabExit(e);

    const target = e.target as HTMLElement;
    if (e.key === "ArrowDown" && target.matches("[data-picker-option]")) {
      e.preventDefault();
      focusSiblingOption(target, 1);
    } else if (e.key === "ArrowUp" && target.matches("[data-picker-option]")) {
      e.preventDefault();
      focusSiblingOption(target, -1);
    } else if (
      e.key === "ArrowLeft" &&
      target.matches("[data-picker-option]") &&
      drill.type !== "root"
    ) {
      e.preventDefault();
      goBack();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onBlur={handleFocusLeave}
      onKeyDown={handlePanelKeyDown}
    >
      <label
        htmlFor={`${listboxId}-trigger`}
        className={`${EXPLORER_LABEL_BASE} ${
          isGlass ? EXPLORER_LABEL_GLASS_TEXT : EXPLORER_LABEL_DEFAULT_TEXT
        }`}
      >
        Area
      </label>
      <button
        id={`${listboxId}-trigger`}
        type="button"
        className={
          isGlass
            ? `flex w-full cursor-pointer items-center gap-2 ${EXPLORER_TRIGGER_GLASS_TAILWIND}`
            : `flex w-full cursor-pointer items-center gap-2 ${EXPLORER_TRIGGER_FIELD_TAILWIND}`
        }
        onClick={() => setOpen(!open)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
      >
        <span className="flex-1 truncate font-medium">{triggerLabel}</span>
        <ChevronRightIcon
          className={`h-4 w-4 shrink-0 text-oa-grey-500 transition-transform ${open ? "rotate-90" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={listboxId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className={`absolute left-0 right-0 z-50 mt-1 w-full max-w-full min-w-0 border bg-white ${
            isGlass
              ? `overflow-hidden rounded-lg border-white/90 bg-white/95 ${EXPLORER_SHADOW_LG} ${EXPLORER_GLASS_BACKDROP_BLUR_MD}`
              : isSheet
                ? `overflow-hidden rounded-lg border-oa-grey-200 ${EXPLORER_SHADOW_LG}`
                : "overflow-hidden rounded-sm border-oa-navy shadow-[6px_6px_0_0_#223582]"
          }`}
        >
          <div
            role="toolbar"
            aria-label="Area picker navigation"
            className="flex items-center gap-1 border-b border-oa-grey-200 bg-oa-grey-50 px-2 py-2"
          >
            {drill.type !== "root" && (
              <button
                ref={backRef}
                type="button"
                className="cursor-pointer rounded-sm p-1.5 text-oa-navy hover:bg-oa-grey-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
                onClick={goBack}
                aria-label={backLabel}
              >
                <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <p
              id={titleId}
              className="text-xs font-bold uppercase tracking-wide text-oa-navy"
            >
              {panelTitle}
            </p>
          </div>

          <p className="sr-only">
            Tab through options to choose a scope. Leaving the list with Tab
            closes this picker. Use the back button or press left arrow on an
            option to return to the previous level.
          </p>

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
            ref={listRef}
            role="group"
            aria-label={`${panelTitle} options`}
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
    <li className="border-b border-oa-grey-100 last:border-b-0">
      <button
        type="button"
        data-picker-option
        className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus:bg-oa-cyan/10 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-oa-cyan ${
          muted
            ? "text-oa-grey-400 hover:bg-oa-grey-50"
            : "text-oa-grey-800 hover:bg-oa-grey-50"
        }`}
        onClick={onSelect}
        aria-label={
          hasChildren ? `${label}, ${subLabel ?? ""}, opens sub-menu` : undefined
        }
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{label}</span>
          {subLabel && (
            <span className="block truncate text-xs text-oa-grey-500">
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
