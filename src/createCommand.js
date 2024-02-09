// @flow

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

type ExecuteCall = (
  state: EditorState,
  dispatch?: ?(tr: Transform) => void,
  view?: ?EditorView
) => boolean;

export default function createCommand(execute: ExecuteCall): UICommand {
  class CustomCommand extends UICommand {
    isEnabled = (state: EditorState): boolean => {
      return this.execute(state);
    };

    execute = (
      state: EditorState,
      dispatch: ?(tr: Transform) => void,
      view: ?EditorView
    ): boolean => {
      const tr = state.tr;
      let endTr = tr;
      execute(
        state,
        (nextTr) => {
          endTr = nextTr;
          dispatch && dispatch(endTr);
        },
        view
      );
      return endTr.docChanged || tr !== endTr;
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
  return new CustomCommand();
}
