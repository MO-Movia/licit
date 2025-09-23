import { Mark, MarkSpec } from 'prosemirror-model';

import { isTransparent, toCSSColor } from '../toCSSColor';

const TextHighlightMarkSpec: MarkSpec = {
  attrs: {
    highlightColor: { default: '' },
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      tag: 'span[style*=background-color]',
      getAttrs: (dom: HTMLElement): { [key: string]: unknown } | false => {
        const { backgroundColor } = dom.style;
        const color = toCSSColor(backgroundColor);
        return {
          highlightColor: isTransparent(color) ? '' : color,
        };
      },
    },
  ],

  toDOM(mark: Mark) {
    const { highlightColor } = mark.attrs;
    let style = '';
    if (highlightColor) {
      style += `background-color: ${highlightColor};`;
    }
    return ['span', { style }, 0];
  },
};

export default TextHighlightMarkSpec;
