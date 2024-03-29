import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { Editor } from '@tiptap/react';

class TableMoveToNextCellCommand extends UICommand {
  getEditor = (): Editor => {
    return UICommand.prototype.editor as Editor;
  };

  isEnabled = (_state: EditorState): boolean => {
    return true;
  };

  execute = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView
  ): boolean => {
    return this.getEditor().commands.goToNextCell();
  };
}

export default TableMoveToNextCellCommand;
