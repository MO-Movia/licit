/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import type { MarkSpec } from 'prosemirror-model';

const TextUnderlineMarkSpec: MarkSpec = {
  attrs: {
    overridden: { default: false },
  },
  parseDOM: [
    {
      tag: 'u',
      getAttrs: (dom: HTMLElement) => {
        const _overridden = dom.getAttribute('overridden');
        return { overridden: _overridden === 'true' };
      }
    },
  ],
  toDOM(mark) {
    return ['u', { overridden: mark.attrs.overridden }, 0];
  },
};

export default TextUnderlineMarkSpec;
