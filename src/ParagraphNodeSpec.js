// @flow

import convertToCSSPTValue from './convertToCSSPTValue.js';
import toCSSLineSpacing from './ui/toCSSLineSpacing.js';
import { Node } from 'prosemirror-model';

import type { NodeSpec } from './Types.js';

// This assumes that every 36pt maps to one indent level.
export const INDENT_MARGIN_PT_SIZE = 36;
export const MIN_INDENT_LEVEL = 0;
export const MAX_INDENT_LEVEL = 7;
export const ATTRIBUTE_INDENT = 'data-indent';
export const ATTRIBUTE_STYLE_LEVEL = 'data-style-level';
export const RESERVED_STYLE_NONE = 'None';
export const RESERVED_STYLE_NONE_NUMBERING = RESERVED_STYLE_NONE + '-@#$-';
const cssVal = new Set(['', '0%', '0pt', '0px']);

export const EMPTY_CSS_VALUE = cssVal;

const ALIGN_PATTERN = /(left|right|center|justify)/;

// https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
// :: NodeSpec A plain paragraph textblock. Represented in the DOM
// as a `<p>` element.
const ParagraphNodeSpec: NodeSpec = {
  attrs: {
    align: {
      default: null,
    },
    color: {
      default: null,
    },
    id: {
      default: null,
    },
    indent: {
      default: null,
    },
    lineSpacing: {
      default: null,
    },
    // TODO: Add UI to let user edit / clear padding.
    paddingBottom: {
      default: null,
    },
    // TODO: Add UI to let user edit / clear padding.
    paddingTop: {
      default: null,
    },
    innerLink: {
      default: null,
    },
    // [KNITE-1465] 24-12-2024
    // added attributes for indent, align and linespacing overrides.
    overriddenAlign: {
      default: null,
    },
    overriddenLineSpacing: {
      default: null,
    },
    overriddenIndent: {
      default: null,
    },
  },
  content: 'inline*',
  group: 'block',
  parseDOM: [
    {
      tag: 'p',
      getAttrs,
    },
  ],
  toDOM,
};

function getAttrs(dom: HTMLElement): Object {
  const {
    lineHeight,
    textAlign,
    marginLeft,
    paddingTop,
    paddingBottom,
  } = dom.style;

  let align = dom.getAttribute('align') || textAlign || '';
  align = ALIGN_PATTERN.test(align) ? align : null;

  let indent = parseInt(dom.getAttribute(ATTRIBUTE_INDENT), 10);

  if (!indent && marginLeft) {
    indent = convertMarginLeftToIndentValue(marginLeft);
  }

  indent = indent || MIN_INDENT_LEVEL;

  const lineSpacing = lineHeight ? toCSSLineSpacing(lineHeight) : null;

  const id = dom.getAttribute('id') || '';
  const overriddenAlign = dom.getAttribute('overriddenAlign') || '';
  const overriddenLineSpacing = dom.getAttribute('overriddenLineSpacing') || '';
  const overriddenIndent = dom.getAttribute('overriddenIndent') || '';
  const innerLink = dom.getAttribute('innerLink') || '';
  return {
    align,
    indent,
    lineSpacing,
    paddingTop,
    paddingBottom,
    id,
    overriddenAlign,
    overriddenLineSpacing,
    overriddenIndent,
    innerLink,
  };
}

function getStyle(attrs: Object) {
  return getStyleEx(
    attrs.align,
    attrs.lineSpacing,
    attrs.paddingTop,
    attrs.paddingBottom,
  );
}

function getStyleEx(align, lineSpacing, paddingTop, paddingBottom) {
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

  if (paddingTop && !EMPTY_CSS_VALUE.has(paddingTop)) {
    style += `padding-top: ${paddingTop};`;
  }
  if (paddingBottom && !EMPTY_CSS_VALUE.has(paddingBottom)) {
    style += `padding-bottom: ${paddingBottom};`;
  }
  return { style };

}

function toDOM(node: Node): Array<any> {
  const { indent, id, overriddenAlign, overriddenLineSpacing, overriddenIndent, innerLink } = node.attrs;
  const attrs = {};
  const { style } = getStyle(node.attrs);

  style && (attrs.style = style);

  if (indent) {
    attrs[ATTRIBUTE_INDENT] = String(indent);
  }
  if (id) {
    attrs.id = id;
  }
  attrs.overriddenAlign = overriddenAlign;
  attrs.overriddenLineSpacing = overriddenLineSpacing;
  attrs.overriddenIndent = overriddenIndent;
  if (innerLink) {
    attrs.innerLink = innerLink;
  }
  return ['p', attrs, 0];
}

export const toParagraphDOM = toDOM;
export const getParagraphNodeAttrs = getAttrs;
export const getParagraphStyle = getStyle;

export function convertMarginLeftToIndentValue(marginLeft: string): number {
  const ptValue = convertToCSSPTValue(marginLeft);
  return Math.min(Math.max(Math.floor(ptValue / INDENT_MARGIN_PT_SIZE), MIN_INDENT_LEVEL), MAX_INDENT_LEVEL);
}

export default ParagraphNodeSpec;
