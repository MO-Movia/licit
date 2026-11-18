// @flow

import { Fragment, Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { HORIZONTAL_RULE } from './NodeNames.js';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { canNodeTypeReplaceBlockAt } from './canNodeTypeReplaceBlock.js';

function insertHorizontalRule(tr: Transform, schema: Schema): Transform {
  const { selection } = tr;
  if (!selection) {
    return tr;
  }
  const { from, to } = selection;
  if (from !== to) {
    return tr;
  }

  const horizontalRule = schema.nodes[HORIZONTAL_RULE];
  if (!horizontalRule) {
    return tr;
  }

  // Do not insert a horizontal rule when the block containing the
  // selection lives in a parent that cannot hold it (e.g.
  // enhanced_table_figure_notes); replacement fitting would move the node
  // outside that boundary and split the surrounding structure.
  if (!canNodeTypeReplaceBlockAt(tr.doc, from, horizontalRule)) {
    return tr;
  }

  const node = horizontalRule.create({}, null, null);
  const frag = Fragment.from(node);
  tr = tr.insert(from, frag);
  return tr;
}

class HorizontalRuleCommand extends UICommand {
  isEnabled = (state: EditorState): boolean => {
    const horizontalRule = state.schema.nodes[HORIZONTAL_RULE];
    if (!horizontalRule) {
      return false;
    }
    return canNodeTypeReplaceBlockAt(
      state.doc,
      state.selection.from,
      horizontalRule
    );
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    const { selection, schema } = state;
    const tr = insertHorizontalRule(state.tr.setSelection(selection), schema);
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

export default HorizontalRuleCommand;
