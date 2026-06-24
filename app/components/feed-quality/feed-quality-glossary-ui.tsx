"use client";

import { GlossaryTip } from "./GlossaryTip";
import {
  getColumnGlossary,
  lookupFeedType,
  type GlossaryEntry,
} from "../../lib/feed-quality-glossary";

/** Shared info-icon tooltip for a resolved glossary entry. */
function GlossaryIcon({
  entry,
  dark,
}: {
  entry: GlossaryEntry | undefined;
  dark?: boolean;
}) {
  if (!entry) return null;
  return (
    <GlossaryTip
      entry={entry}
      iconClassName="h-3.5 w-3.5"
      triggerClassName={dark ? "text-white/60 hover:text-white" : undefined}
    />
  );
}

export function FeedTypeGlossaryIcon({ feedType }: { feedType: string }) {
  return <GlossaryIcon entry={lookupFeedType(feedType)} />;
}

/** `dark` tints the icon for the navy table header. */
export function ColumnGlossaryIcon({
  colKey,
  dark,
}: {
  colKey: string;
  dark?: boolean;
}) {
  return <GlossaryIcon entry={getColumnGlossary(colKey)} dark={dark} />;
}
