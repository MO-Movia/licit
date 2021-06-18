// @flow

// Line spacing names and their values.
export const LINE_SPACING_100 = '125%';
export const LINE_SPACING_115 = '138%';
export const LINE_SPACING_150 = '165%';
export const LINE_SPACING_200 = '232%';

export const SINGLE_LINE_SPACING = LINE_SPACING_100;
export const DOUBLE_LINE_SPACING = LINE_SPACING_200;

const NUMBER_VALUE_PATTERN = /^\d+(.\d+)?$/;

// Normalize the css line-height vlaue to percentage-based value if applicable.
// Also, it calibrates the incorrect line spacing value exported from Google
// Doc.
export default function toCSSLineSpacing(source: any): string {
  if (!source) {
    return '';
  }

  let strValue = String(source);

  // e.g. line-height: 1.5;
  if (NUMBER_VALUE_PATTERN.test(strValue)) {
    const numValue = parseFloat(strValue);
    strValue = String(Math.round(numValue * 100)) + '%';
  }

  // Google Doc exports line spacing with wrong values. For instance:
  // - Single => 100%
  // - 1.15 => 115%
  // - Double => 200%
  // But the actual CSS value measured in Google Doc is like this:
  // - Single => 125%
  // - 1.15 => 138%
  // - Double => 232%
  // The following `if` block will calibrate the value if applicable.

  if (strValue === '100%') {
    return LINE_SPACING_100;
  }

  if (strValue === '115%') {
    return LINE_SPACING_115;
  }

  if (strValue === '150%') {
    return LINE_SPACING_150;
  }

  if (strValue === '200%') {
    return LINE_SPACING_200;
  }

  // e.g. line-height: 15px;
  return strValue;
}

// [FS] IRAD-1104 2020-11-13
// Issue fix : Linespacing Double and Single not applied in the sample text paragraph
export function getLineSpacingValue(lineSpacing: string): string {
  let _lineSpaceValue = '';
  switch (lineSpacing) {
    case 'Single':
      _lineSpaceValue = SINGLE_LINE_SPACING;
      break;
    case '1.15':
      _lineSpaceValue = LINE_SPACING_115;
      break;
    case '1.5':
      _lineSpaceValue = LINE_SPACING_150;
      break;
    case 'Double':
      _lineSpaceValue = DOUBLE_LINE_SPACING;
      break;
    default:
      _lineSpaceValue = SINGLE_LINE_SPACING;
      break;
  }
  return _lineSpaceValue;
}
