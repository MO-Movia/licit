// @flow

import { Node } from 'prosemirror-model';
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
      getAttrs(dom) {
        return {
          letterSpacing: dom.style.letterSpacing || null,
          overridden: dom.getAttribute('overridden') === 'true',
        };
      },
    },
  ],

  toDOM(node: Node) {
    const { letterSpacing, overridden } = node.attrs;
    const attrs = { overridden };
    if (letterSpacing) {
      attrs.style = `letter-spacing: ${letterSpacing}`;
    }
    return ['span', attrs, 0];
  },
};

export default LetterSpacingMarkSpec;
