// @flow

import type {NodeSpec} from './Types';
import {Node} from 'prosemirror-model';

const CitationNodeSpec: NodeSpec = {
  group: 'inline',
  content: 'inline',
  inline: true,
  draggable: true,
  // [FS] IRAD-1251 2021-03-23
  // added new attributes to this spec.
  attrs: {
    from: {default: null},
    to: {default: null},
    citationObject: {default: null},
    citationUseObject: {default: null},
    sourceText: {default: null},
  },
  // This makes the view treat the node as a leaf, even though it
  // technically has content
  atom: true,
  toDOM,
  parseDOM: [
    {
      tag: 'citationnote',
      getAttrs,
    },
  ],
};

function getAttrs(dom: HTMLElement): Object {
  // [FS] IRAD-1251 2021-04-05
  // FIX: Copy and paste CITATION applied paragraph and edit the CITATION not working
  const from = dom.getAttribute('from') || null;
  const to = dom.getAttribute('to') || null;
  let citationObject = null;
  let citationUseObject = null;
  if (
    dom.hasAttribute('citationObject') &&
    (undefined !== null) !== dom.getAttribute('citationObject') &&
    null !== dom.getAttribute('citationObject')
  ) {
    citationObject = JSON.parse(dom.getAttribute('citationObject')) || null;
  }
  if (
    dom.hasAttribute('citationUseObject') &&
    null !== dom.getAttribute('citationUseObject')
  ) {
    citationUseObject =
      JSON.parse(dom.getAttribute('citationUseObject')) || null;
  }
  const sourceText = dom.getAttribute('sourceText') || null;

  return {
    from,
    to,
    citationObject,
    citationUseObject,
    sourceText,
  };
}

function toDOM(node: Node): Array<any> {
  // [FS] IRAD-1251 2021-04-05
  // FIX: Copy and paste CITATION applied paragraph and edit the CITATION not working
  const {from, to, citationObject, citationUseObject, sourceText} = node.attrs;
  const attrs = {};
  attrs.from = from;
  attrs.to = to;
  attrs.citationObject = JSON.stringify(citationObject);
  attrs.citationUseObject = JSON.stringify(citationUseObject);
  attrs.sourceText = sourceText;
  return ['citationnote', attrs, 0];
}
export default CitationNodeSpec;
