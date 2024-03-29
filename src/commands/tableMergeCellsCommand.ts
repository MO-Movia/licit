import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { CellSelection } from 'prosemirror-tables';
import { Transform } from 'prosemirror-transform';

import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { Editor } from '@tiptap/react';

class TableMergeCellsCommand extends UICommand {
  isEnabled = (_state: EditorState): boolean => {
    return true;
  };

  getEditor = (): Editor => {
    return UICommand.prototype.editor as Editor;
  };

  execute = (
    state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView
  ): boolean => {
    const { selection } = state;
    if (selection instanceof CellSelection) {
      return this.getEditor().commands.mergeCells();
    }
    return false;
  };
}

export default TableMergeCellsCommand;
