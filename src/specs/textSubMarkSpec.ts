import type { MarkSpec } from 'prosemirror-model';

const TextSubMarkSpec: MarkSpec = {
  attrs: {
    overridden: { default: false },
  },
  parseDOM: [
    {
      tag: 'sub',
      priority: 150,
      getAttrs: (dom: HTMLElement) => {
        const _overridden = dom.getAttribute('overridden');
        return { overridden: _overridden === 'true' };
      }
    },
    {
      style: 'vertical-align',
      getAttrs: (value) => (value === 'sub' ? { overridden: true } : null),
    },
  ],
  toDOM(mark) {
    return ['sub', { overridden: mark.attrs.overridden }, 0];
  },
};

export default TextSubMarkSpec;
