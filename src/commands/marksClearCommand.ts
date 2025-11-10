import {EditorState, AllSelection, TextSelection} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';

import {clearMarks, clearHeading} from '@modusoperandi/licit-ui-commands';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';

class MarksClearCommand extends UICommand {
  executeCustomStyleForTable(
    _state: EditorState,
    tr: Transform,
    _from: number,
    _to: number
  ): Transform {
    return tr;
  }
  isActive = (_state: EditorState): boolean => {
    return false;
  };

  isEnabled = (state: EditorState): boolean => {
    const {selection} = state;
    return (
      !selection.empty &&
      (selection instanceof TextSelection || selection instanceof AllSelection)
    );
  };

  execute = (
    state: EditorState,
    dispatch?: (tr: Transform) => void,
    _view?: EditorView
  ): boolean => {
    let tr = clearMarks(state.tr.setSelection(state.selection), state.schema);
    // [FS] IRAD-948 2021-02-22

    // Clear Header formatting
    tr = clearHeading(tr, state.schema);

    if (dispatch && tr.docChanged) {
      dispatch(tr);
      return true;
    }
    return false;
  };

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
}

export default MarksClearCommand;
