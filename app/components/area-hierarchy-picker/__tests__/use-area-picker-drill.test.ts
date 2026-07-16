/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAreaPickerDrill } from "../use-area-picker-drill";
import { districtRef } from "../../../lib/area-selection";
import {
  DEFAULT_EXPLORER_FILTERS,
  type ExplorerFilters,
} from "../../../lib/explore-filters";
import { HARTLEPOOL, LEWES, testHierarchy } from "../../../lib/__fixtures__";

function renderDrill(
  open = false,
  filters: ExplorerFilters = DEFAULT_EXPLORER_FILTERS
) {
  const onChange = vi.fn<(filters: ExplorerFilters) => void>();

  const hook = renderHook(
    ({ open, filters }) =>
      useAreaPickerDrill(testHierarchy, filters, onChange, open),
    { initialProps: { open, filters } }
  );

  return { ...hook, onChange };
}

describe("useAreaPickerDrill", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resets the draft from committed filters when the panel opens", () => {
    const committed: ExplorerFilters = {
      ...DEFAULT_EXPLORER_FILTERS,
      areas: [districtRef(HARTLEPOOL.name)],
    };

    const { result, rerender } = renderDrill(false, committed);

    rerender({ open: true, filters: committed });

    expect(result.current.draftAreas).toEqual(committed.areas);
    expect(result.current.drill).toEqual({ type: "boundary-choice" });
    expect(result.current.query).toBe("");
  });

  it("does not call onChange while the panel is open", () => {
    const { result, onChange } = renderDrill(true);

    act(() => {
      result.current.chooseBoundary("lad");
      result.current.toggleDistrict(HARTLEPOOL.name, true);
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.draftAreas).toEqual([districtRef(HARTLEPOOL.name)]);
  });

  it("commits draft changes once when the panel closes", () => {
    const { result, rerender, onChange } = renderDrill(true);

    act(() => {
      result.current.chooseBoundary("lad");
      result.current.toggleDistrict(HARTLEPOOL.name, true);
      result.current.toggleDistrict(LEWES.hierarchyName, true);
    });

    const committedAreas = result.current.draftAreas;

    rerender({ open: false, filters: DEFAULT_EXPLORER_FILTERS });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_EXPLORER_FILTERS,
      areas: committedAreas,
    });
  });

  it("does not call onChange when closing without changes", () => {
    const { rerender, onChange } = renderDrill(true);

    rerender({ open: false, filters: DEFAULT_EXPLORER_FILTERS });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("syncs the draft when filters change while the panel is open", () => {
    const filters = { ...DEFAULT_EXPLORER_FILTERS };
    const { result, rerender } = renderDrill(true, filters);

    const mapSelection: ExplorerFilters = {
      ...filters,
      areas: [districtRef(HARTLEPOOL.name)],
    };

    rerender({ open: true, filters: mapSelection });

    expect(result.current.draftAreas).toEqual(mapSelection.areas);
  });

  it("commits NHS trust draft changes when the panel closes", () => {
    const { result, rerender, onChange } = renderDrill(true);

    act(() => {
      result.current.chooseBoundary("nhs");
      result.current.toggleNhsTrust("R0A", true);
    });

    rerender({ open: false, filters: DEFAULT_EXPLORER_FILTERS });

    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_EXPLORER_FILTERS,
      boundaryType: "nhs",
      nhsTrusts: ["R0A"],
    });
  });
});
