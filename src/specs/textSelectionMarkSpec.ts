import { MarkSpec } from 'prosemirror-model';

const TextSelectionMarkSpec: MarkSpec = {
  attrs: {
    id: { default: '' },
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      tag: 'czi-text-selection',
    },
  ],

  toDOM() {
    return ['czi-text-selection', { class: 'czi-text-selection' }, 0];
  },
};

export default TextSelectionMarkSpec;
