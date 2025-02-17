// @flow

import { Node } from 'prosemirror-model';
import { toClosestFontPtSize } from './toClosestFontPtSize.js';
import type { MarkSpec } from './Types.js';

const FontSizeMarkSpec: MarkSpec = {
  attrs: {
    pt: { default: null },
    overridden: { default: false },
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      tag: 'span[style*=font-size]',
      getAttrs: (domNode) => {
        const fontSize = domNode.style.fontSize || '';
        const _mOverriden = domNode.getAttribute('overridden');
        let ptValue = 0;
        let _mptValue = 0;

        const parentFontsize = domNode.parentNode?.style.fontSize || '';
        const mparent_overriden = domNode.parentNode?.getAttribute("overridden");
        if (fontSize !== '') {
          ptValue = toClosestFontPtSize(fontSize);
        }
        if (parentFontsize !== '') {
          _mptValue = toClosestFontPtSize(parentFontsize);
        }

        const overridden = (_mOverriden === 'true' && fontSize !== '') || (parentFontsize !== '' && mparent_overriden === 'true');  // Check if the font is overridden

        return {
          pt: ptValue || _mptValue,
          overridden: overridden,
        };
      },
    },
  ],
  toDOM(node: Node) {
    const { pt, overridden } = node.attrs;
    const attrs = { overridden };

    if (pt) {
      attrs.style = `font-size: ${pt}pt;`;
      attrs.class = 'czi-font-size-mark';
    }

    return ['span', attrs, 0];
  },
};

export default FontSizeMarkSpec;
