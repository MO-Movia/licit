import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { CellSelection } from 'prosemirror-tables';
import { Transform } from 'prosemirror-transform';

import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { Editor } from '@tiptap/react';

class TableMergeCellsCommand extends UICommand {
  executeCustomStyleForTable(
    _state: EditorState,
    tr: Transform,
    _from: number,
    _to: number
  ): Transform {
    return tr;
  }
  waitForUserInput(
    state: EditorState,
    dispatch?: (tr: Transform) => void,
    view?: EditorView,
    event?: any
  ): Promise<any> {
    return Promise.resolve(null);
  }
  executeWithUserInput(
    state: EditorState,
    dispatch?: (tr: Transform) => void,
    view?: EditorView,
    inputs?: any
  ): boolean {
    return false;
  }
  cancel(): void {
    return null;
  }
  executeCustom(
    state: EditorState,
    tr: Transform,
    from: number,
    to: number
  ): Transform {
    return tr;
  }
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
    const {selection} = state;
    if (selection instanceof CellSelection) {
      return this.getEditor().commands.mergeCells();
    }
    return false;
  };
}

export default TableMergeCellsCommand;
