// @flow

import { EditorState, AllSelection, TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { clearMarks, clearHeading } from '@modusoperandi/licit-ui-commands';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { CellSelection } from 'prosemirror-table';

class MarksClearCommand extends UICommand {
  isActive = (state: EditorState): boolean => {
    return false;
  };

  isEnabled = (state: EditorState) => {
    const { selection } = state;
    return (
      !selection.empty &&
      (selection instanceof TextSelection || selection instanceof AllSelection || selection instanceof CellSelection)
    );
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
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

  waitForUserInput = (
    _state: EditorState,
    _dispatch: ?(tr: Transform) => void,
    _view: ?EditorView,
    _event: ?React.SyntheticEvent
  ): Promise<undefined> => {
    return Promise.resolve(undefined);
  };

  executeWithUserInput = (
    _state: EditorState,
    _dispatch: ?(tr: Transform) => void,
    _view: ?EditorView,
    _inputs: ?string
  ): boolean => {
    return false;
  };

  cancel(): void {
    return null;
  }

}

export default MarksClearCommand;
