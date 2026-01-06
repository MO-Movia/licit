/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {Node, mergeAttributes} from '@tiptap/core';
import toCSSLineSpacing from '../toCSSLineSpacing';
import convertToCSSPTValue from '../convertToCSSPTValue';

// This assumes that every 36pt maps to one indent level.
export const INDENT_MARGIN_PT_SIZE = 36;
export const MIN_INDENT_LEVEL = 0;
export const MAX_INDENT_LEVEL = 7;
export const ATTRIBUTE_INDENT = 'data-indent';
export const ATTRIBUTE_STYLE_LEVEL = 'data-style-level';
export const RESERVED_STYLE_NONE = 'None';
export const RESERVED_STYLE_NONE_NUMBERING = RESERVED_STYLE_NONE + '-@#$-';
const cssVal = new Set<string>(['', '0%', '0pt', '0px']);

export const EMPTY_CSS_VALUE = cssVal;

export type AttrType = {
  align?;
  lineSpacing?;
  paddingTop?;
  paddingBottom?;
  pageBreak?: boolean;
  style?: string;
  id?;
  level?;
  type?;
  visible?;
  indent?;
  listStyleType?;
  class?;
  latex?;
  name?;
  size?;
};

const ALIGN_PATTERN = /(left|right|center|justify)/;

function getAttrs(dom: HTMLElement): Record<string, unknown> {
  const {lineHeight, textAlign, marginLeft, paddingTop, paddingBottom} =
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
  const overriddenLineSpacingValue =
    dom.getAttribute('overriddenLineSpacingValue') || '';
  const overriddenIndent = dom.getAttribute('overriddenIndent') || '';
  const overriddenIndentValue = dom.getAttribute('overriddenIndentValue') || '';
  const selectionId = dom.getAttribute('selectionId') || '';
  const objectId = dom.getAttribute('objectId') || '';
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
  };
}

function getStyle(attrs: {[key: string]: unknown}): string {
  return getStyleEx(
    attrs.align,
    attrs.lineSpacing,
    attrs.paddingTop,
    attrs.paddingBottom
  );
}

function getStyleEx(align, lineSpacing, paddingTop, paddingBottom): string {
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
  return style;
}

function toDOM(node) {
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
  } = node.attrs;
  const attrs = {...node.attrs};
  const style = getStyle(node.attrs);

  if (style) {
    attrs.style = style;
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

  if (selectionId) {
    attrs.selectionId = selectionId;
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

// TipTap Node Definition
const ParagraphNode = Node.create({
  name: 'paragraph',

  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'inline*',

  defining: true,

  addAttributes() {
    return {
      align: {
        default: null,
        parseHTML: (element) => {
          getAttrs(element).align;
        },
        renderHTML: (attributes) => {
          if (!attributes.align) return {};
          return {align: String(attributes.align)};
        },
      },
      color: {
        default: null,
      },
      id: {
        default: null,
        parseHTML: (element) => getAttrs(element).id,
        renderHTML: (attributes) => {
          if (!attributes.id) return {};
          return {id: attributes.id};
        },
      },
      indent: {
        default: null,
        parseHTML: (element) => getAttrs(element).indent,
        renderHTML: (attributes) => {
          if (!attributes.indent) return {};
          return {[ATTRIBUTE_INDENT]: String(attributes.indent)};
        },
      },
      lineSpacing: {
        default: null,
        parseHTML: (element) => getAttrs(element).lineSpacing,
        renderHTML: (attributes) => {
          if (!attributes.lineSpacing) return {};
          return {};
        },
      },
      paddingBottom: {
        default: null,
        parseHTML: (element) => getAttrs(element).paddingBottom,
        renderHTML: (attributes) => {
          if (!attributes.paddingBottom) return {};
          return {};
        },
      },
      paddingTop: {
        default: null,
        parseHTML: (element) => getAttrs(element).paddingTop,
        renderHTML: (attributes) => {
          if (!attributes.paddingTop) return {};
          return {};
        },
      },
      reset: {
        default: null,
        parseHTML: (element) => getAttrs(element).reset,
        renderHTML: (attributes) => {
          return {reset: attributes.reset || ''};
        },
      },
      overriddenAlign: {
        default: null,
        parseHTML: (element) => getAttrs(element).overriddenAlign,
        renderHTML: (attributes) => {
          return {overriddenAlign: attributes.overriddenAlign || ''};
        },
      },
      overriddenLineSpacing: {
        default: null,
        parseHTML: (element) => getAttrs(element).overriddenLineSpacing,
        renderHTML: (attributes) => {
          return {
            overriddenLineSpacing: attributes.overriddenLineSpacing || '',
          };
        },
      },
      overriddenIndent: {
        default: null,
        parseHTML: (element) => getAttrs(element).overriddenIndent,
        renderHTML: (attributes) => {
          return {overriddenIndent: attributes.overriddenIndent || ''};
        },
      },
      overriddenAlignValue: {
        default: null,
        parseHTML: (element) => getAttrs(element).overriddenAlignValue,
        renderHTML: (attributes) => {
          return {
            overriddenAlignValue: attributes.overriddenAlignValue || '',
          };
        },
      },
      overriddenLineSpacingValue: {
        default: null,
        parseHTML: (element) => getAttrs(element).overriddenLineSpacingValue,
        renderHTML: (attributes) => {
          return {
            overriddenLineSpacingValue:
              attributes.overriddenLineSpacingValue || '',
          };
        },
      },
      overriddenIndentValue: {
        default: null,
        parseHTML: (element) => getAttrs(element).overriddenIndentValue,
        renderHTML: (attributes) => {
          return {
            overriddenIndentValue: attributes.overriddenIndentValue || '',
          };
        },
      },
      selectionId: {
        default: null,
        parseHTML: (element) => getAttrs(element).selectionId,
        renderHTML: (attributes) => {
          if (!attributes.selectionId) return {};
          return {selectionId: attributes.selectionId};
        },
      },
      objectId: {
        default: null,
        parseHTML: (element) => getAttrs(element).objectId,
        renderHTML: (attributes) => {
          if (!attributes.objectId) return {};
          return {objectId: attributes.objectId};
        },
      },
    };
  },

  parseHTML() {
    return [{tag: 'p'}];
  },

  renderHTML({HTMLAttributes}) {
    const style = getStyle(HTMLAttributes);
    const attrs = {...HTMLAttributes};

    if (style) {
      attrs.style = style;
    }

    return ['p', mergeAttributes(this.options.HTMLAttributes, attrs), 0];
  },
});

export default ParagraphNode;
