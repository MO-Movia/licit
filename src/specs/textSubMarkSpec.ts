import type { MarkSpec } from 'prosemirror-model';

const TextSubMarkSpec: MarkSpec = {
  parseDOM: [
    { tag: 'sub' },
    {
      style: 'vertical-align',
      getAttrs: (value: string): { [key: string]: unknown } | false => {
        return value === 'sub' && null;
      },
    },
  ],
  toDOM() {
    return ['sub', 0];
  },
};

export default TextSubMarkSpec;
