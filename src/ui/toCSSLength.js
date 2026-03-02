const NUMERIC_LENGTH_PATTERN = /^-?\d{1,1000}(\.\d{1,1000})?$/;

/**
 * @param {unknown} value
 * @returns {string | null}
 */
function normalizeCSSLength(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && isFinite(value)) {
    return `${value}px`;
  }
  const stringValue = String(value).trim();
  if (!stringValue) {
    return null;
  }
  if (NUMERIC_LENGTH_PATTERN.test(stringValue)) {
    return `${stringValue}px`;
  }
  return stringValue;
}

/**
 * @param {unknown} value
 * @returns {string | null}
 */
export function toCSSLengthOrNull(value) {
  return normalizeCSSLength(value);
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export default function toCSSLength(value) {
  return normalizeCSSLength(value) || '';
}
