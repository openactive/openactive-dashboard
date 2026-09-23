/** True when the primary pointing device is touch (coarse pointer). */
export function isCoarsePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

/** True when the device can hover with a fine pointer (typical desktop mouse). */
export function canHover(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(HOVER_QUERY).matches;
}
