/**
 * Detail-view helpers — pull structured fields out of an
 * OpportunityRecord's `json_data` for the tidy view.
 *
 * Every helper returns `null`/`[]` when the publisher didn't supply the
 * field. The tidy view uses those nulls to *omit* sections rather than
 * render placeholder dashes, so the detail surface stays clean even
 * when feeds vary in completeness.
 */

import type { OpportunityRecord } from "../types/opportunity-records";

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function getJsonField<T = unknown>(
  record: OpportunityRecord,
  key: string
): T | undefined {
  return record.json_data?.[key] as T | undefined;
}

/* -------------------------------------------------------------------------- */
/* Description                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Strip HTML tags from a description so we can render it as plain text.
 *
 * We deliberately render plain text (not sanitised HTML) to avoid
 * pulling in a sanitiser dependency for what most publishers supply as
 * paragraphs anyway. `<br>` and `</p>` are turned into newlines so the
 * `whitespace-pre-line` styling preserves paragraph structure. If we
 * ever need rich text we'd swap this for an isomorphic-dompurify pass
 * behind dangerouslySetInnerHTML.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function getRecordDescription(record: OpportunityRecord): string | null {
  const raw = asString(getJsonField(record, "description"));
  if (!raw) return null;
  const cleaned = stripHtml(raw);
  return cleaned.length > 0 ? cleaned : null;
}

/* -------------------------------------------------------------------------- */
/* When                                                                       */
/* -------------------------------------------------------------------------- */

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const FULL_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export interface RecordSchedule {
  /** Friendly start label, e.g. "Monday, 7 July 2025 at 18:30". */
  startLabel: string | null;
  /** Friendly end label, when supplied separately from start. */
  endLabel: string | null;
  /** Raw ISO start string for sr-only context. */
  startIso: string | null;
  /** Raw ISO end string for sr-only context. */
  endIso: string | null;
}

function formatDateTime(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const startsAtMidnight =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0;
  return startsAtMidnight
    ? FULL_DATE_FORMATTER.format(date)
    : `${FULL_DATE_FORMATTER.format(date)} at ${FULL_TIME_FORMATTER.format(date)}`;
}

export function getRecordSchedule(record: OpportunityRecord): RecordSchedule {
  return {
    startLabel: record.start_date ? formatDateTime(record.start_date) : null,
    endLabel: record.end_date ? formatDateTime(record.end_date) : null,
    startIso: record.start_date,
    endIso: record.end_date,
  };
}

/* -------------------------------------------------------------------------- */
/* Where                                                                      */
/* -------------------------------------------------------------------------- */

export interface RecordPlace {
  /** Venue name (e.g. "Stockwell Leisure Centre"). */
  name: string | null;
  /** Address lines, in display order; null entries are omitted. */
  addressLines: string[];
  /** True when at least one address line is present. */
  hasAddress: boolean;
}

interface RawAddress {
  streetAddress?: unknown;
  addressLocality?: unknown;
  addressRegion?: unknown;
  postalCode?: unknown;
  addressCountry?: unknown;
}

export function getRecordPlace(record: OpportunityRecord): RecordPlace | null {
  const location = getJsonField<{ name?: unknown; address?: unknown }>(
    record,
    "location"
  );
  if (!location || typeof location !== "object") return null;

  const name = asString((location as { name?: unknown }).name);
  const rawAddr = (location as { address?: unknown }).address;

  const addressLines: string[] = [];
  if (rawAddr && typeof rawAddr === "object") {
    const addr = rawAddr as RawAddress;
    const street = asString(addr.streetAddress);
    const locality = asString(addr.addressLocality);
    const region = asString(addr.addressRegion);
    const postal = asString(addr.postalCode);
    const country = asString(addr.addressCountry);

    if (street) addressLines.push(street);
    if (locality) addressLines.push(locality);
    if (region && region !== locality) addressLines.push(region);
    if (postal) addressLines.push(postal);
    if (country && country !== "GB") addressLines.push(country);
  } else if (typeof rawAddr === "string") {
    const flat = asString(rawAddr);
    if (flat) addressLines.push(flat);
  }

  if (!name && addressLines.length === 0) return null;

  return { name, addressLines, hasAddress: addressLines.length > 0 };
}

/* -------------------------------------------------------------------------- */
/* Who                                                                        */
/* -------------------------------------------------------------------------- */

export interface RecordOrganizer {
  name: string;
  url: string | null;
}

