// @flow

import type { MarkSpec } from './Types.js';

const CODE_DOM = ['code', 0];

const CodeMarkSpec: MarkSpec = {
  parseDOM: [{ tag: 'code' }],
  toDOM() {
    return CODE_DOM;
  },
};

export default CodeMarkSpec;
