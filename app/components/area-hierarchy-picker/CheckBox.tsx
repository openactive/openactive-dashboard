import { CheckIcon, MinusIcon } from "@heroicons/react/20/solid";
import type { AreaCheckState } from "../../lib/area-selection";

// Decorative only: the wrapping button carries the real checked state for
// assistive tech, so the box itself is aria-hidden.
export function CheckBox({ state }: { state: AreaCheckState }) {
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
