import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { CellSelection } from 'prosemirror-tables';
import { Transform } from 'prosemirror-transform';

import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { Editor } from '@tiptap/react';

class TableMergeCellsCommand extends UICommand {
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
  isEnabled = (_state: EditorState): boolean => {
    return true;
  };

  getEditor = (): Editor => {
    return UICommand.prototype.editor;
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
