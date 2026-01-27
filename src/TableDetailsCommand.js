// @flow

import { EditorState, TextSelection } from 'prosemirror-state';
import * as React from 'react';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import TableDetails from './ui/TableDetails';
import { findParentNodeOfType } from 'prosemirror-utils';
import { createPopUp } from '@modusoperandi/licit-ui-commands';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';


class TableDetailsCommand extends UICommand {
  _popUp = null;
  isEnabled = (state: EditorState): boolean => {
    return true;
  };
  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    if (!view) {
      return false;
    }
    const { selection, schema } = state;
    const tableNode = findParentNodeOfType(schema.nodes.table)(selection);
    if (!tableNode) {
      return false;
    }
    const tableDOM = this.findTableDOM(view, tableNode.start);
    if (!tableDOM) {
      return false;
    }
    const tableRect = tableDOM.getBoundingClientRect();

    const cellDOM = this.getSelectedCellDOM(view);
    const cellRect = cellDOM?.getBoundingClientRect();

    const viewProps = {
      close: () => {
        this._popUp?.close(undefined);
      },
      editorView: view,
      table: {
        width: Math.round(tableRect.width),
        height: Math.round(tableRect.height),
      },
      cell: cellRect
        ? {
          width: Math.round(cellRect.width),
          height: Math.round(cellRect.height),
        }
        : null,
    };

    return new Promise((resolve) => {
      this._popUp = createPopUp(TableDetails, viewProps, {
        modal: true,
        onClose: (val) => {
          if (this._popUp) {
            resolve(val);
            this._popUp = null;
          }
        },
      });
    });
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

  findTableDOM(view: EditorView, pos: number): HTMLElement | null {
    const dom = view.domAtPos(pos);

    if (dom.node instanceof HTMLElement) {
      return dom.node.closest('table');
    }

    return null;
  }
  /**
 * Finds the currently selected cell DOM
 */
 getSelectedCellDOM(view: EditorView): HTMLElement | null {
  const { selection } = view.state;

  if (!(selection instanceof TextSelection)) {
    return null;
  }

  const { node } = view.domAtPos(selection.from);

  // 👇 Convert Text node → Element safely
  const element =
    node.nodeType === Node.TEXT_NODE
      ? node.parentElement
      : (node instanceof HTMLElement ? node : null);

  if (!element) return null;

  return element.closest('td, th');
}

    cancel(): void {
    this._popUp?.close(undefined);
  }
}

export default TableDetailsCommand;