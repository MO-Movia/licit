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
    paddingBottom: {
      default: null,
    },
    paddingTop: {
      default: null,
    },
    reset: {
      default: null,
    },

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
    overriddenAlignValue: {
      default: null,
    },
    overriddenLineSpacingValue: {
      default: null,
    },
    overriddenIndentValue: {
      default: null,
    },
    hangingIndent: {
      default: null,
    },
    indentPosition: {
      default: null,
    },
    isDeco: {
    default: {
      isTag: false,
      isComment: false,
      isSlice: false,
    },
},
  },
  content: 'inline*',
  group: 'block',
  defining: true,
  parseDOM: [
    {
      tag: 'p',
      getAttrs,
    },
  ],
  toDOM,
};

function getAttrs(dom: HTMLElement): Object {
  const { lineHeight, textAlign, marginLeft, paddingTop, paddingBottom } =
    dom.style;

  let align = dom.getAttribute('align') || textAlign || 'left';
  align = ALIGN_PATTERN.test(align) ? align : null;

  let indent = parseInt(dom.getAttribute(ATTRIBUTE_INDENT), 10);

  if (!indent && marginLeft) {
    indent = convertMarginLeftToIndentValue(marginLeft);
  }

  indent = indent || MIN_INDENT_LEVEL;

  const lineSpacing = lineHeight ? toCSSLineSpacing(lineHeight) : null;

  const id = dom.getAttribute('id') || '';
  const reset = dom.getAttribute('reset') || '';
  const overriddenAlign = dom.getAttribute('overriddenAlign') || '';
  const overriddenAlignValue = dom.getAttribute('overriddenAlignValue') || '';
  const overriddenLineSpacing = dom.getAttribute('overriddenLineSpacing') || '';
  const overriddenLineSpacingValue = dom.getAttribute('overriddenLineSpacingValue') || '';
  const overriddenIndent = dom.getAttribute('overriddenIndent') || '';
  const overriddenIndentValue = dom.getAttribute('overriddenIndentValue') || '';
  const selectionId = dom.getAttribute('selectionId') || '';
  const objectId = dom.getAttribute('objectId') || '';
  const hangingIndent = dom.getAttribute('hangingIndent') || '';
  const indentPosition = dom.getAttribute('indentPosition') || '';
    const isDeco = {
    isTag: dom.getAttribute('isTag') === 'true',
    isComment: dom.getAttribute('isComment') === 'true',
    isSlice: dom.getAttribute('isSlice') === 'true',
  };
  return {
    align,
    indent,
    lineSpacing,
    paddingTop,
    paddingBottom,
    reset,
    id,
    overriddenAlign,
    overriddenAlignValue,
    overriddenLineSpacing,
    overriddenLineSpacingValue,
    overriddenIndent,
    overriddenIndentValue,
    selectionId,
    objectId,
    hangingIndent,
    indentPosition,
    isDeco
  };
}

function getStyle(attrs: Object) {
  return getStyleEx(
    attrs.align,
    attrs.lineSpacing,
    attrs.paddingTop,
    attrs.paddingBottom
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
  const {
    indent,
    id,
    reset,
    overriddenAlign,
    overriddenAlignValue,
    overriddenLineSpacing,
    overriddenLineSpacingValue,
    overriddenIndent,
    overriddenIndentValue,
    selectionId,
    hangingIndent,
    indentPosition,
    isDeco
  } = node.attrs;
  const attrs = { ...node.attrs };
  const { style } = getStyle(node.attrs);

  style && (attrs.style = style);

  if (indentPosition && hangingIndent) {
    attrs['hangingIndent'] = 'true';
    attrs['indentPosition'] = indentPosition;
    const hIndentpx = Number(indentPosition) * 96;
    document.documentElement.style.setProperty('--hangingIndentMargin', `${hIndentpx}px`);
  }
  if (indent) {
    attrs[ATTRIBUTE_INDENT] = String(indent);
  }
  if (id) {
    attrs.id = id;
  }
  attrs.reset = reset;
  attrs.overriddenAlign = overriddenAlign;
  attrs.overriddenLineSpacing = overriddenLineSpacing;
  attrs.overriddenIndent = overriddenIndent;
  attrs.overriddenAlignValue = overriddenAlignValue;
  attrs.overriddenLineSpacingValue = overriddenLineSpacingValue;
  attrs.overriddenIndentValue = overriddenIndentValue;
  attrs.hangingIndent = hangingIndent;

  if (selectionId) {
    attrs.selectionId = selectionId;
  }

if (isDeco) {
  if (isDeco.isTag !== undefined) attrs.isTag = String(isDeco.isTag);
  if (isDeco.isComment !== undefined) attrs.isComment = String(isDeco.isComment);
  if (isDeco.isSlice !== undefined) attrs.isSlice = String(isDeco.isSlice);
}

  return ['p', attrs, 0];
}

export const toParagraphDOM = toDOM;
export const getParagraphNodeAttrs = getAttrs;
export const getParagraphStyle = getStyle;

export function convertMarginLeftToIndentValue(marginLeft: string): number {
  const ptValue = convertToCSSPTValue(marginLeft);
  return Math.min(
    Math.max(Math.floor(ptValue / INDENT_MARGIN_PT_SIZE), MIN_INDENT_LEVEL),
    MAX_INDENT_LEVEL
  );
}

export default ParagraphNodeSpec;
