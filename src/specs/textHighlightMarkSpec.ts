/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { Mark, MarkSpec, Node } from 'prosemirror-model';

import { isTransparent, toCSSColor } from '../toCSSColor';

const TextHighlightMarkSpec: MarkSpec = {
  attrs: {
    highlightColor: { default: null }, // Allow missing color
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

  toDOM(node: Mark | Node) {
    const { highlightColor, overridden } = node.attrs;
    const attrs = { style: '', };

    if (highlightColor) {
      attrs.style = `background-color: ${highlightColor};`;
    }

    // Store overridden flag properly as a data attribute
    attrs['overridden'] = overridden?.toString();

    return ['span', attrs, 0];
  },
};

export default TextHighlightMarkSpec;
