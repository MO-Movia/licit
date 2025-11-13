/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { Node, NodeSpec, DOMOutputSpec } from 'prosemirror-model';

import { ATTRIBUTE_LIST_STYLE_TYPE } from './listItemNodeSpec';
import { LIST_ITEM } from '@modusoperandi/licit-ui-commands';
import {
  ATTRIBUTE_INDENT,
  AttrType,
  MIN_INDENT_LEVEL,
} from './paragraphNodeSpec';

const AUTO_LIST_STYLE_TYPES = ['disc', 'square', 'circle'];

const BulletListNodeSpec: NodeSpec = {
  attrs: {
    id: { default: null },
    indent: { default: 0 },
    listStyleType: { default: null },
  },
  group: 'block',
  content: LIST_ITEM + '+',
  parseDOM: [
    {
      tag: 'ul',
      getAttrs(dom: HTMLElement): AttrType {
        const listStyleType =
          dom.getAttribute(ATTRIBUTE_LIST_STYLE_TYPE) || null;

        const indent = dom.hasAttribute(ATTRIBUTE_INDENT)
          ? parseInt(dom.getAttribute(ATTRIBUTE_INDENT), 10)
          : MIN_INDENT_LEVEL;
        return {
          indent,
          listStyleType,
        };
      },
    },
  ],

  toDOM(node: Node): DOMOutputSpec {
    const { indent, listStyleType } = node.attrs;
    const attrs = { type: '' };
    // [FS] IRAD-947 2020-05-26
    // Bullet list type changing fix
    attrs[ATTRIBUTE_INDENT] = indent;
    if (listStyleType) {
      attrs[ATTRIBUTE_LIST_STYLE_TYPE] = listStyleType;
    }

    let htmlListStyleType = listStyleType;

    if (!htmlListStyleType || htmlListStyleType === 'disc') {
      htmlListStyleType =
        AUTO_LIST_STYLE_TYPES[indent % AUTO_LIST_STYLE_TYPES.length];
    }

    attrs.type = htmlListStyleType;
    return ['ul', attrs, 0];
  },
};

export default BulletListNodeSpec;
