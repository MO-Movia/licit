import { Mark, MarkSpec, Node } from 'prosemirror-model';

import { toClosestFontPtSize } from '../toClosestFontPtSize';

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
      getAttrs: (domNode: HTMLElement) => {
        const fontSize = domNode.style?.fontSize || '';
        const _mOverriden = domNode.getAttribute('overridden');
        let ptValue = 0;
        let _mptValue = 0;

        const parentFontsize = (domNode.parentNode as HTMLElement | null)?.style.fontSize || '';
        const mparent_overriden = (domNode.parentNode as HTMLElement | null)?.getAttribute?.('overridden') ?? null;

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
  toDOM(node: Mark | Node) {
    const { pt, overridden } = node.attrs;
    const attrs = { overridden: overridden, style: '', class: '' };

    if (pt) {
      attrs.style = `font-size: ${pt}pt;`;
      attrs.class = 'czi-font-size-mark';
    }

    return ['span', attrs, 0];
  },
};

export default FontSizeMarkSpec;
