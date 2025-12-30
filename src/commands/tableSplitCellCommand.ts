/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { Editor } from '@tiptap/react';

class TableSplitCellCommand extends UICommand {
  waitForUserInput(_state: EditorState, _dispatch?: (tr: Transform) => void, _view?: EditorView, _event?: React.SyntheticEvent): Promise<PromiseConstructor> {
    return Promise.resolve(null);
  }
  executeWithUserInput(_state: EditorState, _dispatch?: (tr: Transform) => void, _view?: EditorView, _inputs?: string): boolean {
    return false;
  }
  cancel(): void {
    return null;
  }
  executeCustom(_state: EditorState, tr: Transform, _from: number, _to: number): Transform {
    return tr;
  }
  executeCustomStyleForTable(_state: EditorState, tr: Transform): Transform {
    return tr;
  }
  getEditor = (): Editor => {
    return UICommand.prototype.editor;
  };

  isEnabled = (state: EditorState): boolean => {
  const { $from } = state.selection;

  let inTable = false;
  let hasSpan = false;

  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);

    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      if ((node.attrs?.rowspan && node.attrs.rowspan > 1) || (node.attrs?.colspan && node.attrs.colspan > 1)) {
        hasSpan = true;
      }
    }

    if (node.type.name === 'table') {
      inTable = true;
      break;
    }
  }

  return inTable && hasSpan;
};

  execute = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView
  ): boolean => {
    return this.getEditor().commands.splitCell();
  };
}

export default TableSplitCellCommand;
