// @flow

import type { MarkSpec } from './Types.js';

const TextSubMarkSpec: MarkSpec = {
  attrs: {
    overridden: { default: false },
  },
  parseDOM: [
    { tag: 'sub', getAttrs: () => ({ overridden: false }) },
    {
      style: 'vertical-align',
      getAttrs: (value) => (value === 'sub' ? { overridden: false } : null),
    },
  ],
  toDOM(mark) {
    return ['sub', { overridden: mark.attrs.overridden }, 0];
  },
};

export default TextSubMarkSpec;
