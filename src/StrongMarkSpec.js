// @flow

import type { MarkSpec } from './Types.js';

// const STRONG_DOM = ['strong', 0];
// const STRONG_DOM = ['strong', { overridden: false }, 0];
const CSS_BOLD_PATTERN = /^(bold(er)?|[5-9]\d{2,})$/;

const StrongMarkSpec: MarkSpec = {
  attrs: {
    overridden: { default: false }
  },
  parseDOM: [
    // { tag: 'strong' },
    // // This works around a Google Docs misbehavior where
    // // pasted content will be inexplicably wrapped in `<b>`
    // // tags with a font-weight normal.
    // { tag: 'b', getAttrs: (node) => node.style.fontWeight != 'normal' && null },
    // {
    //   style: 'font-weight',
    //   getAttrs: (value) => CSS_BOLD_PATTERN.test(value) && null,
    // },
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
