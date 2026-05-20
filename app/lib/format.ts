/**
 * Format a large number into a human-readable abbreviated string.
 * e.g. 10461194 → "10.5m", 4885 → "4,885"
 */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) {
    const millions = n / 1_000_000;
    return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}m`;
  }
  return n.toLocaleString("en-GB");
}
