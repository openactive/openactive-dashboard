"use client";

import { useState } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

import type { OpportunityRecord } from "../../types/opportunity-records";
import { getRecordImageUrl } from "../../lib/record-display";
import {
  formatOfferAmount,
  getRecordAccessibilitySupport,
  getRecordAgeRange,
  getRecordBookingUrl,
  getRecordDescription,
  getRecordGenderRestriction,
  getRecordIsCoached,
  getRecordLevel,
  getRecordOffersList,
  getRecordOrganizer,
  getRecordPlace,
  getRecordSchedule,
} from "../../lib/record-detail";

interface RecordTidyViewProps {
  record: OpportunityRecord;
}

/**
 * Friendly summary of an OpportunityRecord — the "Tidy view" tab.
 *
 * Headings start at h4 because the panel header already carries the
 * record name as h3. Sections are quietly omitted when the publisher
 * didn't supply the underlying field, so the surface stays clean
 * across very different feeds rather than rendering empty rows.
 *
 * Description is rendered as plain text (newlines preserved). See the
 * comment in `record-detail.ts` for why we don't render arbitrary
 * publisher HTML.
 */
export function RecordTidyView({ record }: RecordTidyViewProps) {
  const description = getRecordDescription(record);
  const schedule = getRecordSchedule(record);
  const place = getRecordPlace(record);
  const organizer = getRecordOrganizer(record);
  const ageRange = getRecordAgeRange(record);
  const gender = getRecordGenderRestriction(record);
  const level = getRecordLevel(record);
  const isCoached = getRecordIsCoached(record);
  const accessibility = getRecordAccessibilitySupport(record);
  const offers = getRecordOffersList(record);
  const bookingUrl = getRecordBookingUrl(record);

  const hasWho =
    organizer ||
    ageRange ||
    gender ||
    level ||
    isCoached !== null ||
    accessibility.length > 0;

  const hasActivities =
    record.activity.length > 0 || record.facility.length > 0;

  return (
    <div className="space-y-6">
      <RecordHero record={record} />

      {description ? (
        <Section heading="About">
          <p className="whitespace-pre-line text-sm leading-relaxed text-oa-grey-800">
            {description}
          </p>
        </Section>
      ) : null}

      {schedule.startLabel || schedule.endLabel ? (
        <Section heading="When">
          <dl className="grid gap-2 text-sm sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-x-4">
            {schedule.startLabel ? (
              <>
                <dt className="font-medium text-oa-grey-600">Starts</dt>
                <dd className="text-oa-grey-900">
                  {schedule.startLabel}
                  {schedule.startIso ? (
                    <span className="sr-only"> ({schedule.startIso})</span>
                  ) : null}
                </dd>
              </>
            ) : null}
            {schedule.endLabel ? (
              <>
                <dt className="font-medium text-oa-grey-600">Ends</dt>
                <dd className="text-oa-grey-900">
                  {schedule.endLabel}
                  {schedule.endIso ? (
                    <span className="sr-only"> ({schedule.endIso})</span>
                  ) : null}
                </dd>
              </>
            ) : null}
          </dl>
        </Section>
      ) : null}

      {place ? (
        <Section heading="Where">
          <address className="text-sm not-italic leading-relaxed text-oa-grey-900">
            {place.name ? (
              <span className="block font-medium">{place.name}</span>
            ) : null}
            {place.addressLines.map((line) => (
              <span key={line} className="block text-oa-grey-700">
                {line}
              </span>
            ))}
          </address>
        </Section>
      ) : null}

      {hasWho ? (
        <Section heading="Who it's for">
          <dl className="grid gap-2 text-sm sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-4">
            {organizer ? (
              <>
                <dt className="font-medium text-oa-grey-600">Organiser</dt>
                <dd className="text-oa-grey-900">
                  {organizer.url ? (
                    <ExternalLink href={organizer.url}>
                      {organizer.name}
                    </ExternalLink>
                  ) : (
                    organizer.name
                  )}
                </dd>
              </>
            ) : null}
            {ageRange ? (
              <>
                <dt className="font-medium text-oa-grey-600">Age range</dt>
                <dd className="text-oa-grey-900">
                  <span aria-hidden="true">{ageRange.label}</span>
                  <span className="sr-only">
                    {describeAgeRange(ageRange.min, ageRange.max)}
                  </span>
                </dd>
              </>
            ) : null}
            {gender ? (
              <>
                <dt className="font-medium text-oa-grey-600">
                  Gender restriction
                </dt>
                <dd className="text-oa-grey-900">{gender}</dd>
              </>
            ) : null}
            {level ? (
              <>
                <dt className="font-medium text-oa-grey-600">Level</dt>
                <dd className="text-oa-grey-900">{level}</dd>
              </>
            ) : null}
            {isCoached !== null ? (
              <>
                <dt className="font-medium text-oa-grey-600">Coached</dt>
                <dd className="text-oa-grey-900">
                  {isCoached ? "Yes" : "No"}
                </dd>
              </>
            ) : null}
            {accessibility.length > 0 ? (
              <>
                <dt className="font-medium text-oa-grey-600">Accessibility</dt>
                <dd className="text-oa-grey-900">
                  <ul className="flex flex-wrap gap-1.5">
                    {accessibility.map((label) => (
                      <li key={label}>
                        <span className="inline-block rounded-full bg-oa-grey-100 px-2.5 py-0.5 text-xs text-oa-grey-800">
                          <span className="sr-only">
                            Accessibility support:{" "}
                          </span>
                          {label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </>
            ) : null}
          </dl>
        </Section>
      ) : null}

      {hasActivities ? (
        <Section heading="Activities and facilities">
          <ul className="flex flex-wrap gap-1.5">
            {record.activity.map((label) => (
              <li key={`a-${label}`}>
                <span className="inline-block rounded-full bg-oa-blue/10 px-2.5 py-0.5 text-xs font-medium text-oa-blue">
                  <span className="sr-only">Activity: </span>
                  {label}
                </span>
              </li>
            ))}
            {record.facility.map((label) => (
              <li key={`f-${label}`}>
                <span className="inline-block rounded-full bg-oa-cyan/15 px-2.5 py-0.5 text-xs font-medium text-oa-navy">
                  <span className="sr-only">Facility: </span>
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {offers.length > 0 ? (
        <Section heading="Pricing">
          <dl className="divide-y divide-oa-grey-100 text-sm">
            {offers.map((offer, index) => {
              const offerKey = `${offer.name ?? "offer"}-${index}`;
              const amountLabel = formatOfferAmount(offer);
              return (
                <div
                  key={offerKey}
                  className="flex items-baseline justify-between gap-3 py-2"
                >
                  <dt className="min-w-0 flex-1">
                    <span className="font-medium text-oa-grey-900">
                      {offer.name ?? "Standard offer"}
                    </span>
                    {offer.description ? (
                      <span className="block text-xs text-oa-grey-600">
                        {offer.description}
                      </span>
                    ) : null}
                  </dt>
                  <dd className="shrink-0 text-right">
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        offer.price === 0
                          ? "text-emerald-600"
                          : "text-oa-grey-900"
                      }`}
                    >
                      <span className="sr-only">Price: </span>
                      {amountLabel}
                    </span>
                    {offer.url ? (
                      <span className="mt-0.5 block text-xs">
                        <ExternalLink href={offer.url}>Book this</ExternalLink>
                      </span>
                    ) : null}
                  </dd>
                </div>
              );
            })}
          </dl>
        </Section>
      ) : null}

      {bookingUrl ? (
        <Section heading="Book or learn more">
          <p className="text-sm">
            <ExternalLink href={bookingUrl} variant="prominent">
              View on {record.publisher_name || "publisher site"}
            </ExternalLink>
          </p>
        </Section>
      ) : null}
    </div>
  );
}

/** A labelled block within the tidy view. */
function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-oa-grey-600">
        {heading}
      </h4>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/**
 * External link with explicit "(opens in new tab)" sr-only context and
 * the rel attributes target=_blank requires for safety.
 */
function ExternalLink({
  href,
  children,
  variant = "inline",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "inline" | "prominent";
}) {
  const className =
    variant === "prominent"
      ? "inline-flex items-center gap-1.5 rounded-full bg-oa-blue px-4 py-2 text-sm font-semibold text-white hover:bg-oa-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
      : "inline-flex items-center gap-1 text-oa-blue underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan focus-visible:rounded-sm";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <ArrowTopRightOnSquareIcon
        className={
          variant === "prominent" ? "h-4 w-4" : "h-3.5 w-3.5 text-oa-blue/80"
        }
        aria-hidden="true"
      />
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}

/** Hero image at the top of the tidy view; quietly hides on load failure. */
function RecordHero({ record }: { record: OpportunityRecord }) {
  const url = getRecordImageUrl(record);
  const [failed, setFailed] = useState(false);
  if (!url || failed) return null;

  // Decorative — the panel header already announces the record name,
  // so adding it as alt text here would just repeat the title.
  return (
    <div className="overflow-hidden rounded-xl bg-oa-grey-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="h-48 w-full object-cover sm:h-64"
      />
    </div>
  );
}

function describeAgeRange(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `from ${min} to ${max} years old`;
  if (min !== null) return `${min} years and over`;
  if (max !== null) return `up to ${max} years old`;
  return "";
}
