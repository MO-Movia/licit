// @flow

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { findParentNodeOfType } from 'prosemirror-utils';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { BLOCKQUOTE } from './NodeNames';
import toggleBlockquote from './toggleBlockquote';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

class BlockquoteToggleCommand extends UICommand {
  isActive = (state: EditorState): boolean => {
    const blockquote = state.schema.nodes[BLOCKQUOTE];
    return !!(blockquote && findParentNodeOfType(blockquote)(state.selection));
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    const { schema, selection } = state;
    const tr = toggleBlockquote(state.tr.setSelection(selection), schema);
    if (tr.docChanged) {
      dispatch && dispatch(tr);
      return true;
    } else {
      return false;
    }
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

export default BlockquoteToggleCommand;
