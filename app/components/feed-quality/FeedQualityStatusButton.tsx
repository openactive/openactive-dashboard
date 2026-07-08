"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { FeedQualityStatusIcon } from "./FeedQualityStatusIcon";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useEscapeClose } from "../../hooks/useEscapeClose";
import { useFocusLeaveClose } from "../../hooks/useFocusLeaveClose";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { STATUS_LABELS } from "../../lib/feed-quality";
import type { FeedStatus } from "../../types/feed-quality";

interface FeedQualityStatusButtonProps {
  status: FeedStatus;
  warnings: string[];
  errors: string[];
}

const STATUS_DESCRIPTION: Record<FeedStatus, string> = {
  OK: "Publishing well, no issues found.",
  WARNING: "Publishing, but some quality checks didn't pass.",
  ERROR: "Couldn't be assessed or has serious issues.",
};

const PANEL_WIDTH = 320;
const PANEL_GAP = 6;
const VIEWPORT_PADDING = 8;

export function FeedQualityStatusButton({
  status,
  warnings,
  errors,
}: FeedQualityStatusButtonProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const wrapRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const headingId = `${panelId}-heading`;

  const close = useCallback(() => setOpen(false), []);

  useEscapeClose(open, close);
  useClickOutside(wrapRef, open, close);
  const handleBlur = useFocusLeaveClose(wrapRef, open, close);
  useFocusTrap(panelRef, open && position !== null);

  // Position the panel under the button, flipped if it would clip the viewport.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setPosition(null);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    let left = rect.left;
    if (left + PANEL_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
      left = window.innerWidth - PANEL_WIDTH - VIEWPORT_PADDING;
    }
    if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;
    setPosition({ top: rect.bottom + PANEL_GAP, left });
  }, [open]);

  useEffect(() => {
    if (!open || !position) return;
    requestAnimationFrame(() => panelRef.current?.focus());
  }, [open, position]);

  // Close on any scroll — the button moves but a fixed-position panel doesn't
  // follow. Capture phase catches scrolls inside the bounded table too.
  useEffect(() => {
    if (!open) return;
    const handler = () => close();
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [open, close]);

  const hasIssues = warnings.length > 0 || errors.length > 0;

  return (
    <span
      ref={wrapRef}
      onBlur={handleBlur}
      className="relative inline-block"
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`View ${STATUS_LABELS[status]} status details`}
        className="cursor-pointer rounded-full p-1.5 hover:bg-oa-grey-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
      >
        <FeedQualityStatusIcon status={status} decorative />
      </button>

      {open && position && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={headingId}
          tabIndex={-1}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            width: PANEL_WIDTH,
          }}
          className="z-50 rounded-sm bg-white p-4 text-left shadow-lg ring-1 ring-oa-grey-200"
        >
          <p
            id={headingId}
            className="text-sm font-bold text-oa-navy"
          >
            {STATUS_LABELS[status]}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-oa-grey-600">
            {STATUS_DESCRIPTION[status]}
          </p>

          {hasIssues && (
            <div className="mt-3 space-y-3">
              {errors.length > 0 && (
                <IssueList
                  items={errors}
                  dotClass="bg-oa-scarlet"
                  // Only show the section label when both categories are
                  // present — otherwise the heading above already names it.
                  label={
                    warnings.length > 0
                      ? errors.length === 1
                        ? "Error"
                        : `Errors (${errors.length})`
                      : undefined
                  }
                />
              )}
              {warnings.length > 0 && (
                <IssueList
                  items={warnings}
                  dotClass="bg-oa-yellow"
                  label={
                    errors.length > 0
                      ? warnings.length === 1
                        ? "Warning"
                        : `Warnings (${warnings.length})`
                      : undefined
                  }
                />
              )}
            </div>
          )}
        </div>
      )}
    </span>
  );
}

function IssueList({
  items,
  dotClass,
  label,
}: {
  items: string[];
  dotClass: string;
  label?: string;
}) {
  return (
    <div>
      {label && (
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-oa-grey-700">
          {label}
        </p>
      )}
      <ul className={`${label ? "mt-1.5" : ""} space-y-1.5 text-sm leading-relaxed text-oa-grey-800`}>
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span
              aria-hidden="true"
              className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
