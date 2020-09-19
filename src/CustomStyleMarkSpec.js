// @flow

import type {MarkSpec} from './Types';
import { Node } from 'prosemirror-model';

const CustomStyleMarkSpec: MarkSpec = {
  attrs: {
    stylename:{ default: null },
    fontname: { default: null },
    fontsize: { default: null },
    color: { default: null },
    highlightColor: { default: null },
     
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      style: 'font-family',
      getAttrs: fontname => {
        return {
          fontname: fontname ? fontname.replace(/[\"\']/g, '') : '',
        };
      },
    },
  ],

  toDOM(node: Node) {
    const {fontname,fontsize,color,highlightColor } = node.attrs;
    const attrs = {};
    let style = '';
    if (fontname) {
      style += `font-family: ${fontname};`;
    }
    if (fontsize) {
      style += `font-size: ${fontsize}pt;`;
    }
    if (highlightColor) {
      style += `background-color: ${highlightColor};`;
    }
    if (color) {
      style += `color: ${color};`;
    } 
    
    attrs.style = style;    
    return  ['span', attrs]    
  },
};

export default CustomStyleMarkSpec;
