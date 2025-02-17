
import type { MarkSpec } from './Types.js';

const EM_DOM = ['em', { overridden: false }, 0];

const EMMarkSpec: MarkSpec = {
  attrs: {
    overridden: { default: false },
  },
  parseDOM: [
    {
      tag: 'i',
      getAttrs: (dom: HTMLElement) => {
        const _overridden = dom.getAttribute('overridden');
        return { overridden: _overridden === 'true' };
      }
    },

    {
      tag: 'em',
      getAttrs: (dom: HTMLElement) => {
        const _overridden = dom.getAttribute('overridden');
        return { overridden: _overridden === 'true' };
      }
    },
    {
      tag: 'span[style*=font-style]',
      getAttrs: (value, dom: HTMLElement) => {
        const _overridden = dom.getAttribute('overridden');
        return { overridden: _overridden === 'true' };

      },
    },
  ],
  toDOM(mark) {
    return ['em', { overridden: mark.attrs.overridden }, 0];
  },
};

export default EMMarkSpec;
