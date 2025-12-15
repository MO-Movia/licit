/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {MarkSpec} from 'prosemirror-model';

const OverrideMarkSpec: MarkSpec = {
  attrs: {
    strong: {default: false},
    em: {default: false},
    underline: {default: false},
    strike: {default: false},
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      tag: 'span',
      getAttrs: (dom) => {
        if (typeof dom === 'string') return false;

        const element = dom;
        const strong = element.getAttribute('cs-strong') === 'true';
        const em = element.getAttribute('cs-em') === 'true';
        const underline = element.getAttribute('cs-underline') === 'true';
        const strike = element.getAttribute('cs-strike') === 'true';

        // Only create the mark if at least one attribute is true
        if (strong || em || underline || strike) {
          return {strong, em, underline, strike};
        }

        return false; // Ignore spans where all attributes are false
      },
    },
  ],
  toDOM: (mark, _inline) => {
    // Only render the <span> if at least one attribute is true
    if (
      mark.attrs.strong ||
      mark.attrs.em ||
      mark.attrs.underline ||
      mark.attrs.strike
    ) {
      return [
        'span',
        {
          'cs-strong': mark.attrs.strong,
          'cs-em': mark.attrs.em,
          'cs-underline': mark.attrs.underline,
          'cs-strike': mark.attrs.strike,
        },
        0,
      ];
    }

    // If no attributes are true, return nothing (ProseMirror will ignore this)
    return null;
  },
};

export default OverrideMarkSpec;
