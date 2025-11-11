import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';

import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {Editor} from '@tiptap/react';

class HistoryUndoCommand extends UICommand {
  getEditor = (): Editor => {
    return UICommand.prototype.editor;
  };

  isEnabled = (_state: EditorState): boolean => {
    const history = (_state as any).history$;
    return history.done.eventCount !== 0;
  };

  execute = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView
  ): boolean => {
    return this.getEditor().commands.undo();
  };

  waitForUserInput(
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    _event?: React.SyntheticEvent
  ): Promise<PromiseConstructor> {
    return Promise.resolve(null);
  }
  executeWithUserInput(
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    _inputs?: string
  ): boolean {
    return false;
  }
  cancel(): void {
    return null;
  }
  executeCustom(
    _state: EditorState,
    tr: Transform,
    _from: number,
    _to: number
  ): Transform {
    return tr;
  }

  executeCustomStyleForTable(_state: EditorState, tr: Transform): Transform {
    return tr;
  }
}

export default HistoryUndoCommand;
