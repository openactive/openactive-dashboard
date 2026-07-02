import { AreaPickerRow } from "./AreaPickerRow";
import type { ExplorerFilterOption } from "../../lib/explore-filters";
import type { NhsTrustOptionsStatus } from "../../hooks/useNhsTrustOptions";

interface NhsTrustListProps {
  query: string;
  options: ExplorerFilterOption[];
  status: NhsTrustOptionsStatus;
  selected: string[];
  onToggle: (code: string, selected: boolean) => void;
}

function Message({ children }: { children: string }) {
  return (
    <li className="px-4 py-6 text-center text-sm text-oa-grey-500">
      {children}
    </li>
  );
}

// Searchable trust checklist. Options are { value: code, label: name }, so it
// shows trust names but toggles store trust codes.
export function NhsTrustList({
  query,
  options,
  status,
  selected,
  onToggle,
}: NhsTrustListProps) {
  if (status === "idle" || status === "loading") {
    return <Message>Loading NHS Trusts…</Message>;
  }
  if (status === "error") {
    return <Message>Couldn&rsquo;t load NHS Trusts. Please try again.</Message>;
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q))
    : options;

  if (filtered.length === 0) {
    return <Message>No NHS Trusts match your search.</Message>;
  }

  const selectedSet = new Set(selected);

  return (
    <>
      {filtered.map((opt) => {
        const checked = selectedSet.has(opt.value);
        return (
          <AreaPickerRow
            key={opt.value}
            label={opt.label}
            checkState={checked ? "checked" : "unchecked"}
            onToggle={() => onToggle(opt.value, !checked)}
          />
        );
      })}
    </>
  );
}
