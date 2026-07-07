"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useEscapeClose } from "../../hooks/useEscapeClose";
import type { GlossaryEntry } from "../../lib/feed-quality-glossary";

interface GlossaryTipProps {
  entry: GlossaryEntry;
  triggerClassName?: string;
  iconClassName?: string;
}

const GAP = 6;
const VIEWPORT_PADDING = 8;
const PANEL_WIDTH = 256;

const CLOSE_DELAY_MS = 120;

interface Coords {
  top: number;
  left: number;
}

/**
 * Accessible info-icon that explains a single glossary term.
 */
export function GlossaryTip({
  entry,
  triggerClassName,
  iconClassName,
}: GlossaryTipProps) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = pinned || hovered || focused;

  const wrapRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const panelId = useId();

  const [coords, setCoords] = useState<Coords | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const closeAll = useCallback(() => {
    clearCloseTimer();
    setPinned(false);
    setHovered(false);
    setFocused(false);
  }, [clearCloseTimer]);

  // Defer the hover-close so a quick hop onto the panel keeps it open.
  const scheduleHoverClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setHovered(false);
    }, CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const openHover = useCallback(() => {
    clearCloseTimer();
    setHovered(true);
  }, [clearCloseTimer]);

  useEscapeClose(open, closeAll);

  useClickOutside(wrapRef, pinned, closeAll, panelRef);

  // Position under the trigger, flipping above when it would clip the bottom.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setCoords(null);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight ?? 0;

    let left = rect.left + rect.width / 2 - PANEL_WIDTH / 2;
    left = Math.max(
      VIEWPORT_PADDING,
      Math.min(left, window.innerWidth - PANEL_WIDTH - VIEWPORT_PADDING)
    );

    const spaceBelow = window.innerHeight - rect.bottom;
    const flipsAbove =
      panelHeight > 0 &&
      spaceBelow < panelHeight + GAP + VIEWPORT_PADDING &&
      rect.top > spaceBelow;

    const top = flipsAbove ? rect.top - GAP - panelHeight : rect.bottom + GAP;

    setCoords({ top, left });
  }, [open]);

  // Any scroll moves the trigger but not a fixed panel, so close on scroll.
  useEffect(() => {
    if (!open) return;
    const handler = () => closeAll();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open, closeAll]);

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  const panel =
    open && coords ? (
      <div
        ref={panelRef}
        id={panelId}
        role="tooltip"
        onMouseEnter={openHover}
        onMouseLeave={scheduleHoverClose}
        style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          width: PANEL_WIDTH,
        }}
        className="z-[60] rounded-lg bg-white p-3 text-left shadow-xl ring-1 ring-oa-grey-200"
      >
        <p className="text-xs leading-relaxed text-oa-grey-600">
          {entry.definition}
        </p>
      </div>
    ) : null;

  return (
    <span
      ref={wrapRef}
      onMouseEnter={openHover}
      onMouseLeave={scheduleHoverClose}
      className="relative inline-flex align-middle"
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setPinned((prev) => !prev);
          setHovered(false);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={`What does ${entry.label} mean?`}
        aria-expanded={open}
        aria-describedby={open ? panelId : undefined}
        className={`inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan ${
          triggerClassName ?? "text-oa-grey-400 hover:text-oa-navy"
        }`}
      >
        <InformationCircleIcon
          aria-hidden="true"
          className={iconClassName ?? "h-4 w-4"}
        />
      </button>

      {typeof document !== "undefined" && panel
        ? createPortal(panel, document.body)
        : null}
    </span>
  );
}
