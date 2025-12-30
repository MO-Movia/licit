/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {findParentNodeClosestToPos} from '@tiptap/core';
import Table, {createTable} from '@tiptap/extension-table';
import {TextSelection} from 'prosemirror-state';

export const TableEx = Table.extend({
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        const {state} = this.editor;
        const {selection} = state;

        const parentCell = findParentNodeClosestToPos(
          selection.$from,
          (node) =>
            node.type.spec.tableRole === 'cell' ||
            node.type.spec.tableRole === 'header_cell'
        );

        const cellNode = parentCell?.node;
        const moved = this.editor.commands.goToNextCell();
        if (moved) {
          return true;
        } else if (!moved && cellNode?.attrs?.vignette === false) {
          return this.editor.chain().addRowAfter().goToNextCell().run();
        }
      },
      'Shift-Tab': () => this.editor.commands.goToPreviousCell(),
    };
  },
  addCommands() {
    return {
      ...this.parent?.(),

      // override only insertTable to remove header row
      insertTable:
        ({rows = 3, cols = 3} = {}) =>
        ({tr, dispatch, editor}) => {
          const withHeaderRow = false;

          const node = createTable(editor.schema, rows, cols, withHeaderRow);

          if (dispatch) {
            const offset = tr.selection.from + 1;

            tr.replaceSelectionWith(node)
              .scrollIntoView()
              .setSelection(TextSelection.near(tr.doc.resolve(offset)));
          }

          return true;
        },
    };
  },
});
