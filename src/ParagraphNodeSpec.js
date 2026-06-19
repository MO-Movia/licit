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

function getInlineStyleProperty(
  dom: HTMLElement,
  propertyName: string
): ?string {
  const inlineStyle = dom.getAttribute('style') || '';
  if (!inlineStyle) {
    return null;
  }

  const escapedProperty = propertyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexp = new RegExp(`(?:^|;)\\s*${escapedProperty}\\s*:\\s*([^;]+)`, 'i');
  const match = inlineStyle.match(regexp);
  if (!match || !match[1]) {
    return null;
  }

  const value = match[1].trim();
  return value || null;
}

function resolveMarginValue(dom: HTMLElement, cssProperty: string): ?string {
  const fromStyleMap = {
    'margin-top': dom.style.marginTop,
    'margin-bottom': dom.style.marginBottom,
    'margin-left': dom.style.marginLeft,
    'margin-right': dom.style.marginRight,
  };
  const fromStyle = fromStyleMap[cssProperty] || '';

  const attrNameMap = {
    'margin-top': 'marginTop',
    'margin-bottom': 'marginBottom',
    'margin-left': 'marginLeft',
    'margin-right': 'marginRight',
  };
  const attrName = attrNameMap[cssProperty] || cssProperty;

  if (fromStyle) {
    return fromStyle;
  }

  return (
    getInlineStyleProperty(dom, cssProperty) ||
    dom.getAttribute(cssProperty) ||
    dom.getAttribute(attrName) ||
    null
  );
}

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
    marginTop: {
      default: null,
    },
    marginBottom: {
      default: null,
    },
    marginLeft: {
      default: null,
    },
    marginRight: {
      default: null,
    },
    paddingBottom: {
      default: null,
    },
    paddingLeft: {
      default: null,
    },
    paddingRight: {
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
  const {
    lineHeight,
    textAlign,
    marginLeft,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
  } =
    dom.style;

  let align = dom.getAttribute('align') || textAlign || 'left';
  align = ALIGN_PATTERN.test(align) ? align : null;

  let indent = parseInt(dom.getAttribute(ATTRIBUTE_INDENT), 10);

  if (!indent && marginLeft) {
    indent = convertMarginLeftToIndentValue(marginLeft);
  }

  indent = indent || MIN_INDENT_LEVEL;

  const lineSpacing = lineHeight ? toCSSLineSpacing(lineHeight) : null;
  const marginTop = resolveMarginValue(dom, 'margin-top');
  const marginBottom = resolveMarginValue(dom, 'margin-bottom');
  const marginLeftValue = resolveMarginValue(dom, 'margin-left');
  const marginRight = resolveMarginValue(dom, 'margin-right');

  const id = dom.getAttribute('id') || '';
  const reset = dom.getAttribute('reset') || '';
  const overriddenAlign = dom.getAttribute('overriddenAlign') || '';
  const overriddenAlignValue = dom.getAttribute('overriddenAlignValue') || '';
  const overriddenLineSpacing = dom.getAttribute('overriddenLineSpacing') || '';
  const overriddenLineSpacingValue = dom.getAttribute('overriddenLineSpacingValue') || '';
  const overriddenIndent = dom.getAttribute('overriddenIndent') || '';
  const overriddenIndentValue = dom.getAttribute('overriddenIndentValue') || '';
  const selectionId = dom.getAttribute('selectionId');
  const objectId = dom.getAttribute('objectId');
  const hangingIndent = dom.getAttribute('hangingIndent');
  const indentPosition = dom.getAttribute('indentPosition');
  const isDeco = {
    isTag: dom.getAttribute('isTag') === 'true',
    isComment: dom.getAttribute('isComment') === 'true',
    isSlice: dom.getAttribute('isSlice') === 'true',
  };
  return {
    align,
    indent,
    lineSpacing,
    marginTop,
    marginBottom,
    marginLeft: marginLeftValue,
    marginRight,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
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
    attrs.marginTop,
    attrs.marginBottom,
    attrs.marginLeft,
    attrs.marginRight,
    attrs.paddingTop,
    attrs.paddingBottom,
    attrs.paddingLeft,
    attrs.paddingRight
  );
}

function getStyleEx(
  align,
  lineSpacing,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight
) {
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

  if (marginTop !== null && marginTop !== undefined && marginTop !== '') {
    style += `margin-top: ${marginTop};`;
  }
  if (
    marginBottom !== null &&
    marginBottom !== undefined &&
    marginBottom !== ''
  ) {
    style += `margin-bottom: ${marginBottom};`;
  }
  if (marginLeft !== null && marginLeft !== undefined && marginLeft !== '') {
    style += `margin-left: ${marginLeft};`;
  }
  if (marginRight !== null && marginRight !== undefined && marginRight !== '') {
    style += `margin-right: ${marginRight};`;
  }

  if (paddingTop && !EMPTY_CSS_VALUE.has(paddingTop)) {
    style += `padding-top: ${paddingTop};`;
  }
  if (paddingBottom && !EMPTY_CSS_VALUE.has(paddingBottom)) {
    style += `padding-bottom: ${paddingBottom};`;
  }
  if (paddingLeft && !EMPTY_CSS_VALUE.has(paddingLeft)) {
    style += `padding-left: ${paddingLeft};`;
  }
  if (paddingRight && !EMPTY_CSS_VALUE.has(paddingRight)) {
    style += `padding-right: ${paddingRight};`;
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
