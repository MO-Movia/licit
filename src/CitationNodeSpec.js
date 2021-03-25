// @flow

import type {NodeSpec} from './Types';

// This assumes that every 36pt maps to one indent level.
export const INDENT_MARGIN_PT_SIZE = 36;
export const MIN_INDENT_LEVEL = 0;
export const MAX_INDENT_LEVEL = 7;
export const ATTRIBUTE_INDENT = 'data-indent';
export const ATTRIBUTE_STYLE_LEVEL = 'data-style-level';
export const RESERVED_STYLE_NONE = 'None';
export const RESERVED_STYLE_NONE_NUMBERING = RESERVED_STYLE_NONE + '-@#$-';
const cssVal = new Set<string>(['', '0%', '0pt', '0px']);

export const EMPTY_CSS_VALUE = cssVal;

const CitationNodeSpec: NodeSpec = {
  group: 'inline',
  content: 'inline',
  inline: true,
  draggable: true,
  // [FS] IRAD-1251 2021-03-23
  // added new attributes to this spec.
  attrs: {
    from:{default: ''},
    to:{default: ''},
    citationObject:  {default: null},
    citationUseObject:  {default: null},
  },
  // This makes the view treat the node as a leaf, even though it
  // technically has content
  atom: true,
  toDOM: () => ['citationnote', 0],
  parseDOM: [{tag: 'citationnote'}]
};
export default CitationNodeSpec;
