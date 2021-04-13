// @flow

import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {findParentNodeOfType} from 'prosemirror-utils';
import {EditorView} from 'prosemirror-view';

import {BULLET_LIST, ORDERED_LIST, PARAGRAPH} from './NodeNames';
import noop from './noop';
import toggleList from './toggleList';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {getCustomStyleByName} from './customStyle';

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
    bOK = hasCustomNumberedList(state);
    return !bOK;
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    const {selection, schema} = state;
    const nodeType = schema.nodes[this._ordered ? ORDERED_LIST : BULLET_LIST];
    let {tr} = state;
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

  _findList(state: EditorState, type: string): ?Object {
    const {nodes} = state.schema;
    const list = nodes[type];
    const findList = list ? findParentNodeOfType(list) : noop;
    return findList(state.selection);
  }

  // [FS] IRAD-1087 2020-11-11
  // New method to execute new styling implementation for List
  //only x.x.x is handled here need to handle indent
  executeCustom = (
    state: EditorState,
    tr: Transform,
    from: number,
    to: number
  ): boolean => {
    const {schema} = state;
    const nodeType = schema.nodes[this._ordered ? ORDERED_LIST : BULLET_LIST];
    if (!nodeType) {
      return tr;
    }
    // tr = tr.setSelection(TextSelection.create(tr.doc, from, to));
    tr = toggleList(tr, schema, nodeType, this._orderedListType);
    return tr;
  };
}

// [FS] IRAD-1216 2020-02-24
// Disable the List when menu when the cursor is in custom numbered style
export function hasCustomNumberedList(state: EditorState) {
  let isNumberedList = false;
  const {selection, schema} = state;
  const text = schema.nodes[PARAGRAPH];
  const result = findParentNodeOfType(text)(selection);
  if (result && result.node.attrs) {
    if (result.node.attrs.styleName && 'None' !== result.node.attrs.styleName) {
      const style = getCustomStyleByName(result.node.attrs.styleName);
      if (
        style &&
        style.styles &&
        style.styles.styleLevel &&
        style.styles.hasNumbering
      )
        isNumberedList = true;
    }
  }
  return isNumberedList;
}
