// @flow

import { Node } from 'prosemirror-model';

import { isTransparent, toCSSColor } from './ui/toCSSColor';

import type { MarkSpec } from './Types';

const TextHighlightMarkSpec: MarkSpec = {
  attrs: {
    highlightColor: { default: '' },
    hasCitation: { default: false },
    pos: { default: null },
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      tag: 'span[style*=background-color]',
      getAttrs: (dom: HTMLElement) => {
        const { backgroundColor, zIndex, opacity } = dom.style;
        const color = toCSSColor(backgroundColor);
        return {
          highlightColor: isTransparent(color) ? '' : color,
          hasCitation: zIndex === '1' ? true : false,
          pos: opacity,
        };
      },
    },
  ],

  toDOM(node: Node) {
    const { highlightColor, hasCitation, pos } = node.attrs;
    let style = '';
    const empty = '';
    // [FS] IRAD-1361 2021-05-18
    // Mange Copy paste citation applied text
    // added new attribute hasCitation - This should be in plugin but it will not create any issue.
    // added new attribute pos - to identify the citation node pos.
    // TODO: Need to mange the normal highlight
    if (highlightColor && !hasCitation) {
      style += `background-color: ${highlightColor};`;
    }
    if (hasCitation) {
      style += `background-color: ${empty};z-index: 1;opacity :${pos}`;
    }
    return ['span', { style }, 0];
  },
};

export default TextHighlightMarkSpec;
