// @flow

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

class PrintCommand extends UICommand {
  isActive = (state: EditorState): boolean => {
    return false;
  };

  isEnabled = (state: EditorState): boolean => {
    return !!window.print;
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    if (dispatch && window.print) {
      window.print();
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

export default PrintCommand;
