/** Focusable descendants of `root`, excluding disabled and aria-hidden nodes. */
export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  const selector =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.getAttribute("aria-hidden") !== "true"
  );
}
