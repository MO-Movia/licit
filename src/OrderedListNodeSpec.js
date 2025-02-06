// @flow

import { Node } from 'prosemirror-model';

import { ATTRIBUTE_LIST_STYLE_TYPE } from './ListItemNodeSpec.js';
import { LIST_ITEM } from './NodeNames.js';
import { ATTRIBUTE_INDENT, MIN_INDENT_LEVEL, RESERVED_STYLE_NONE } from './ParagraphNodeSpec.js';

import type { NodeSpec } from './Types.js';

export const ATTRIBUTE_COUNTER_RESET = 'data-counter-reset';
export const ATTRIBUTE_FOLLOWING = 'data-following';
const AUTO_LIST_STYLE_TYPES = ['decimal', 'lower-alpha', 'lower-roman'];

const OrderedListNodeSpec: NodeSpec = {
  attrs: {
    id: { default: null },
    counterReset: { default: null },
    indent: { default: MIN_INDENT_LEVEL },
    following: { default: null },
    listStyleType: { default: null },
    name: { default: null },
    start: { default: 1 },
    type: { default: 'decimal' }
  },
  group: 'block',
  content: LIST_ITEM + '+',
  parseDOM: [
    {
      tag: 'ol',
      getAttrs(dom: HTMLElement) {
        const listStyleType = dom.getAttribute(ATTRIBUTE_LIST_STYLE_TYPE);
        const counterReset =
          dom.getAttribute(ATTRIBUTE_COUNTER_RESET) || undefined;

        const start = dom.hasAttribute('start')
          ? parseInt(dom.getAttribute('start'), 10)
          : 1;

        const indent = dom.hasAttribute(ATTRIBUTE_INDENT)
          ? parseInt(dom.getAttribute(ATTRIBUTE_INDENT), 10)
          : MIN_INDENT_LEVEL;

        const name = dom.getAttribute('name') || undefined;

        const following = dom.getAttribute(ATTRIBUTE_FOLLOWING) || undefined;
        const type = dom.getAttribute('type') || undefined;

        return {
          counterReset,
          following,
          indent,
          listStyleType,
          name,
          start,
          type,
        };
      },
    },
  ],
  toDOM(node: Node) {
    const {
      start,
      indent,
      listStyleType,
      counterReset,
      following,
      name,
      type,
    } = node.attrs;
    const attrs: Object = {
      [ATTRIBUTE_INDENT]: indent,
    };

    if (counterReset === 'none') {
      attrs[ATTRIBUTE_COUNTER_RESET] = counterReset;
    }

    if (following) {
      attrs[ATTRIBUTE_FOLLOWING] = following;
    }

    if (listStyleType) {
      attrs[ATTRIBUTE_LIST_STYLE_TYPE] = listStyleType;
    }

    if (start !== 1) {
      attrs.start = start;
    }

    if (name) {
      attrs.name = name;
    }
    let htmlListStyleType = listStyleType;

    if (!htmlListStyleType || htmlListStyleType === 'decimal') {
      htmlListStyleType =
        AUTO_LIST_STYLE_TYPES[indent % AUTO_LIST_STYLE_TYPES.length];
    }

    const cssCounterName = `czi-counter-${indent}`;
    if ('x.x.x' === type) {
      if (RESERVED_STYLE_NONE !== node.attrs.styleName) {
        attrs.style = buildStyleClass(indent, node.attrs.start);
      } else {
        attrs.style =
          `--czi-counter-name: ${cssCounterName};` +
          `--czi-counter-reset: ${following ? 'none' : start - 1};` +
          `--czi-list-style-type: ${htmlListStyleType}`;
      }
    } else {
      attrs.style =
        `--czi-counter-name: ${cssCounterName};` +
        `--czi-counter-reset: ${following ? 'none' : start - 1};` +
        `--czi-list-style-type: ${htmlListStyleType}`;
    }
    attrs.type = type;

    return ['ol', attrs, 0];
  },
};

function buildStyleClass(indent, start) {
  const cssCounterName = `czi-counter-${indent}`;
  let cssCounterReset = `czi-counter-${indent} ${start - 1} `;
  for (let index = 0; index < indent; index++) {
    cssCounterReset += `czi-counter-${index} 1 `;
  }
  return `--czi-counter-name: ${cssCounterName}; counter-reset: ${cssCounterReset};`;
}
export default OrderedListNodeSpec;
