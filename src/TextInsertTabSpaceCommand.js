// @flow

import { Fragment, Schema } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { findParentNodeOfType } from 'prosemirror-utils';
import { EditorView } from 'prosemirror-view';
import { MARK_SPACER } from './MarkNames.js';
import { HEADING, LIST_ITEM, PARAGRAPH } from './NodeNames.js';
import { HAIR_SPACE_CHAR, SPACER_SIZE_TAB } from './SpacerMarkSpec.js';
import { applyMark } from '@modusoperandi/licit-ui-commands';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import * as React from 'react';

function insertTabSpace(
  state: EditorState,
  tr: Transform,
  schema: Schema
): Transform {
  const { selection } = tr;
  if (!selection.empty || !(selection instanceof TextSelection)) {
    return tr;
  }

  const markType = schema.marks[MARK_SPACER];
  if (!markType) {
    return tr;
  }
  const paragraph = schema.nodes[PARAGRAPH];
  const heading = schema.nodes[HEADING];
  const listItem = schema.nodes[LIST_ITEM];

  const found =
    (listItem && findParentNodeOfType(listItem)(selection)) ||
    (paragraph && findParentNodeOfType(paragraph)(selection)) ||
    (heading && findParentNodeOfType(heading)(selection));

  if (!found) {
    return tr;
  }

  const { from, to } = selection;
  if (found.node.type === listItem && found.pos === from - 2) {
    // Cursur is at the begin of the list-item, let the default indentation
    // behavior happen.
    return tr;
  }

  const textNode = schema.text(HAIR_SPACE_CHAR);
  tr = tr.insert(to, Fragment.from(textNode));
  const attrs = {
    size: SPACER_SIZE_TAB,
  };

  tr = tr.setSelection(TextSelection.create(tr.doc, to, to + 1));

  tr = applyMark(tr, schema, markType, attrs);

  tr = tr.setSelection(TextSelection.create(tr.doc, to + 1, to + 1));

  return tr;
}

class TextInsertTabSpaceCommand extends UICommand {
  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
    event: ?SyntheticEvent<>
  ): boolean => {
    const { schema, tr } = state;
    const trNext = insertTabSpace(state, tr, schema);
    if (trNext.docChanged) {
      dispatch && dispatch(trNext);
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

export default TextInsertTabSpaceCommand;
