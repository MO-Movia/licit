/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import TableCell from '@tiptap/extension-table-cell';

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
    };
  },
});
