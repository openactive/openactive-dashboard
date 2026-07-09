export const FEED_QUALITY_NAV_ATTR = "data-feed-quality-nav";

function isVisibleNavTarget(element: HTMLElement): boolean {
  if (!element.isConnected) return false;
  return element.getClientRects().length > 0;
}

export function getFeedQualityNavTargets(
  container: HTMLElement | null
): HTMLElement[] {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(`[${FEED_QUALITY_NAV_ATTR}]`)
  ).filter(isVisibleNavTarget);
}

export function focusFirstFeedQualityNav(container: HTMLElement | null) {
  const first = getFeedQualityNavTargets(container)[0];
  if (!first) return false;
  first.focus({ preventScroll: true });
  first.scrollIntoView({ block: "nearest" });
  return true;
}

export function focusAdjacentFeedQualityNav(
  container: HTMLElement | null,
  current: HTMLElement,
  direction: "prev" | "next"
) {
  const targets = getFeedQualityNavTargets(container);
  const index = targets.indexOf(current);
  if (index === -1) return false;

  const next = targets[index + (direction === "next" ? 1 : -1)];
  if (!next) return false;

  next.focus({ preventScroll: true });
  next.scrollIntoView({ block: "nearest" });
  return true;
}
