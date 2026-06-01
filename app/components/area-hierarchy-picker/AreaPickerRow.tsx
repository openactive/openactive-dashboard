import { ChevronRightIcon } from "@heroicons/react/20/solid";

interface AreaPickerRowProps {
  label: string;
  subLabel?: string;
  hasChildren?: boolean;
  muted?: boolean;
  selected?: boolean;
  onSelect: () => void;
}

export function AreaPickerRow({
  label,
  subLabel,
  hasChildren,
  muted,
  selected,
  onSelect,
}: AreaPickerRowProps) {
  return (
    <li className="border-b border-oa-grey-100 last:border-b-0">
      <button
        type="button"
        data-picker-option
        aria-current={selected ? "true" : undefined}
        className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-oa-cyan ${
          selected
            ? "bg-oa-navy text-white"
            : muted
              ? "text-oa-grey-400 hover:bg-oa-grey-50 focus:bg-oa-cyan/10"
              : "text-oa-grey-800 hover:bg-oa-grey-50 focus:bg-oa-cyan/10"
        }`}
        onClick={onSelect}
        aria-label={
          hasChildren ? `${label}, ${subLabel ?? ""}, opens sub-menu` : undefined
        }
      >
        <span className="min-w-0 flex-1">
          <span
            className={`block truncate ${selected ? "font-semibold" : "font-medium"}`}
          >
            {label}
          </span>
          {subLabel && (
            <span
              className={`block truncate text-xs ${selected ? "text-white/70" : "text-oa-grey-500"}`}
            >
              {subLabel}
            </span>
          )}
        </span>
        {hasChildren && (
          <ChevronRightIcon
            className={`h-3.5 w-3.5 shrink-0 ${selected ? "text-white/70" : "text-oa-grey-400"}`}
            aria-hidden="true"
          />
        )}
      </button>
    </li>
  );
}
