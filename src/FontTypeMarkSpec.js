// @flow

import {Node} from 'prosemirror-model';

import WebFontLoader from './WebFontLoader';

import type {MarkSpec} from './Types';

// [FS] IRAD-1061 2020-09-19
// Now loaded locally, so that it work in closed network as well.
//import injectStyleSheet from './injectStyleSheet';

export const FONT_TYPE_NAMES = [
  // SERIF
  'Aclonica',
  'Acme',
  'Alegreya',
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
export function preLoadFonts() {
  FONT_TYPE_NAMES.forEach(name => {
    loadAndCacheFont(name);
  });
}

function loadAndCacheFont(name) {
  // Cache custom fonts
  RESOLVED_FONT_NAMES.add(name);
  // https://github.com/typekit/webfontloader
  // [FS] IRAD-1061 2020-09-19
  // Now loaded locally, so that it work in closed network as well.
  //WebFontLoader.load({google: {families: [name]}});
}

// resolve each font after it is loaded.
const RESOLVED_FONT_NAMES = new Set([]);

const FontTypeMarkSpec: MarkSpec = {
  attrs: {
    name: '',
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      style: 'font-family',
      getAttrs: name => {
        return {
          name: name ? name.replace(/[\"\']/g, '') : '',
        };
      },
    },
  ],

  toDOM(node: Node) {
    const {name} = node.attrs;
    const attrs = {};
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
