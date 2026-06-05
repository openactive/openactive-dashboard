"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";

import { useEscapeClose } from "../../hooks/useEscapeClose";
import { useFocusTrap } from "../../hooks/useFocusTrap";

interface RecordDetailDrawerProps {
  /** Stable id so triggering cards can aria-controls this drawer. */
  drawerId: string;
  /** Used as the dialog's accessible name (aria-labelledby target). */
  titleId: string;
  /** Rendered inside the dialog header above the title. */
  eyebrow?: ReactNode;
  /** The dialog's main heading text. Becomes the accessible name. */
  title: ReactNode;
  /** Body content — tabs and views slot in here. */
  children: ReactNode;
  onClose: () => void;
  /**
   * Element focus should return to when the drawer closes — usually the
   * card button that opened it. Optional because the section may unmount
   * the trigger if filters change.
   */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Responsive detail drawer for the records gallery.
 *
 * - Desktop (lg+): right-side panel ~36rem wide, content slides in over
 *   a soft scrim. Grid stays visible underneath the scrim so the user
 *   keeps context while inspecting a record.
 * - Mobile (<lg): full-width bottom sheet that fills most of the
 *   viewport, matching the existing ExplorerMobileSheet pattern.
 *
 * Behaviours:
 * - ESC closes
 * - Clicking the scrim closes
 * - Focus moves to the heading on mount (and again when the displayed
 *   record changes — see the `titleId` dep in the focus effect)
 * - Focus returns to `returnFocusRef` on unmount
 * - prefers-reduced-motion swaps the slide for instant appearance
 * - Tab/Shift+Tab are trapped inside the drawer
 * - role="dialog" + aria-modal="true" so screen readers treat the rest
 *   of the page as inert while the drawer is open
 */
export function RecordDetailDrawer({
  drawerId,
  titleId,
  eyebrow,
  title,
  children,
  onClose,
  returnFocusRef,
}: RecordDetailDrawerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEscapeClose(true, onClose);
  useFocusTrap(dialogRef, true, { restoreFocus: false });

  // Move focus to the heading on open and whenever the title changes
  // (which happens when the user clicks a different card without
  // closing the drawer first).
  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    // Defer to next frame so the dialog has actually mounted and the
    // focus call doesn't race the animation.
    const raf = requestAnimationFrame(() => {
      heading.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [titleId]);

  // Lock body scroll while the drawer is open so the scrim feels real.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Restore focus to the triggering card on unmount.
  useEffect(() => {
    return () => {
      returnFocusRef?.current?.focus();
    };
  }, [returnFocusRef]);

  return (
    <div
      // Fixed wrapper covers the viewport so the scrim and drawer can
      // be positioned without leaking into the page flow. z-50 keeps it
      // above the explorer's sticky elements.
      className="fixed inset-0 z-50 flex items-end justify-end lg:items-stretch"
      role="presentation"
    >
      {/* Scrim — clicking dismisses. aria-hidden because the dialog
          itself owns the accessible name. */}
      <div
        className="absolute inset-0 bg-oa-navy/40 backdrop-blur-[2px] motion-safe:animate-[fadeIn_180ms_ease-out]"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        id={drawerId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          // Layout: bottom sheet on small screens, right rail on lg+.
          "relative flex w-full flex-col bg-white shadow-[0_-12px_48px_rgba(34,53,130,0.18)]",
          // Bottom-sheet sizing for mobile/tablet
          "max-h-[92dvh] rounded-t-2xl",
          // Right-rail sizing for desktop — full height, fixed width
          "lg:h-dvh lg:max-h-none lg:w-[36rem] lg:rounded-none lg:rounded-l-2xl lg:shadow-[-12px_0_48px_rgba(34,53,130,0.18)]",
          // Slide-in motion; instant for reduced-motion users
          "motion-safe:animate-[slideUp_220ms_ease-out] motion-safe:lg:animate-[slideInRight_220ms_ease-out]",
        ].join(" ")}
      >
        {/* Mobile drag handle (decorative). */}
        <div
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/40 lg:hidden"
          aria-hidden="true"
        />

        <header className="flex shrink-0 items-start justify-between gap-4 border-b-4 border-oa-cyan bg-oa-navy px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                {eyebrow}
              </p>
            ) : null}
            <h2
              ref={headingRef}
              id={titleId}
              tabIndex={-1}
              className="mt-1 text-lg font-bold text-white focus:outline-none sm:text-xl"
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close record details"
            className="shrink-0 cursor-pointer rounded-full p-1.5 text-white/90 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
