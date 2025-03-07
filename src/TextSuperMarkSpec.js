// @flow

import type { MarkSpec } from './Types.js';

const TextSuperMarkSpec: MarkSpec = {
  attrs: {
    overridden: { default: false },
  },
  parseDOM: [
    { tag: 'sup', getAttrs: () => ({ overridden: false }) },
    {
      style: 'vertical-align',
      getAttrs: (value) => (value === 'super' ? { overridden: false } : null),
    },
  ],
  toDOM(mark) {
    return ['sup', { overridden: mark.attrs.overridden }, 0];
  },
};

export default TextSuperMarkSpec;
