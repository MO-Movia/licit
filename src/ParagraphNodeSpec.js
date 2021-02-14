// @flow
import clamp from './ui/clamp';
import convertToCSSPTValue from './convertToCSSPTValue';
import toCSSLineSpacing from './ui/toCSSLineSpacing';
import {Node} from 'prosemirror-model';

import type {NodeSpec} from './Types';
import {getCustomStyleByName} from './customStyle';

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
    styleName: {
      default: 'None',
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
  const spacingAfterParagraph = marginBottom ? marginBottom : null;

  const id = dom.getAttribute('id') || '';
  const styleName = dom.getAttribute('styleName') || null;

  return {
    align,
    indent,
    lineSpacing,
    paddingTop,
    paddingBottom,
    id,
    styleName,
    spacingAfterParagraph,
  };
}

function getStyle(attrs) {
  return getStyleEx(
    attrs.align,
    attrs.lineSpacing,
    attrs.paddingTop,
    attrs.paddingBottom,
    attrs.paragraphSpacingAfter,
    attrs.paragraphSpacingBefore,
    attrs.styleName
  );
}

function getStyleEx(
  align,
  lineSpacing,
  paddingTop,
  paddingBottom,
  marginBottom,
  marginTop,
  styleName
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

  //to get the styles of the corresponding style name
  const styleProps = getCustomStyleByName(styleName);
  if (null !== styleProps) {
    // [FS] IRAD-1100 2020-11-04
    // Add in leading and trailing spacing (before and after a paragraph)
    if (styleProps.styles.paragraphSpacingAfter) {
      style += `margin-bottom: ${styleProps.styles.paragraphSpacingAfter}pt !important;`;
    }
    if (styleProps.styles.paragraphSpacingBefore) {
      style += `margin-top: ${styleProps.styles.paragraphSpacingBefore}pt !important;`;
    }
    if (styleProps.styles.styleLevel) {
      if (styleProps.styles.strong) {
        style += 'font-weight: bold;';
      }
      if (styleProps.styles.boldNumbering) {
        style += ' --czi-counter-bold: bold;';
      }
      if (styleProps.styles.em) {
        style += 'font-style: italic;';
      }
      if (styleProps.styles.color) {
        style += `color: ${styleProps.styles.color};`;
      }
      if (styleProps.styles.fontSize) {
        style += `font-size: ${styleProps.styles.fontSize}pt;`;
      }
      if (styleProps.styles.fontName) {
        style += `font-family: ${styleProps.styles.fontName};`;
      }

      style += refreshCounters(parseInt(styleProps.styles.styleLevel));
    }
  }

  if (paddingTop && !EMPTY_CSS_VALUE.has(paddingTop)) {
    style += `padding-top: ${paddingTop};`;
  }
  if (paddingBottom && !EMPTY_CSS_VALUE.has(paddingBottom)) {
    style += `padding-bottom: ${paddingBottom};`;
  }
  return style;
}

function refreshCounters(styleLevel) {
  let latestCounters = '';
  let cssCounterReset = '';
  let setCounterReset = false;

  for (let index = 1; index <= styleLevel; index++) {
    const counterVar = 'set-cust-style-counter-' + index;
    const setCounterVal = window[counterVar];
    if (!setCounterVal) {
      cssCounterReset += `czi-cust-style-counter-${index} `;
      setCounterReset = true;
    }
    window[counterVar] = true;
  }

  if (setCounterReset) {
    latestCounters = `counter-increment: ${cssCounterReset};`;
  }
  return latestCounters;
}

function toDOM(node: Node): Array<any> {
  const {indent, id, styleName} = node.attrs;
  const attrs = {};
  const style = getStyle(node.attrs);

  style && (attrs.style = style);

  const styleProps = getCustomStyleByName(styleName);

  if (styleProps && styleProps.styles.styleLevel) {
    attrs[ATTRIBUTE_STYLE_LEVEL] = String(styleProps.styles.styleLevel);
  }

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
export const getParagraphStyle = getStyle;

export function convertMarginLeftToIndentValue(marginLeft: string): number {
  const ptValue = convertToCSSPTValue(marginLeft);
  return clamp(
    MIN_INDENT_LEVEL,
    Math.floor(ptValue / INDENT_MARGIN_PT_SIZE),
    MAX_INDENT_LEVEL
  );
}

export default ParagraphNodeSpec;
