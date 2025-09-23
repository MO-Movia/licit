import { Mark, MarkSpec } from 'prosemirror-model';

import { toClosestFontPtSize } from '../toClosestFontPtSize';

const FontSizeMarkSpec: MarkSpec = {
  attrs: {
    pt: { default: null },
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      style: 'font-size',
      getAttrs: getAttrs,
    },
  ],
  toDOM(mark: Mark) {
    const { pt } = mark.attrs;
    const domAttrs = pt
      ? {
          style: `font-size: ${pt}pt;`,
          class: 'czi-font-size-mark',
        }
      : null;

    return ['span', domAttrs, 0];
  },
};

function getAttrs(fontSize: string): Record<string, unknown> {
  const attrs = {};
  if (!fontSize) {
    return attrs;
  }

  const ptValue = toClosestFontPtSize(fontSize);
  if (!ptValue) {
    return attrs;
  }
  return {
    pt: ptValue,
  };
}

export default FontSizeMarkSpec;
