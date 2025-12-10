/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {MarkSpec} from 'prosemirror-model';

const HangingIndentMarkSpec: MarkSpec = {
  attrs: {
    prefix: {default: null},
    overridden: {default: false},
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      tag: 'span[prefix]',
      getAttrs: (domNode) => {
        if (typeof domNode === 'string') return false;

        const element = domNode;
        const _prefix = element.getAttribute('prefix');
        return {prefix: _prefix || null, overridden: true};
      },
    },
  ],
  toDOM(mark, _inline) {
    const {prefix} = mark.attrs;
    const attrs = {prefix, overridden: true};
    return ['span', attrs, 0];
  },
  rank: 5000,
};

export default HangingIndentMarkSpec;
