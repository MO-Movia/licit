/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import Table from '@tiptap/extension-table';

export const TableEx = Table.extend({
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        return this.editor.commands.goToNextCell();
      },
      'Shift-Tab': () => this.editor.commands.goToPreviousCell(),
      
    }
  },
});
