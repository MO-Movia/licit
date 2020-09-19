// @flow

import {Node} from 'prosemirror-model';

import ParagraphNodeSpec from './ParagraphNodeSpec';
import {getParagraphNodeAttrs, toParagraphDOM} from './ParagraphNodeSpec';

import type {NodeSpec} from './Types';

const TAG_NAME_TO_LEVEL = {
  H1: 1,
  H2: 2,
  H3: 3,
  H4: 4,
  H5: 5,
  H6: 6,
};

  // [FS] IRAD-1042 2020-09-09
  // Fix: Changes the menu for include the custom styles.

export const HEADING_NAMES = [
  {
    "name": "Normal",
    "level": 0
  },
  {
    "name": "Heading 1",
    "level": 1
  },
  {
    "name": "Heading 2",
    "level": 2
  },
  {
    "name": "Heading 3",
    "level": 3
  },
  {
    "name": "Heading 4",
    "level": 4
  },
  {
    "name": "Title",
    "customstyles":  [
      {
        'stylename':'Title',
        // 'fontsize' : 30,
        // 'fontname' : 'Acme',
        'strong' : true,
        'em' :true,
        'color':'Green',         
      }      
    ]
  },  
  {
    "name": "Quote",
    "style":  [
      {
        "font-size": 20,
        "font-name": "Arial", 
      },
    ]
  },   
];

// https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
// :: NodeSpec A plain paragraph textblock. Represented in the DOM
// as a `<p>` element.
const HeadingNodeSpec: NodeSpec = {
  ...ParagraphNodeSpec,
  attrs: {
    ...ParagraphNodeSpec.attrs,
    level: {default: 1},
  },
  defining: true,
  parseDOM: [
    {tag: 'h1', getAttrs},
    {tag: 'h2', getAttrs},
    {tag: 'h3', getAttrs},
    {tag: 'h4', getAttrs},
    {tag: 'h5', getAttrs},
    {tag: 'h6', getAttrs},
  ],
  toDOM,
};

function toDOM(node: Node): Array<any> {
  const dom = toParagraphDOM(node);
  const level = node.attrs.level || 1;
  dom[0] = `h${level}`;
  return dom;
}

function getAttrs(dom: HTMLElement): Object {
  const attrs: Object = getParagraphNodeAttrs(dom);
  const level = TAG_NAME_TO_LEVEL[dom.nodeName.toUpperCase()] || 1;
  attrs.level = level;
  return attrs;
}

export default HeadingNodeSpec;
