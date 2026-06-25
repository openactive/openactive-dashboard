import {
  CheckIcon,
  ChevronRightIcon,
  MinusIcon,
} from "@heroicons/react/20/solid";
import type { AreaCheckState } from "../../lib/area-selection";

interface AreaPickerRowProps {
  label: string;
  subLabel?: string;
  checkState: AreaCheckState;
  onToggle: () => void;
  hasChildren?: boolean;
  onDrill?: () => void;
}

function CheckBox({ state }: { state: AreaCheckState }) {
  const filled = state !== "unchecked";
  return (
    <span
      aria-hidden="true"
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${
        filled
          ? "border-oa-cyan bg-oa-cyan text-white"
          : "border-oa-grey-400 bg-white"
      }`}
    >
      {state === "checked" && <CheckIcon className="h-3 w-3" />}
      {state === "indeterminate" && <MinusIcon className="h-3 w-3" />}
    </span>
  );
}

/**
 * One area row: a tri-state checkbox that toggles the node (cascading to its
 * children), and a body that drills into children when present or toggles a
 * leaf district when not.
 */
export function AreaPickerRow({
  label,
  subLabel,
  checkState,
  onToggle,
  hasChildren,
  onDrill,
}: AreaPickerRowProps) {
  const ariaChecked: boolean | "mixed" =
    checkState === "indeterminate" ? "mixed" : checkState === "checked";

  return (
    <li className="flex items-stretch border-b border-oa-grey-100 last:border-b-0">
      <button
        type="button"
        role="checkbox"
        aria-checked={ariaChecked}
        aria-label={label}
        onClick={onToggle}
        className="flex cursor-pointer items-center py-2.5 pl-3 pr-2 text-oa-grey-800 hover:bg-oa-grey-50 focus:bg-oa-cyan/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-oa-cyan"
      >
        <CheckBox state={checkState} />
      </button>
      <button
        type="button"
        data-picker-option
        onClick={hasChildren ? onDrill : onToggle}
        aria-label={hasChildren ? `Browse ${label}` : undefined}
        className="flex min-w-0 flex-1 items-center gap-2 py-2.5 pr-3 text-left text-sm text-oa-grey-800 transition-colors hover:bg-oa-grey-50 focus:bg-oa-cyan/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-oa-cyan"
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