export function getRecordOrganizer(
  record: OpportunityRecord
): RecordOrganizer | null {
  const raw = getJsonField<unknown>(record, "organizer");
  if (!raw || typeof raw !== "object") return null;
  const name = asString((raw as { name?: unknown }).name);
  if (!name) return null;
  return {
    name,
    url: asString((raw as { url?: unknown }).url),
  };
}

export interface RecordAgeRange {
  min: number | null;
  max: number | null;
  /** Display label e.g. "16–65", "16+", "Up to 18". */
  label: string;
}

export function getRecordAgeRange(
  record: OpportunityRecord
): RecordAgeRange | null {
  const raw = getJsonField<unknown>(record, "ageRange");
  if (!raw || typeof raw !== "object") return null;
  const min = asNumber((raw as { minValue?: unknown }).minValue);
  const max = asNumber((raw as { maxValue?: unknown }).maxValue);
  if (min === null && max === null) return null;

  let label: string;
  if (min !== null && max !== null) label = `${min}\u2013${max}`;
  else if (min !== null) label = `${min}+`;
  else label = `Up to ${max}`;

  return { min, max, label };
}

const GENDER_LABELS: Record<string, string> = {
  "https://openactive.io/MaleOnly": "Men only",
  "https://openactive.io/FemaleOnly": "Women only",
  "https://openactive.io/NoRestriction": "Open to all",
  MaleOnly: "Men only",
  FemaleOnly: "Women only",
  NoRestriction: "Open to all",
};

export function getRecordGenderRestriction(
  record: OpportunityRecord
): string | null {
  const raw = asString(getJsonField(record, "genderRestriction"));
  if (!raw) return null;
  return GENDER_LABELS[raw] ?? raw;
}

const LEVEL_LABELS: Record<string, string> = {
  Beginner: "Beginner",
  Intermediate: "Intermediate",
  Advanced: "Advanced",
  Expert: "Expert",
  AllLevels: "All levels",
};

export function getRecordLevel(record: OpportunityRecord): string | null {
  const raw = getJsonField<unknown>(record, "level");
  if (Array.isArray(raw)) {
    const labels: string[] = [];
    for (const item of raw) {
      const label = asString(item);
      if (label) labels.push(LEVEL_LABELS[label] ?? label);
    }
    return labels.length ? labels.join(", ") : null;
  }
  const single = asString(raw);
  if (!single) return null;
  return LEVEL_LABELS[single] ?? single;
}

export function getRecordIsCoached(
  record: OpportunityRecord
): boolean | null {
  return asBoolean(getJsonField(record, "isCoached"));
}

export function getRecordAccessibilitySupport(
  record: OpportunityRecord
): string[] {
  const raw = getJsonField<unknown>(record, "accessibilitySupport");
  if (!Array.isArray(raw)) return [];
  const labels: string[] = [];
  for (const item of raw) {
    if (item && typeof item === "object") {
      const label = asString((item as { prefLabel?: unknown }).prefLabel);
      if (label) labels.push(label);
      continue;
    }
    const label = asString(item);
    if (label) labels.push(label);
  }
  return labels;
}

/* -------------------------------------------------------------------------- */
/* Pricing                                                                    */
/* -------------------------------------------------------------------------- */

export interface RecordOffer {
  name: string | null;
  /** Price in major units; 0 means free. Null when not specified. */
  price: number | null;
  currency: string;
  url: string | null;
  description: string | null;
}

export function getRecordOffersList(
  record: OpportunityRecord
): RecordOffer[] {
  const raw = getJsonField<unknown>(record, "offers");
  if (!Array.isArray(raw)) return [];
  const offers: RecordOffer[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as {
      name?: unknown;
      price?: unknown;
      priceCurrency?: unknown;
      url?: unknown;
      description?: unknown;
    };
    offers.push({
      name: asString(o.name),
      price: asNumber(o.price),
      currency: asString(o.priceCurrency) ?? "GBP",
      url: asString(o.url),
      description: asString(o.description),
    });
  }
  return offers;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
};

export function formatOfferAmount(offer: RecordOffer): string {
  if (offer.price === null) return "Price not listed";
  if (offer.price === 0) return "Free";
  const symbol = CURRENCY_SYMBOLS[offer.currency] ?? `${offer.currency} `;
  return Number.isInteger(offer.price)
    ? `${symbol}${offer.price}`
    : `${symbol}${offer.price.toFixed(2)}`;
}

/* -------------------------------------------------------------------------- */
/* Booking                                                                    */
/* -------------------------------------------------------------------------- */

export function getRecordBookingUrl(
  record: OpportunityRecord
): string | null {
  return asString(getJsonField(record, "url"));
}
