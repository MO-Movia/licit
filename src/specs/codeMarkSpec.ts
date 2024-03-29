import type { MarkSpec, DOMOutputSpec } from 'prosemirror-model';

const CODE_DOM: DOMOutputSpec = ['code', 0];

const CodeMarkSpec: MarkSpec = {
  parseDOM: [{ tag: 'code' }],
  toDOM() {
    return CODE_DOM;
  },
};

export default CodeMarkSpec;
