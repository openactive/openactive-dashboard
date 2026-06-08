/**
 * Pure helpers for turning an OpportunityRecord (a row from
 * /opportunity-records) into the strings the gallery and detail view
 * render. Centralised so the card and the tidy view stay in sync.
 *
 * `json_data` is `Record<string, unknown>` because publishers vary —
 * every reader narrows the bits it cares about defensively.
 */

import type { OpportunityRecord } from "../types/opportunity-records";

/** Friendly fallback when a record has no human-readable name. */
const FALLBACK_TITLE = "Untitled record";

const KIND_LABELS: Record<string, string> = {
  SessionSeries: "Session series",
  ScheduledSession: "Scheduled session",
  Event: "Event",
  EventSeries: "Event series",
  HeadlineEvent: "Headline event",
  OnDemandEvent: "On-demand event",
  CourseInstance: "Course instance",
  FacilityUse: "Facility use",
  IndividualFacilityUse: "Individual facility use",
  Slot: "Facility slot",
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getJsonField<T = unknown>(
  record: OpportunityRecord,
  key: string
): T | undefined {
  return record.json_data?.[key] as T | undefined;
}

/** Human-readable title — falls back through name → @type → fixed string. */
export function getRecordTitle(record: OpportunityRecord): string {
  const name = asString(getJsonField(record, "name"));
  if (name) return name;
  const kindLabel = KIND_LABELS[record.kind];
  return kindLabel ?? FALLBACK_TITLE;
}

/** Lowercase-first version of the @type suitable for inline prose. */
export function getRecordKindLabel(record: OpportunityRecord): string {
  return KIND_LABELS[record.kind] ?? record.kind;
}

/** Publisher → district summary used in card subtitles and aria labels. */
export function getRecordLocationLabel(record: OpportunityRecord): string | null {
  // Prefer the location.name from the raw payload (e.g. venue name) so
  // the card matches what publishers display on their own sites; fall
  // back to district when no venue is supplied.
  const placeName = asString(
    (getJsonField<{ name?: unknown }>(record, "location") ?? {}).name
  );
  if (placeName) return placeName;

  if (record.district_name) return record.district_name;
  if (record.region_name) return record.region_name;
  if (record.country_name) return record.country_name;
  return null;
}

/** First image URL, if the publisher supplied one. */
export function getRecordImageUrl(record: OpportunityRecord): string | null {
  const images = getJsonField<unknown>(record, "image");
  if (!Array.isArray(images)) return null;
  for (const item of images) {
    if (typeof item === "string") {
      const url = asString(item);
      if (url) return url;
    } else if (item && typeof item === "object") {
      const url = asString((item as { url?: unknown }).url);
      if (url) return url;
    }
  }
  return null;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * Card subtitle showing when the activity starts. Returns null when the
 * record has no usable date so the row can be omitted entirely instead
 * of rendering an empty placeholder.
 */
export function getRecordDateLabel(record: OpportunityRecord): string | null {
  if (!record.start_date) return null;
  const start = new Date(record.start_date);
  if (Number.isNaN(start.getTime())) return null;

  const startsAtMidnight =
    start.getUTCHours() === 0 &&
    start.getUTCMinutes() === 0 &&
    start.getUTCSeconds() === 0;

  // For series with no specific start time we just show the date.
  // For one-off sessions we include "at HH:mm" so the card is concrete.
  return startsAtMidnight
    ? DATE_FORMATTER.format(start)
    : `${DATE_FORMATTER.format(start)} at ${TIME_FORMATTER.format(start)}`;
}

export type RecordPrice =
  | { kind: "free" }
  | { kind: "fixed"; amount: number; currency: string }
  | { kind: "from"; amount: number; currency: string }
  | { kind: "unknown" };

/**
 * Reduce the record's offers into a single price line.
 * - All offers at 0 → "Free".
 * - One offer (or all offers same price) → fixed price.
 * - Multiple distinct prices → "From £X" using the minimum.
 */
export function getRecordPrice(record: OpportunityRecord): RecordPrice {
  const offers = getJsonField<unknown>(record, "offers");
  if (!Array.isArray(offers) || offers.length === 0) {
    return { kind: "unknown" };
  }

  const prices: number[] = [];
  let currency = "GBP";

  for (const offer of offers) {
    if (!offer || typeof offer !== "object") continue;
    const price = asNumber((offer as { price?: unknown }).price);
    if (price === null) continue;
    prices.push(price);
    const c = asString((offer as { priceCurrency?: unknown }).priceCurrency);
    if (c) currency = c;
  }

  if (prices.length === 0) return { kind: "unknown" };
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === 0 && max === 0) return { kind: "free" };
  if (min === max) return { kind: "fixed", amount: min, currency };
  return { kind: "from", amount: min, currency };
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
};

/** Render a `RecordPrice` for display. */
export function formatRecordPrice(price: RecordPrice): string {
  switch (price.kind) {
    case "free":
      return "Free";
    case "fixed":
      return `${formatCurrency(price.amount, price.currency)}`;
    case "from":
      return `From ${formatCurrency(price.amount, price.currency)}`;
    case "unknown":
      return "Price not listed";
  }
}

function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  // Drop trailing .00 for whole numbers; keep two decimals otherwise.
  return Number.isInteger(amount)
    ? `${symbol}${amount}`
    : `${symbol}${amount.toFixed(2)}`;
}

/** Compose a screen-reader sentence describing the card. */
export function getRecordCardAriaLabel(record: OpportunityRecord): string {
  const parts: string[] = [];
  parts.push(`Inspect record: ${getRecordTitle(record)}`);
  parts.push(getRecordKindLabel(record).toLowerCase());
  if (record.publisher_name) parts.push(`by ${record.publisher_name}`);
  const where = getRecordLocationLabel(record);
  if (where) parts.push(`in ${where}`);
  const when = getRecordDateLabel(record);
  if (when) parts.push(`starts ${when}`);
  parts.push(formatRecordPrice(getRecordPrice(record)).toLowerCase());
  return parts.join(", ");
}
