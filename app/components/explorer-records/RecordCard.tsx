"use client";

import { useState } from "react";

import type { OpportunityRecord } from "../../types/opportunity-records";
import {
  formatRecordPrice,
  getRecordCardAriaLabel,
  getRecordDateLabel,
  getRecordImageUrl,
  getRecordKindLabel,
  getRecordLocationLabel,
  getRecordPrice,
  getRecordTitle,
} from "../../lib/record-display";

type RecordCardProps = {
  record: OpportunityRecord;
  isSelected: boolean;
  onSelect: (record: OpportunityRecord) => void;
};

/**
 * Single record tile for the gallery. Whole surface is one button so
 * the click target matches the visual footprint and screen-reader users
 * hear one composed label rather than several siblings.
 */
export function RecordCard({ record, isSelected, onSelect }: RecordCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const title = getRecordTitle(record);
  const kindLabel = getRecordKindLabel(record);
  const where = getRecordLocationLabel(record);
  const when = getRecordDateLabel(record);
  const imageUrl = getRecordImageUrl(record);
  const price = getRecordPrice(record);
  const priceLabel = formatRecordPrice(price);
  const ariaLabel = getRecordCardAriaLabel(record);

  const showImage = imageUrl && !imageFailed;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={ariaLabel}
      onClick={() => onSelect(record)}
      className={`group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-slate-200 transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan ${
        isSelected ? "ring-2 ring-oa-blue" : ""
      }`}
    >
      <div
        aria-hidden="true"
        className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100"
      >
        {showImage ? (
          // External hero from publisher feed; CSP allows https: img-src.
          // Decorative — the visible title and aria-label carry meaning.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <svg
              className="h-10 w-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="9" cy="11" r="1.5" fill="currentColor" />
              <path d="M21 17l-5-5-9 9" />
            </svg>
          </div>
        )}

        <span className="absolute bottom-2 right-2 rounded-full bg-slate-900/85 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <span className="sr-only">Type: </span>
          {kindLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h4 className="line-clamp-2 text-sm font-semibold text-slate-900">
          {title}
        </h4>

        <div className="space-y-1 text-xs text-slate-600">
          {when ? (
            <p className="truncate">
              <span className="sr-only">When: </span>
              {when}
            </p>
          ) : null}
          {where ? (
            <p className="truncate">
              <span className="sr-only">Where: </span>
              {where}
            </p>
          ) : null}
          <p className="truncate text-slate-500">
            <span className="sr-only">Published by: </span>
            {record.publisher_name}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span
            className={`text-sm font-semibold ${
              price.kind === "free" ? "text-emerald-600" : "text-slate-900"
            }`}
          >
            <span className="sr-only">Price: </span>
            {priceLabel}
          </span>
          {record.activity[0] ? (
            <span className="truncate rounded-full bg-oa-blue/10 px-2 py-0.5 text-xs font-medium text-oa-blue">
              <span className="sr-only">Activity: </span>
              {record.activity[0]}
              {record.activity.length > 1 ? ` +${record.activity.length - 1}` : ""}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
