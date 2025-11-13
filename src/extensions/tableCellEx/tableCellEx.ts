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
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
        parseHTML: (element) => {
          return element.style.backgroundColor.replace(/['"]+/g, '');
        },
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
