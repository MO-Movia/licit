// @flow

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { findParentNodeOfType } from 'prosemirror-utils';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { BULLET_LIST, ORDERED_LIST, IMAGE } from './NodeNames';
import { noop } from '@modusoperandi/licit-ui-commands';
import { toggleList } from '@modusoperandi/licit-ui-commands';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { isNodeSelectionForNodeType } from '@modusoperandi/licit-ui-commands';

export class ListToggleCommand extends UICommand {
  _ordered: boolean;
  _orderedListType: string;

  constructor(ordered: boolean, type: string) {
    super();
    this._ordered = ordered;
    this._orderedListType = type;
  }

  isActive = (state: EditorState): boolean => {
    let bOK = false;
    if (this._ordered) {
      bOK = !!this._findList(state, ORDERED_LIST);
    } else {
      bOK = !!this._findList(state, BULLET_LIST);
    }
    return bOK;
  };

  isEnabled = (state: EditorState, view: ?EditorView): boolean => {
    let bOK = false;
    bOK = hasImageNode(state);
    return !bOK;
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    const { selection, schema } = state;
    const nodeType = schema.nodes[this._ordered ? ORDERED_LIST : BULLET_LIST];
    let { tr } = state;
    tr = tr.setSelection(selection);
    if (!nodeType) {
      return tr;
    }
    tr = toggleList(tr, schema, nodeType, this._orderedListType);
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

  _findList(state: EditorState, type: string): ?Object {
    const { nodes } = state.schema;
    const list = nodes[type];
    const findList = list ? findParentNodeOfType(list) : noop;
    return findList(state.selection);
  }


}

// [FS] IRAD-1317 2021-05-06
// To disable the list menu in toolbar when select an image
export function hasImageNode(state: EditorState) {
  const { selection, schema } = state;
  const imageNodeType = schema.nodes[IMAGE];
  return imageNodeType && isNodeSelectionForNodeType(selection, imageNodeType);
}
