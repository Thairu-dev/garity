/**
 * Learning Note:
 * Utility functions are kept in a separate `utils/` directory to follow the
 * "single responsibility" principle. This formatter uses JavaScript's built-in
 * Intl.NumberFormat API for locale-aware currency formatting.
 * Keeping it as a pure function (no side effects) makes it easy to unit test
 * and reuse across components without duplication.
 */

/**
 * Formats a number as Kenyan Shillings (KES) with thousand separators.
 * @param {number} amount - The price to format
 * @returns {string} - Formatted price string (e.g., "KES 4,850,000")
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a number with K/M suffix for compact display.
 * @param {number} amount - The number to format
 * @returns {string} - Compact string (e.g., "4.85M")
 */
export function formatCompactPrice(amount) {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K`;
  }
  return amount.toString();
}
