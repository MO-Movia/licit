// @flow

import type { MarkSpec } from './Types.js';

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
      getAttrs: (dom) => {
        const href = dom.getAttribute('href');
        const target = href?.indexOf('#') === 0 ? '' : 'blank';
        const selectionId = dom.getAttribute('selectionId') ?? '';
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
    const attrs = {
      ...node.attrs,
      onclick: 'return false',
    };
    return ['a', attrs, 0];
  },
};

export default LinkMarkSpec;
