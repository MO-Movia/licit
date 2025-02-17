// @flow

import { Node } from 'prosemirror-model';
import { isTransparent, toCSSColor } from './ui/toCSSColor.js';

import type { MarkSpec } from './Types.js';

const TextHighlightMarkSpec: MarkSpec = {
  attrs: {
    highlightColor: '',
    overridden: { default: false },
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      tag: 'span[style*=background-color]',
      priority: 100,
      getAttrs: (dom: HTMLElement) => {
        const { backgroundColor } = dom.style;
        const color = toCSSColor(backgroundColor);
        const overridden = dom.getAttribute('overridden') === 'true'; // Extract overridden flag

        return {
          highlightColor: isTransparent(color) ? '' : color,
          overridden, // Ensure overridden is captured
        };
      },
    },
  ],

  toDOM(node: Node) {
    const { highlightColor, overridden } = node.attrs;
    const attrs = {};

    if (highlightColor) {
      attrs.style = `background-color: ${highlightColor};`;
    }

    // Store overridden flag properly as a data attribute
    attrs['overridden'] = overridden.toString();

    return ['span', attrs, 0];
  },
};

export default TextHighlightMarkSpec;
