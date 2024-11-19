// @flow

export const PX_TO_PT_RATIO = 0.75292857;
export const PT_TO_PX_RATIO = 1 / PX_TO_PT_RATIO;

export default function convertToCSSPTValue(styleValue: string): number {
  const unit = styleValue.slice(-2).toLowerCase(); // Extract the last two characters for the unit
  const value = Number(styleValue.slice(0, -2)); // Extract and convert the number part

  if (!value || (unit !== 'px' && unit !== 'pt')) {
    return 0;
  }

  if (unit === 'px') {
    return PX_TO_PT_RATIO * value;
  }

  return value; // If 'pt', return the value unchanged
}
