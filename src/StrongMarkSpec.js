// @flow

import type { MarkSpec } from './Types.js';

const StrongMarkSpec: MarkSpec = {
  attrs: {
    overridden: { default: false }
  },
  parseDOM: [

    {
      tag: 'strong',
      getAttrs: (dom: HTMLElement) => {
        const _overridden = dom.getAttribute('overridden');
        return { overridden: _overridden === 'true' };
      }
    },
    {
      tag: 'b',
      getAttrs: (dom: HTMLElement) => {
        const _overridden = dom.getAttribute('overridden');
        return { overridden: _overridden === 'true' };
      }
    },
    {
      tag: 'span[style*=font-weight]',
      getAttrs: (value, dom: HTMLElement) => {
        const _overridden = dom.getAttribute('overridden');
        return { overridden: _overridden === 'true' };

      },
    },
  ],
  toDOM(mark) {
    return ['strong', { overridden: mark.attrs.overridden }, 0];
  },
};

export default StrongMarkSpec;
