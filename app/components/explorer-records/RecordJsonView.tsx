"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/20/solid";

import type { OpportunityRecord } from "../../types/opportunity-records";

interface RecordJsonViewProps {
  record: OpportunityRecord;
}

type CopyState = "idle" | "copied" | "error";

const COPY_RESET_MS = 2500;

/**
 * Raw JSON tab — pretty-prints the record's `json_data` so developers
 * can verify exactly what the publisher feed contains.
 *
 * Accessibility:
 * - The `<pre>` is keyboard-scrollable via tabIndex=0 and labelled so
 *   screen readers can name the region.
 * - The copy button announces success/failure through a polite live
 *   region instead of relying on the visual icon swap.
 */
export function RecordJsonView({ record }: RecordJsonViewProps) {
  const json = useMemo(
    () => JSON.stringify(record.json_data, null, 2),
    [record.json_data]
  );

  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const resetTimerRef = useRef<number | null>(null);

  // Cancel any pending reset on unmount or re-render so we don't
  // overwrite a fresh copy state with a stale "idle" reset.
  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
    }

    try {
      await copyToClipboard(json);
      setCopyState("copied");
      setStatusMessage("JSON copied to clipboard");
    } catch {
      setCopyState("error");
      setStatusMessage("Couldn’t copy JSON. Try selecting it manually.");
    }

    resetTimerRef.current = window.setTimeout(() => {
      setCopyState("idle");
      setStatusMessage("");
    }, COPY_RESET_MS);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-oa-grey-600">
          The exact OpenActive payload published by{" "}
          <span className="font-medium text-oa-grey-800">
            {record.publisher_name || "this operator"}
          </span>
          .
        </p>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy raw JSON to clipboard"
          className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan ${
            copyState === "copied"
              ? "bg-emerald-600 text-white"
              : copyState === "error"
                ? "bg-red-600 text-white"
                : "bg-oa-navy text-white hover:bg-oa-blue"
          }`}
        >
          {copyState === "copied" ? (
            <CheckIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />
          )}
          <span>
            {copyState === "copied"
              ? "Copied"
              : copyState === "error"
                ? "Failed"
                : "Copy JSON"}
          </span>
        </button>
      </div>

      {/* Polite live region for copy feedback. Empty until a copy
          happens, then reset to empty after a short delay so repeat
          copies are still announced. */}
      <p className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </p>

      <pre
        tabIndex={0}
        aria-label="Raw OpenActive JSON for this record"
        className="max-h-[60vh] overflow-auto rounded-xl bg-oa-navy/95 p-4 font-mono text-xs leading-relaxed text-emerald-100 ring-1 ring-oa-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
      >
        <code>{json}</code>
      </pre>
    </div>
  );
}

/**
 * Best-effort clipboard write. Modern browsers in a secure context use
 * `navigator.clipboard`; older browsers and non-HTTPS contexts fall
 * back to the deprecated `execCommand` route, which still works for
 * "copy" in every shipping browser.
 */
async function copyToClipboard(value: string): Promise<void> {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard?.writeText
  ) {
    await navigator.clipboard.writeText(value);
    return;
  }

  // Fallback: hidden textarea + execCommand("copy"). Throws if even
  // that fails (e.g. browser blocked the synchronous copy).
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!ok) throw new Error("Copy command rejected");
}
