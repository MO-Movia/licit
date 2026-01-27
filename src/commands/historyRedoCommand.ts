/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { Editor } from '@tiptap/react';

class HistoryRedoCommand extends UICommand {
  getEditor = (): Editor | null => {
    return UICommand.prototype.editor || null;
  };

  isEnabled = (_state): boolean => {
    const history = (_state).history$;
    return history?.undone?.eventCount > 0 || false;
  };

  execute = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView
  ): boolean => {
    const editor = this.getEditor();
    if (!editor) {
      console.error('Editor instance is not available.');
      return false;
    }
    return editor.commands.redo();
  };

  waitForUserInput = (): Promise<null> => Promise.resolve(null);

  executeWithUserInput = (): boolean => false;

  cancel = (): void => {
    console.warn('Cancel called on HistoryRedoCommand.');
  };

  executeCustom = (_state: EditorState, tr: Transform): Transform => tr;

  executeCustomStyleForTable(_state: EditorState, tr: Transform): Transform {
    return tr;
  }
  
  isActive = (_state: EditorState): boolean => {
    return false;
  };
}

export default HistoryRedoCommand;
