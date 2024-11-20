// @flow

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { findParentNodeOfType } from 'prosemirror-utils';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { CODE_BLOCK } from './NodeNames';
import { noop } from '@modusoperandi/licit-ui-commands';
import toggleCodeBlock from './toggleCodeBlock';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

class CodeBlockCommand extends UICommand {
  isActive = (state: EditorState): boolean => {
    const result = this._findCodeBlock(state);
    return !!result?.node;
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    const { selection, schema } = state;
    let { tr } = state;
    tr = tr.setSelection(selection);
    tr = toggleCodeBlock(tr, schema);
    if (tr.docChanged) {
      dispatch && dispatch(tr);
      return true;
    } else {
      return false;
    }
  };

  _findCodeBlock(state: EditorState): ?Object {
    const codeBlock = state.schema.nodes[CODE_BLOCK];
    const findCodeBlock = codeBlock ? findParentNodeOfType(codeBlock) : noop;
    return findCodeBlock(state.selection);
  }

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

export default CodeBlockCommand;
