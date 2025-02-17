// @flow

import { Node } from 'prosemirror-model';

import toCSSColor from './ui/toCSSColor.js';

import type { MarkSpec } from './Types.js';

const TextColorMarkSpec: MarkSpec = {
  attrs: {
    color: '',
    overridden: { default: false },
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      tag: 'span[style*=color]',
      getAttrs: (dom: HTMLElement) => {
        const { color } = dom.style;
        const overridden = dom.getAttribute('overridden') === 'true'; // Extract overridden flag
        return {
          color: toCSSColor(color),
          overridden
        };
      },
    },
  ],
  toDOM(node: Node) {
    const { color, overridden } = node.attrs;
    const attrs = {};
    // let style = '';
    if (color) {
      // style += `color: ${color};`;
      attrs.style = `color: ${color};`;
      attrs['overridden'] = overridden.toString();
    }
    return ['span', attrs, 0];
  },
};

export default TextColorMarkSpec;
