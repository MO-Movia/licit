// @flow

import type { MarkSpec } from './Types.js';

const LetterSpacingMarkSpec: MarkSpec = {
  attrs: {
    letterSpacing: { default: null },
    overridden: { default: false },
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      tag: 'span[style*=letter-spacing]',
      getAttrs: value => ({ letterSpacing: value }),
    },
  ],
  toDOM(mark) {
    return ["span", { style: `letter-spacing: ${mark.attrs.letterSpacing}` }, 0];
  },
};

export default LetterSpacingMarkSpec;
