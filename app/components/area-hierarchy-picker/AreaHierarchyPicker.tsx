"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useDisclosureTriggerKeyDown } from "../../hooks/useDisclosureTriggerKeyDown";
import { useEscapeClose } from "../../hooks/useEscapeClose";
import { useFocusLeaveClose } from "../../hooks/useFocusLeaveClose";
import { useTabExitClose } from "../../hooks/useTabExitClose";
import { isCoarsePointer } from "../../lib/pointer";
import type { ExplorerFilters } from "../../lib/explore-filters";
import type { GeoHierarchy } from "../../lib/geo-hierarchy";
import { getAreaSelectionLabel } from "../../lib/area-selection";
import {
  EXPLORER_LABEL_BASE,
  EXPLORER_LABEL_DEFAULT_TEXT,
  EXPLORER_LABEL_GLASS_TEXT,
  EXPLORER_TRIGGER_FIELD_TAILWIND,
  EXPLORER_TRIGGER_GLASS_TAILWIND,
} from "../../lib/explorer-ui-styles";
import { AreaPickerPanel } from "./AreaPickerPanel";
import type { AreaPickerVariant } from "./types";
import { useAreaPickerDrill } from "./use-area-picker-drill";

interface AreaHierarchyPickerProps {
  hierarchy: GeoHierarchy;
  filters: ExplorerFilters;
  onChange: (filters: ExplorerFilters) => void;
  variant?: AreaPickerVariant;
}

/**
 * Drill-down area picker: country → region → local area.
 */
export function AreaHierarchyPicker({
  hierarchy,
  filters,
  onChange,
  variant = "default",
}: AreaHierarchyPickerProps) {
  const isGlass = variant === "glass";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const titleId = `${listboxId}-title`;

  const closePicker = useCallback(() => setOpen(false), []);
  const openPicker = useCallback(() => setOpen(true), []);

  const {
    drill,
    query,
    setQuery,
    covered,
    draftAreas,
    toggleCountry,
    toggleRegion,
    toggleDistrict,
    goBack,
    drillToCountry,
    drillToRegion,
    panelTitle,
    backLabel,
  } = useAreaPickerDrill(hierarchy, filters, onChange, open);

  const triggerLabel = getAreaSelectionLabel(
    open ? draftAreas : filters.areas,
    hierarchy
  );

  useClickOutside(containerRef, open, closePicker);
  useEscapeClose(open, closePicker);
  const handleTriggerKeyDown = useDisclosureTriggerKeyDown({
    open,
    onOpen: openPicker,
    onClose: closePicker,
  });
  const handleFocusLeave = useFocusLeaveClose(containerRef, open, closePicker);
  const handleTabExit = useTabExitClose(containerRef, open, closePicker);

  const focusPanelEntry = useCallback(() => {
    // On touch, moving focus into the panel (especially the search input)
    // pops the soft keyboard and reflows the layout, which cancels the next
    // tap meant to close the picker. Leave focus on the trigger instead.
    if (isCoarsePointer()) return;
    requestAnimationFrame(() => {
      const input = document.getElementById(
        `${listboxId}-search`
      ) as HTMLInputElement | null;
      if (input) {
        input.focus();
        return;
      }
      if (backRef.current) {
        backRef.current.focus();
        return;
      }
      listRef.current
        ?.querySelector<HTMLButtonElement>("button[data-picker-option]")
        ?.focus();
    });
  }, [listboxId]);

  useEffect(() => {
    if (!open) return;
    focusPanelEntry();
  }, [open, drill, focusPanelEntry]);

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
    options[index + direction]?.focus();
  };

  const focusFirstOption = () => {
    listRef.current
      ?.querySelector<HTMLButtonElement>("button[data-picker-option]")
      ?.focus();
  };

  const focusSearchInput = () => {
    const input = document.getElementById(
      `${listboxId}-search`
    ) as HTMLInputElement | null;
    input?.focus();
  };

  const handlePanelKeyDown = (e: React.KeyboardEvent) => {
    handleTabExit(e);

    const target = e.target as HTMLElement;
    const isOption = target.matches("[data-picker-option]");
    const isSearchInput = target.id === `${listboxId}-search`;

    if (e.key === "ArrowDown") {
      if (isOption) {
        e.preventDefault();
        focusSiblingOption(target, 1);
      } else if (isSearchInput) {
        e.preventDefault();
        focusFirstOption();
      }
    } else if (e.key === "ArrowUp" && isOption) {
      e.preventDefault();
      const options = listRef.current
        ? Array.from(
            listRef.current.querySelectorAll<HTMLButtonElement>(
              "button[data-picker-option]"
            )
          )
        : [];
      if (options.indexOf(target as HTMLButtonElement) === 0) {
        focusSearchInput();
      } else {
        focusSiblingOption(target, -1);
      }
    } else if (
      e.key === "ArrowLeft" &&
      isOption &&
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
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-oa-grey-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <AreaPickerPanel
          listboxId={listboxId}
          titleId={titleId}
          variant={variant}
          drill={drill}
          query={query}
          panelTitle={panelTitle}
          backLabel={backLabel}
          hierarchy={hierarchy}
          covered={covered}
          listRef={listRef}
          backRef={backRef}
          onQueryChange={setQuery}
          onGoBack={goBack}
          onToggleCountry={toggleCountry}
          onToggleRegion={toggleRegion}
          onToggleDistrict={toggleDistrict}
          onDrillCountry={drillToCountry}
          onDrillRegion={drillToRegion}
        />
      )}
    </div>
  );
}
