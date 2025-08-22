// @flow

import { Node } from 'prosemirror-model';

import type { NodeSpec } from './Types.js';

export const DOM_ATTRIBUTE_SIZE = 'data-spacer-size';
export const DOM_ATTRIBUTE_INDENT_POSITION = 'data-indent-position';
export const SPACER_SIZE_TAB = 'tab';
export const SPACER_SIZE_TAB_LARGE = 'tab-large';
export const HANGING_INDENT_TAB = 'hangingtab';

// See http://jkorpela.fi/chars/spaces.html
export const HAIR_SPACE_CHAR = '\u200A';

const SpacerNodeSpec: NodeSpec = {
  inline: true,
  group: 'inline',
  atom: true,
  selectable: false,
  attrs: {
    size: { default: SPACER_SIZE_TAB },
    indentPosition: { default: null },
  },
  parseDOM: [
    {
      tag: `span[${DOM_ATTRIBUTE_SIZE}]`,
      getAttrs: (el) => {
        const size = el.getAttribute(DOM_ATTRIBUTE_SIZE) || SPACER_SIZE_TAB;
        let indentPosition = el.getAttribute(DOM_ATTRIBUTE_INDENT_POSITION);
        if (!indentPosition) {
          const style = el.style;
          if (style && style.marginLeft) {
            indentPosition = style.marginLeft.replace('px', '');
          }
        }
        return {
          size,
          indentPosition,
        };
      },
    },
  ],
  toDOM(node: Node) {
    const { size, indentPosition } = node.attrs;

    const attrs = {
      [DOM_ATTRIBUTE_SIZE]: size,
    };

    if (indentPosition != null && indentPosition !== '') {
      attrs[DOM_ATTRIBUTE_INDENT_POSITION] = indentPosition;
      attrs.style = `display:inline-block;margin-left:${indentPosition}px;`;
    }
    return ['span', attrs, HAIR_SPACE_CHAR];
  }
};

export default SpacerNodeSpec;
