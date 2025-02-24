// @flow

import { Node } from 'prosemirror-model';
import type { MarkSpec } from './Types.js';

// [FS] IRAD-1061 2020-09-19
// Now loaded locally, so that it works in closed networks as well.

export const FONT_TYPE_NAMES = [
  // SERIF
  'Aclonica',
  'Acme',
  'Alegreya',
  'Arial',
  'Arial Black',
  'Georgia',
  'Tahoma',
  'Times New Roman',
  'Times',
  'Verdana',
  // MONOSPACE
  'Courier New',
];

// FS IRAD-988 2020-06-18
// Preload fonts that are listed by default,
// so that even if the font is not available locally, load from the web.
export function preLoadFonts() {
  FONT_TYPE_NAMES.forEach((name) => {
    loadAndCacheFont(name);
  });
}

// Resolve each font after it is loaded.
const RESOLVED_FONT_NAMES = new Set([]);

function loadAndCacheFont(name) {
  // Cache custom fonts
  RESOLVED_FONT_NAMES.add(name);
}

const FontTypeMarkSpec: MarkSpec = {
  attrs: {
    name: '',
    overridden: { default: false },
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      tag: 'span[style*=font-family]',
      getAttrs: (domNode) => {

        let name = domNode.style.fontFamily || '';
        let parentFontName = domNode.parentNode?.style.fontFamily || '';
        const _mOverriden = domNode.getAttribute('overridden');
        const mparent_overriden = domNode.parentNode?.getAttribute('overridden');

        if (name !== '') {
          name = name ? name.replace(/["']/g, '') : '';
        }
        if (parentFontName !== '') {
          parentFontName = parentFontName ? parentFontName.replace(/["']/g, '') : '';
        }

        const overridden = (_mOverriden === 'true' && name !== '') || (parentFontName !== '' && mparent_overriden === 'true');  // Check if the font is overridden

        return {
          name: name || parentFontName || 'Arial',  // Clean up the font name
          overridden: overridden,
        };
      }
    }
  ],

  toDOM(node: Node) {
    const { name, overridden } = node.attrs;
    const attrs = { overridden };
    if (name) {
      if (!RESOLVED_FONT_NAMES.has(name)) {
        loadAndCacheFont(name);
      }
      attrs.style = `font-family: ${name}`;
    }
    return ['span', attrs, 0];
  }
};

export default FontTypeMarkSpec;
