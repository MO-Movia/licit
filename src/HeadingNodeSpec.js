// @flow

import { Node } from 'prosemirror-model';

import ParagraphNodeSpec from './ParagraphNodeSpec';
import { getParagraphNodeAttrs, toParagraphDOM } from './ParagraphNodeSpec';

import type { NodeSpec } from './Types';

// const TAG_NAME_TO_LEVEL = {
//   H1: 1,
//   H2: 2,
//   H3: 3,
//   H4: 4,
//   H5: 5,
//   H6: 6,
// };

// https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
// :: NodeSpec A plain paragraph textblock. Represented in the DOM
// as a `<p>` element.
const HeadingNodeSpec: NodeSpec = {
  ...ParagraphNodeSpec,
  attrs: {
    ...ParagraphNodeSpec.attrs,
    // level: { default: 1 },
  },
  defining: true,
  parseDOM: [
    { tag: 'h1', getAttrs },
    { tag: 'h2', getAttrs },
    { tag: 'h3', getAttrs },
    { tag: 'h4', getAttrs },
    { tag: 'h5', getAttrs },
    { tag: 'h6', getAttrs },
  ],
  toDOM,
};

function toDOM(node: Node): Array<any> {
  // [FS-SEA][06-04-2023]
  // returns paragraph node to dom when a header node paste
  const dom = toParagraphDOM(node);
  return dom;
}

function getAttrs(dom: HTMLElement): Object {
  const attrs = getParagraphNodeAttrs(dom);
  return attrs;
}

export default HeadingNodeSpec;
