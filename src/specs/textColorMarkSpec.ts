import { Mark, MarkSpec } from 'prosemirror-model';

import toCSSColor from '../toCSSColor';

const TextColorMarkSpec: MarkSpec = {
  attrs: {
    color: { default: '' },
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      style: 'color',
      getAttrs: (color: string): { [key: string]: unknown } | false => {
        return {
          color: toCSSColor(color),
        };
      },
    },
  ],
  toDOM(mark: Mark) {
    const { color } = mark.attrs;
    let style = '';
    if (color) {
      style += `color: ${color};`;
    }
    return ['span', { style }, 0];
  },
};

export default TextColorMarkSpec;
