import type { MarkSpec } from 'prosemirror-model';

const TextSuperMarkSpec: MarkSpec = {
  attrs: {
    overridden: { default: false },
  },
  parseDOM: [
    {
      tag: 'sup',
      getAttrs: (dom: HTMLElement) => {
        const _overridden = dom.getAttribute('overridden');
        return { overridden: _overridden === 'true' };
      }
    },

    {
      style: 'vertical-align',
      getAttrs: (value) => (value === 'sup' ? { overridden: true } : null),
    },
  ],
  toDOM(mark) {
    return ['sup', { overridden: mark.attrs.overridden }, 0];
  },
};

export default TextSuperMarkSpec;
