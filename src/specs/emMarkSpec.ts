import type { MarkSpec, DOMOutputSpec } from 'prosemirror-model';

const EM_DOM: DOMOutputSpec = ['em', 0];

const EMMarkSpec: MarkSpec = {
  parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
  toDOM() {
    return EM_DOM;
  },
};

export default EMMarkSpec;
