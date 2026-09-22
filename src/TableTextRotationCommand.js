/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */
// @flow

import { Node } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import {
  CellSelection,
  isInTable,
  selectionCell,
  setCellAttr,
} from 'prosemirror-tables';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

export const CLOCKWISE_TEXT_ROTATION = 'clockwise';
export const TABLE_TEXT_ROTATION_ATTRIBUTE = 'textRotation';

function getSelectedCells(state: EditorState): Array<Node> {
  if (!isInTable(state)) {
    return [];
  }

  const cells = [];
  if (state.selection instanceof CellSelection) {
    state.selection.forEachCell((node) => cells.push(node));
    return cells;
  }

  const node = state.doc.nodeAt(selectionCell(state).pos);
  if (node) {
    cells.push(node);
  }
  return cells;
}

class TableTextRotationCommand extends UICommand {
  isEnabled = (state: EditorState): boolean => isInTable(state);

  isActive = (state: EditorState): boolean => {
    const cells = getSelectedCells(state);
    return (
      cells.length > 0 &&
      cells.every(
        (cell) =>
          cell.attrs[TABLE_TEXT_ROTATION_ATTRIBUTE] ===
          CLOCKWISE_TEXT_ROTATION
      )
    );
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    _view: ?EditorView
  ): boolean => {
    if (!this.isEnabled(state)) {
      return false;
    }

    const value = this.isActive(state) ? null : CLOCKWISE_TEXT_ROTATION;
    return setCellAttr(TABLE_TEXT_ROTATION_ATTRIBUTE, value)(state, dispatch);
  };

  waitForUserInput = (
    _state: EditorState,
    _dispatch: ?(tr: Transform) => void,
    _view: ?EditorView,
    _event: ?React.SyntheticEvent
  ): Promise<undefined> => Promise.resolve(undefined);

  executeWithUserInput = (
    _state: EditorState,
    _dispatch: ?(tr: Transform) => void,
    _view: ?EditorView,
    _inputs: any
  ): boolean => false;

  cancel(): void {
    return null;
  }
}

export default TableTextRotationCommand;
