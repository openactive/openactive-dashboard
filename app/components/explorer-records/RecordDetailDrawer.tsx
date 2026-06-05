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
  /** aria-labelledby target. Change it to re-fire the focus-on-mount effect. */
  titleId: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  children: ReactNode;
  onClose: () => void;
  /** Element to return focus to on close — usually the triggering card. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Right-rail drawer (lg+) / bottom sheet (<lg) for inspecting a record.
 * Owns focus management and scrim; content slots in via children.
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

  // Focus the heading on mount and on record swap. Deferred a frame so
  // the focus call doesn't race the slide animation.
  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    const raf = requestAnimationFrame(() => {
      heading.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [titleId]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    return () => {
      returnFocusRef?.current?.focus();
    };
  }, [returnFocusRef]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end lg:items-stretch"
      role="presentation"
    >
      {/* Scrim — aria-hidden because the dialog owns the accessible name. */}
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
          "relative flex w-full flex-col bg-white shadow-[0_-12px_48px_rgba(34,53,130,0.18)]",
          "max-h-[92dvh] rounded-t-2xl",
          "lg:h-dvh lg:max-h-none lg:w-[36rem] lg:rounded-none lg:rounded-l-2xl lg:shadow-[-12px_0_48px_rgba(34,53,130,0.18)]",
          "motion-safe:animate-[slideUp_220ms_ease-out] motion-safe:lg:animate-[slideInRight_220ms_ease-out]",
        ].join(" ")}
      >
        {/* Mobile drag handle (decorative; matches ExplorerMobileSheet). */}
        <div
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-oa-grey-300 lg:hidden"
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
