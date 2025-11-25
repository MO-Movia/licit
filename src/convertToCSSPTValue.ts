/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

export const PX_TO_PT_RATIO = 0.75292857;
export const PT_TO_PX_RATIO = 1 / PX_TO_PT_RATIO;

export default function convertToCSSPTValue(styleValue: string): number {
  if (!styleValue || typeof styleValue !== 'string') {
    return 0;
  }

  const trimmed = styleValue.trim().toLowerCase();

  let value = 0;
  let unit = '';

  if (trimmed.endsWith('px')) {
    unit = 'px';
    value = Number.parseFloat(trimmed.slice(0, -2));
  } else if (trimmed.endsWith('pt')) {
    unit = 'pt';
    value = Number.parseFloat(trimmed.slice(0, -2));
  } else {
    return 0;
  }

  if (Number.isNaN(value) || !unit) {
    return 0;
  }

  if (unit === 'px') {
    value *= PX_TO_PT_RATIO;
  }

  return value;
}

