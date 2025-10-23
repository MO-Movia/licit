import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { Editor } from '@tiptap/react';

class TableAddRowBeforeCommand extends UICommand {
  waitForUserInput(state: EditorState, dispatch?: (tr: Transform) => void, view?: EditorView, event?: any): Promise<any> {
    return Promise.resolve(null);
  }
  executeWithUserInput(state: EditorState, dispatch?: (tr: Transform) => void, view?: EditorView, inputs?: any): boolean {
    return false;
  }
  cancel(): void {
    return null;
  }
  executeCustom(state: EditorState, tr: Transform, from: number, to: number): Transform {
    return tr;
  }
  getEditor = (): Editor => {
    return UICommand.prototype?.editor as Editor;
  };

  isEnabled = (_state: EditorState): boolean => {
    return true;
  };

  execute = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView
  ): boolean => {
    return this.getEditor().commands.addRowBefore();
  };
}

export default TableAddRowBeforeCommand;
