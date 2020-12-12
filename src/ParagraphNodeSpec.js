// @flow

import clamp from './ui/clamp';
import convertToCSSPTValue from './convertToCSSPTValue';
import toCSSLineSpacing from './ui/toCSSLineSpacing';
import { Node } from 'prosemirror-model';

import type { NodeSpec } from './Types';

// This assumes that every 36pt maps to one indent level.
export const INDENT_MARGIN_PT_SIZE = 36;
export const MIN_INDENT_LEVEL = 0;
export const MAX_INDENT_LEVEL = 7;
export const ATTRIBUTE_INDENT = 'data-indent';
export const ATTRIBUTE_STYLE_LEVEL = 'data-style-level';
const cssVal = new Set<string>(['', '0%', '0pt', '0px']);

export const EMPTY_CSS_VALUE = cssVal;

const ALIGN_PATTERN = /(left|right|center|justify)/;

// https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
// :: NodeSpec A plain paragraph textblock. Represented in the DOM
// as a `<p>` element.
const ParagraphNodeSpec: NodeSpec = {
  attrs: {
    align: { default: null },
    color: { default: null },
    id: { default: null },
    indent: { default: null },
    lineSpacing: { default: null },
    // TODO: Add UI to let user edit / clear padding.
    paddingBottom: { default: null },
    // TODO: Add UI to let user edit / clear padding.
    paddingTop: { default: null },
    styleName: { default: 'None' },
    styleLevel:  { default: null },
    customStyle:  { default: null },
    paragraphSpacingAfter: { default:null },
    paragraphSpacingBefore: { default:null },
  },
  content: 'inline*',
  group: 'block',
  parseDOM: [{ tag: 'p', getAttrs }],
  toDOM,
};

function getAttrs(dom: HTMLElement): Object {
  const {
    lineHeight,
    textAlign,
    marginLeft,
    paddingTop,
    paddingBottom,
    marginBottom,
  } = dom.style;

  let align = dom.getAttribute('align') || textAlign || '';
  align = ALIGN_PATTERN.test(align) ? align : null;

  let indent = parseInt(dom.getAttribute(ATTRIBUTE_INDENT), 10);

  if (!indent && marginLeft) {
    indent = convertMarginLeftToIndentValue(marginLeft);
  }

  indent = indent || MIN_INDENT_LEVEL;

  const lineSpacing = lineHeight ? toCSSLineSpacing(lineHeight) : null;
  const spacingAfterParagraph = marginBottom? marginBottom:null;

  const id = dom.getAttribute('id') || '';
  const styleName = dom.getAttribute('styleName') || null;
  const styleLevel = parseInt(dom.getAttribute(ATTRIBUTE_STYLE_LEVEL), 10);
  // TODO: customStyle

  return { align, indent, lineSpacing, paddingTop, paddingBottom, id, styleName, spacingAfterParagraph, styleLevel };
}

function toDOM(node: Node): Array<any> {
  const {
    align,
    indent,
    lineSpacing,
    paddingTop,
    paddingBottom,
    id,
    styleName,
    styleLevel,
    customStyle,
    paragraphSpacingAfter,
    paragraphSpacingBefore
  } = node.attrs;
  const attrs = {};

  let style = '';
  if (align && align !== 'left') {
    style += `text-align: ${align};`;
  }

  if (lineSpacing) {
    const cssLineSpacing = toCSSLineSpacing(lineSpacing);
    style +=
      `line-height: ${cssLineSpacing};` +
      // This creates the local css variable `--czi-content-line-height`
      // that its children may apply.
      `--czi-content-line-height: ${cssLineSpacing};`;
  }
  // [FS] IRAD-1100 2020-11-04
  // Add in leading and trailing spacing (before and after a paragraph)
  if(paragraphSpacingAfter){
    style += `margin-bottom: ${paragraphSpacingAfter}pt !important;`;
  }
  if(paragraphSpacingBefore){
    style += `margin-top: ${paragraphSpacingBefore}pt !important;`;
  }

  if (paddingTop && !EMPTY_CSS_VALUE.has(paddingTop)) {
    style += `padding-top: ${paddingTop};`;
  }

  if (paddingBottom && !EMPTY_CSS_VALUE.has(paddingBottom)) {
    style += `padding-bottom: ${paddingBottom};`;
  }

  if (styleLevel) {
    attrs[ATTRIBUTE_STYLE_LEVEL] = String(styleLevel);

    if (customStyle) {
      if (customStyle.strong) {
        style += 'font-weight: bold;';
      }
      if (customStyle.em) {
        style += 'font-style: italic;';
      }
      if (customStyle.color) {
        style += `color: ${customStyle.color};`;
      }
      if (customStyle.fontSize) {
        style += `font-size: ${customStyle.fontSize}px;`;
      }
      if (customStyle.fontName) {
        style += `font-family: ${customStyle.fontName};`;
      }
      let textDecoration = '';
      if (customStyle.strike) {
        textDecoration += ' line-through';
      }
      if (customStyle.underline) {
        textDecoration += ' underline';
      }
      if (customStyle.strike || customStyle.underline) {
      style += `text-decoration: ${textDecoration};`;
      }
    }
  }

  style && (attrs.style = style);

  if (indent) {
    attrs[ATTRIBUTE_INDENT] = String(indent);
  }

  if (id) {
    attrs.id = id;
  }

  attrs.styleName = styleName;
  return ['p', attrs, 0];
}

export const toParagraphDOM = toDOM;
export const getParagraphNodeAttrs = getAttrs;

export function convertMarginLeftToIndentValue(marginLeft: string): number {
  const ptValue = convertToCSSPTValue(marginLeft);
  return clamp(
    MIN_INDENT_LEVEL,
    Math.floor(ptValue / INDENT_MARGIN_PT_SIZE),
    MAX_INDENT_LEVEL
  );
}

export default ParagraphNodeSpec;
