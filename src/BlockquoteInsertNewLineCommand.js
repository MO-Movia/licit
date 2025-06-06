// @flow

import { Fragment, Schema } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { HARD_BREAK } from './NodeNames';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

// This handles the case when user press SHIFT + ENTER key to insert a new line
// into blockquote.
function insertNewLine(tr: Transform, schema: Schema): Transform {
  const { selection } = tr;
  if (!selection) {
    return tr;
  }
  const { from, empty } = selection;
  if (!empty) {
    return tr;
  }
  const br = schema.nodes[HARD_BREAK];
  if (!br) {
    return tr;
  }
  tr = tr.insert(from, Fragment.from(br.create()));
  tr = tr.setSelection(TextSelection.create(tr.doc, from + 1, from + 1));
  return tr;
}

class BlockquoteInsertNewLineCommand extends UICommand {
  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    const { schema, selection } = state;
    const tr = insertNewLine(state.tr.setSelection(selection), schema);
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

export default BlockquoteInsertNewLineCommand;
