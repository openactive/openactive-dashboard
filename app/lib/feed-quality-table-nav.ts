export const FEED_QUALITY_NAV_ATTR = "data-feed-quality-nav";

export function getFeedQualityNavTargets(
  container: HTMLElement | null
): HTMLElement[] {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(`[${FEED_QUALITY_NAV_ATTR}]`)
  );
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
