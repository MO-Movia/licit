// @flow

import { Node } from 'prosemirror-model';

import ParagraphNodeSpec,{ getParagraphNodeAttrs, toParagraphDOM } from './ParagraphNodeSpec.js';

import type { NodeSpec } from './Types.js';

// https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
// :: NodeSpec A plain paragraph textblock. Represented in the DOM
// as a `<p>` element.
const BlockquoteNodeSpec: NodeSpec = {
  ...ParagraphNodeSpec,
  defining: true,
  parseDOM: [{ tag: 'blockquote', getAttrs }],
  toDOM,
};

function toDOM(node: Node): Array<any> {
  const dom = toParagraphDOM(node);
  dom[0] = 'blockquote';
  return dom;
}

function getAttrs(dom: HTMLElement): Object {
  return getParagraphNodeAttrs(dom);
}

export default BlockquoteNodeSpec;
