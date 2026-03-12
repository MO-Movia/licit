/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import TableCell from '@tiptap/extension-table-cell';

const NUMERIC_VALUE_PATTERN = /^-?\d+(\.\d+)?$/;

const normalizeValue = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  const normalized = `${value}`.trim();
  return normalized.length ? normalized : null;
};

const normalizeCssSize = (value: unknown): string | null => {
  const normalized = normalizeValue(value);
  if (!normalized) {
    return null;
  }

  return NUMERIC_VALUE_PATTERN.test(normalized)
    ? `${normalized}px`
    : normalized;
};

export const TableCellEx = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) {
            return {};
          }        
          return {
            style: `background-color:  ${attributes.backgroundColor?.color || attributes.backgroundColor};`,
          };
        },
        parseHTML: (element) => {
          return element.style.backgroundColor.replace(/['"]+/g, '');
        },
      },
      borderLeft: {
        default: null,
        renderHTML: (attributes) => {
          return attributes.borderLeft
            ? {style: `border-left: ${attributes.borderLeft}`}
            : {};
        },
        parseHTML: (element) => element.style.borderLeft || null,
      },
      borderRight: {
        default: null,
        renderHTML: (attributes) => {
          return attributes.borderRight
            ? {style: `border-right: ${attributes.borderRight}`}
            : {};
        },
        parseHTML: (element) => element.style.borderRight || null,
      },
      borderTop: {
        default: null,
        renderHTML: (attributes) => {
          return attributes.borderTop
            ? {style: `border-top: ${attributes.borderTop}`}
            : {};
        },
        parseHTML: (element) => element.style.borderTop || null,
      },
      borderBottom: {
        default: null,
        renderHTML: (attributes) => {
          return attributes.borderBottom
            ? {style: `border-bottom: ${attributes.borderBottom}`}
            : {};
        },
        parseHTML: (element) => element.style.borderBottom || null,
      },
      borderColor: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.borderColor) {
            return {};
          }

          return {
            style: `border-color: ${attributes.borderColor}`,
          };
        },
        parseHTML: (element) => {
          return element.style.borderColor.replace(/['"]+/g, '');
        },
      },
      cellStyle: {
        default: null,
        renderHTML: (attributes) => {
          const cellStyle = normalizeValue(attributes.cellStyle);
          if (!cellStyle) {
            return {};
          }

          return {
            'data-cell-style': cellStyle,
            style: cellStyle,
          };
        },
        parseHTML: (element) => {
          return normalizeValue(element.getAttribute('data-cell-style'));
        },
      },
      cellWidth: {
        default: null,
        renderHTML: (attributes) => {
          const cellWidth = normalizeCssSize(attributes.cellWidth);
          if (!cellWidth) {
            return {};
          }

          return {
            'data-cell-width': cellWidth,
            style: `width: ${cellWidth}; min-width: ${cellWidth};`,
          };
        },
        parseHTML: (element) => {
          return (
            normalizeValue(element.dataset.cellWidth) ||
            normalizeValue(element.style.width)
          );
        },
      },
      fontSize: {
        default: null,
        renderHTML: (attributes) => {
          const fontSize = normalizeCssSize(attributes.fontSize);
          if (!fontSize) {
            return {};
          }

          return {
            'data-cell-font-size': fontSize,
            style: `font-size: ${fontSize}; --czi-cell-font-size: ${fontSize};`,
          };
        },
        parseHTML: (element) => {
          return (
            normalizeValue(element.dataset.cellFontSize) ||
            normalizeValue(element.style.fontSize)
          );
        },
      },
      letterSpacing: {
        default: null,
        renderHTML: (attributes) => {
          const letterSpacing = normalizeCssSize(attributes.letterSpacing);
          if (!letterSpacing) {
            return {};
          }

          return {
            style: `letter-spacing: ${letterSpacing};`,
          };
        },
        parseHTML: (element) => {
          return normalizeValue(element.style.letterSpacing);
        },
      },
      marginTop: {
        default: null,
        renderHTML: (attributes) => {
          const marginTop = normalizeCssSize(attributes.marginTop);
          if (!marginTop) {
            return {};
          }

          return {
            'data-cell-margin-top': marginTop,
            style: `margin-top: ${marginTop}; padding-top: ${marginTop}; --czi-cell-margin-top: ${marginTop};`,
          };
        },
        parseHTML: (element) => {
          return (
            normalizeValue(element.dataset.cellMarginTop) ||
            normalizeValue(element.style.marginTop) ||
            normalizeValue(element.style.paddingTop)
          );
        },
      },
      MarginBottom: {
        default: null,
        renderHTML: (attributes) => {
          const marginBottom = normalizeCssSize(attributes.MarginBottom);
          if (!marginBottom) {
            return {};
          }

          return {
            'data-cell-margin-bottom': marginBottom,
            style: `margin-bottom: ${marginBottom}; padding-bottom: ${marginBottom}; --czi-cell-margin-bottom: ${marginBottom};`,
          };
        },
        parseHTML: (element) => {
          return (
            normalizeValue(element.dataset.cellMarginBottom) ||
            normalizeValue(element.style.marginBottom) ||
            normalizeValue(element.style.paddingBottom)
          );
        },
      },
    };
  },
});
