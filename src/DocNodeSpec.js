// @flow

import convertToCSSPTValue from './convertToCSSPTValue.js';

export const LAYOUT = {
  
  US_LETTER_LANDSCAPE: 'us_letter_landscape',
  US_LETTER_PORTRAIT: 'us_letter_portrait',
  A4_LANDSCAPE: 'a4_landscape',
  A4_PORTRAIT: 'a4_portrait',
};

export const ATTRIBUTE_LAYOUT = 'data-layout';

export function getAttrs(el: HTMLElement): Object {
  const attrs: Object = {
    layout: null,
    width: null,
    padding: null,
  };

  const { width, maxWidth, padding } = el.style || {};
  const ww = convertToCSSPTValue(width) || convertToCSSPTValue(maxWidth);
  const pp = convertToCSSPTValue(padding);
  if (ww) {
    // 1pt = 1/72in
    // letter size: 8.5in x 11inch
    const ptWidth = ww + pp * 2;
    const inWidth = ptWidth / 72;
    const cmWidth = inWidth * 2.54;
    if (inWidth >= 10.9 && inWidth <= 11.1) {
      // Round up to letter size.
      attrs.layout = LAYOUT.US_LETTER_LANDSCAPE;
    } else if (inWidth >= 8.4 && inWidth <= 8.6) {
      // Round up to letter size.
      attrs.layout = LAYOUT.US_LETTER_PORTRAIT;
    } else if (cmWidth >= 29.5 && cmWidth <= 30.1) {
      attrs.layout = LAYOUT.A4_LANDSCAPE;
    } else if (cmWidth >= 20.5 && cmWidth <= 21.5) {
      attrs.layout = LAYOUT.A4_PORTRAIT;
    } else {
      attrs.width = ptWidth;
      if (pp) {
        attrs.padding = pp;
      }
    }
  }

  return attrs;
}

const DocNodeSpec = {
  attrs: {
    layout: { default: null },
    padding: { default: null },
    width: { default: null },
    // [FS] IRAD-1202 2021-02-15
    // Counter flags for Numbering
    counterFlags: { default: null },
  },
  content: 'block+',
};
export default DocNodeSpec;
