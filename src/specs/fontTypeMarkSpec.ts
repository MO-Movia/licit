import { Mark, MarkSpec } from 'prosemirror-model';
import { AttrType } from './paragraphNodeSpec';

// [FS] IRAD-1061 2020-09-19
// Now loaded locally, so that it work in closed network as well.

export const FONT_TYPE_NAMES = [
  // SERIF
  'Aclonica',
  'Acme',
  'Alegreya',
  'Arial',
  //'Arial',//??? - Commented out fonts that are not available to download using https://fonts.googleapis.com/css?family=
  'Arial Black',
  'Georgia',
  'Tahoma',
  'Times New Roman',
  'Times',
  'Verdana',
  // MONOSPACE
  'Courier New',
  //'Lucida Console',//???
  //'Monaco',//???
  //'monospace',//???
];

// FS IRAD-988 2020-06-18
// Preload fonts that are listed by default,
// so that even if the font is not available locally, load from web.
export function preLoadFonts(): void {
  FONT_TYPE_NAMES.forEach((name) => {
    loadAndCacheFont(name);
  });
}

// resolve each font after it is loaded.
const RESOLVED_FONT_NAMES = new Set([]);

function loadAndCacheFont(name) {
  // Cache custom fonts
  RESOLVED_FONT_NAMES.add(name);
}

const FontTypeMarkSpec: MarkSpec = {
  attrs: {
    name: { default: '' },
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      style: 'font-family',
      getAttrs: (name: string): AttrType => {
        return {
          name: name ? name.replace(/[\"\']/g, '') : '',
        };
      },
    },
  ],

  toDOM(mark: Mark) {
    const { name } = mark.attrs;
    const attrs = {
      style: '',
    };
    if (name) {
      if (!RESOLVED_FONT_NAMES.has(name)) {
        loadAndCacheFont(name);
      }
      attrs.style = `font-family: ${name}`;
    }
    return ['span', attrs, 0];
  },
};

export default FontTypeMarkSpec;
