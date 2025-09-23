import type { MarkSpec } from 'prosemirror-model';

const TextSuperMarkSpec: MarkSpec = {
  parseDOM: [
    { tag: 'sup' },
    {
      style: 'vertical-align',
      getAttrs: (value: string): { [key: string]: unknown } | false => {
        return value === 'super' && null;
      },
    },
  ],
  toDOM() {
    return ['sup', 0];
  },
};

export default TextSuperMarkSpec;
