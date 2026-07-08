"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useEscapeClose } from "../../hooks/useEscapeClose";
import {
  COMPLETENESS_BANDS,
  type CompletenessBand,
} from "../../lib/feed-quality";

const PANEL_WIDTH = 360;
const PANEL_GAP = 6;
const VIEWPORT_PADDING = 8;

const ORDER: CompletenessBand[] = ["high", "moderate", "low", "none", "na"];

// Representative number per band so the swatch matches an actual table cell.
const BAND_PREVIEW: Record<CompletenessBand, string> = {
  high: "92%",
  moderate: "54%",
  low: "18%",
  none: "0%",
  na: "—",
};

/**
 * Compact info-icon trigger that reveals the completeness colour bands.
 * Opens on hover, focus, or click; click pins it open so users can read
 * carefully without keeping the cursor still.
 */
export function FeedQualityColourKey() {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = pinned || hovered || focused;

  const wrapRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const headingId = `${panelId}-heading`;
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const closeAll = useCallback(() => {
    setPinned(false);
    setHovered(false);
    setFocused(false);
  }, []);

  useEscapeClose(open, closeAll);
  useClickOutside(wrapRef, pinned, closeAll);

  // Position the panel under the trigger, flipped if it would clip the viewport.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setPosition(null);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    let left = rect.right - PANEL_WIDTH;
    if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;
    if (left + PANEL_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
      left = window.innerWidth - PANEL_WIDTH - VIEWPORT_PADDING;
    }
    setPosition({ top: rect.bottom + PANEL_GAP, left });
  }, [open]);

  // Close on any scroll — the trigger moves but a fixed-position panel doesn't
  // follow. Capture phase catches scrolls inside the bounded table too.
  useEffect(() => {
    if (!open) return;
    const handler = () => closeAll();
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [open, closeAll]);

  return (
    <span
      ref={wrapRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative inline-flex"
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          // Pin or unpin. Clearing hovered means a click-to-unpin while still
          // hovering doesn't appear stuck open.
          setPinned((prev) => !prev);
          setHovered(false);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-oa-grey-300 px-3 py-1 text-xs font-semibold text-oa-grey-700 hover:border-oa-navy hover:text-oa-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
      >
        <InformationCircleIcon
          aria-hidden="true"
          className="h-4 w-4 text-oa-grey-500 group-hover:text-oa-navy"
        />
        <span>Colour key</span>
        {/* Tiny preview ribbon doubles as a glanceable mini-legend so users
            who never click can still read the colour gradation at a glance. */}
        <span aria-hidden="true" className="ml-0.5 flex items-center gap-0.5">
          {ORDER.map((key) => (
            <span
              key={key}
              className={`inline-block h-2.5 w-2.5 rounded-[2px] ${COMPLETENESS_BANDS[key].cellClass}`}
            />
          ))}
        </span>
      </button>

      {open && position && (
        <div
          id={panelId}
          role="dialog"
          aria-labelledby={headingId}
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
            className="text-xs font-bold uppercase tracking-[0.14em] text-oa-grey-600"
          >
            What the colours mean
          </p>
          <p className="mt-1 text-xs leading-relaxed text-oa-grey-600">
            Cells in the table are tinted by how often a field is filled in
            across each data&apos;s opportunities.
          </p>

          <ul className="mt-3 space-y-2.5">
            {ORDER.map((key) => {
              const band = COMPLETENESS_BANDS[key];
              return (
                <li key={key} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={`inline-flex h-7 w-12 shrink-0 items-center justify-center rounded-sm text-xs font-semibold ${band.cellClass}`}
                  >
                    {BAND_PREVIEW[key]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-oa-navy">
                      {band.label}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-oa-grey-600">
                      {band.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </span>
  );
}
