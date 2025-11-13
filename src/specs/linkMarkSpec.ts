/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import type { MarkSpec, Attrs } from 'prosemirror-model';

const LinkMarkSpec: MarkSpec = {
  attrs: {
    href: { default: null },
    rel: { default: 'noopener noreferrer nofollow' },
    target: { default: 'blank' },
    title: { default: null },
    selectionId: {
      default: null,
    },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: 'a[href]',
      getAttrs: (dom: HTMLElement): Attrs => {
        const href = dom.getAttribute('href');
        const target = href?.startsWith('#') ? '' : 'blank';
        const selectionId = dom.getAttribute('selectionId') || '';
        return {
          href: dom.getAttribute('href'),
          title: dom.getAttribute('title'),
          target,
          selectionId,
        };
      },
    },
  ],
  toDOM(node) {
    return ['a', node.attrs, 0];
  },
};

export default LinkMarkSpec;
