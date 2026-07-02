import { ChevronRightIcon } from "@heroicons/react/20/solid";
import type { BoundaryType } from "../../lib/explore-filters";
import { CheckBox } from "./CheckBox";

const CHOICES: { value: BoundaryType; label: string; sub: string }[] = [
  {
    value: "lad",
    label: "Local authority boundaries",
    sub: "Browse by country, region and district",
  },
  {
    value: "nhs",
    label: "NHS Trust boundaries",
    sub: "Filter by NHS Trust",
  },
];

interface BoundaryChoiceListProps {
  boundaryType: BoundaryType;
  onChoose: (type: BoundaryType) => void;
}

// The picker's entry screen; choosing one swaps the panel to that boundary.
export function BoundaryChoiceList({
  boundaryType,
  onChoose,
}: BoundaryChoiceListProps) {
  return (
    <>
      {CHOICES.map((choice) => {
        const active = boundaryType === choice.value;
        return (
          <li
            key={choice.value}
            className="flex items-stretch border-b border-b-oa-grey-100 transition-colors last:border-b-0 hover:bg-oa-grey-50"
          >
            <button
              type="button"
              data-picker-option
              onClick={() => onChoose(choice.value)}
              aria-label={`Choose ${choice.label}`}
              aria-pressed={active}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 py-3 pl-3 pr-3 text-left text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-oa-cyan"
            >
              <CheckBox state={active ? "checked" : "unchecked"} />
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate ${
                    active
                      ? "font-semibold text-oa-navy"
                      : "font-medium text-oa-grey-800"
                  }`}
                >
                  {choice.label}
                </span>
                <span className="block truncate text-xs text-oa-grey-500">
                  {choice.sub}
                </span>
              </span>
              <ChevronRightIcon
                className="h-3.5 w-3.5 shrink-0 text-oa-grey-400"
                aria-hidden="true"
              />
            </button>
          </li>
        );
      })}
    </>
  );
}
