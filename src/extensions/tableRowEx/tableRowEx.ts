/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import TableRow from '@tiptap/extension-table-row';

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

export const TableRowEx = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      rowHeight: {
        default: null,
        renderHTML: (attributes) => {
          const rowHeight = normalizeCssSize(attributes.rowHeight);
          if (!rowHeight) {
            return {};
          }

          return {
            style: `height: ${rowHeight}`,
          };
        },
        parseHTML: (element) => {
          return normalizeValue(element.style.height);
        },
      },
      rowWidth: {
        default: null,
        renderHTML: (attributes) => {
          const rowWidth = normalizeCssSize(attributes.rowWidth);
          if (!rowWidth) {
            return {};
          }

          return {
            style: `width: ${rowWidth}`,
          };
        },
        parseHTML: (element) => {
          return normalizeValue(element.style.width);
        },
      },
    };
  },
});
