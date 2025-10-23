import { Mark, MarkSpec, Node } from 'prosemirror-model';

import toCSSColor from '../toCSSColor';

const TextColorMarkSpec: MarkSpec = {
  attrs: {
    color: { default: null }, //  Allow missing color
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
  toDOM(node: Mark | Node) {
    const { color, overridden } = node.attrs;
    const attrs = { style: '' };
    if (color) {
      attrs.style = `color: ${color};`;
      attrs['overridden'] = overridden?.toString();
    }
    return ['span', attrs, 0];
  },
};

export default TextColorMarkSpec;
