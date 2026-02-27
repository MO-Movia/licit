/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import TableRow from '@tiptap/extension-table-row';

const DEFAULT_ROW_HEIGHT = 'auto';
const DEFAULT_ROW_WIDTH = 'auto';

const normalizeCssSize = (value: unknown, fallback: string): string => {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return `${value}px`;
  }

  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return `${trimmed}px`;
  }

  return trimmed;
};

export const TableRowEx = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      rowHeight: {
        default: DEFAULT_ROW_HEIGHT,
        parseHTML: (element) => {
          return normalizeCssSize(
            element.getAttribute('rowHeight') ??
              element.getAttribute('rowheight') ??
              element.style.height,
            DEFAULT_ROW_HEIGHT
          );
        },
        renderHTML: (attributes) => {
          const rowHeight = normalizeCssSize(
            attributes.rowHeight,
            DEFAULT_ROW_HEIGHT
          );
          return {
            rowHeight,
            style: `height: ${rowHeight};`,
          };
        },
      },
      rowWidth: {
        default: DEFAULT_ROW_WIDTH,
        parseHTML: (element) => {
          return normalizeCssSize(
            element.getAttribute('rowWidth') ??
              element.getAttribute('rowwidth') ??
              element.style.width,
            DEFAULT_ROW_WIDTH
          );
        },
        renderHTML: (attributes) => {
          const rowWidth = normalizeCssSize(attributes.rowWidth, DEFAULT_ROW_WIDTH);
          return {
            rowWidth,
            style: `width: ${rowWidth};`,
          };
        },
      },
    };
  },
});

