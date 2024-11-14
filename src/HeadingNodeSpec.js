// @flow

import { Node } from 'prosemirror-model';
import ParagraphNodeSpec, { getParagraphNodeAttrs, toParagraphDOM } from './ParagraphNodeSpec';
import type { NodeSpec } from './Types'; 

// https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
// :: NodeSpec A plain paragraph textblock. Represented in the DOM
// as a `<p>` element.
const HeadingNodeSpec: NodeSpec = {
  ...ParagraphNodeSpec,
  attrs: {
    ...ParagraphNodeSpec.attrs,
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
