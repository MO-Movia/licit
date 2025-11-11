import * as React from 'react';
import nullthrows from 'nullthrows';
import { EditorState, TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { atAnchorRight, createPopUp } from '@modusoperandi/licit-ui-commands';
import TableGridSizeEditor from '../ui/tableGridSizeEditor';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import type { TableGridSizeEditorState } from '../ui/tableGridSizeEditor';
import { Editor } from '@tiptap/react';

class TableInsertCommand extends UICommand {
  cancel(): void {
    return null;
  }
  executeCustom(_state: EditorState, tr: Transform, _from: number, _to: number): Transform {
    return tr;
  }
  executeCustomStyleForTable(_state: EditorState, tr: Transform): Transform {
    return tr;
  }
  _popUp = null;

  shouldRespondToUIEvent = (e: React.SyntheticEvent | MouseEvent): boolean => {
    return e.type === UICommand.EventType.MOUSEENTER;
  };

  isEnabled = (state: EditorState): boolean => {
    const tr = state;
    let bOK = false;
    const { selection } = tr;
    if (selection instanceof TextSelection) {
      bOK = selection.from === selection.to;
      // [FS] IRAD-1065 2020-09-18
      // Disable create table menu if the selection is inside a table.
      if (bOK) {
        const $head = selection.$head;
        for (let d = $head.depth; d > 0; d--) {
          if ($head.node(d).type.spec.tableRole == 'row') {
            return false;
          }
        }
      }
      return bOK;
    }
    return bOK;
  };

  waitForUserInput = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    event?: React.SyntheticEvent
  ): Promise<PromiseConstructor> => {
    // replaced any with PromiseConstructor seems to not cause any errors
    if (this._popUp) {
      return Promise.resolve(undefined);
    }
    const target = nullthrows(event).currentTarget;
    if (!(target instanceof HTMLElement)) {
      return Promise.resolve(undefined);
    }

    const anchor = event ? event.currentTarget : null;
    return new Promise((resolve) => {
      this._popUp = createPopUp(TableGridSizeEditor, null, {
        anchor,
        position: atAnchorRight,
        onClose: (val) => {
          if (this._popUp) {
            this._popUp = null;
            resolve(val);
            const element = document.getElementById((anchor as HTMLElement).offsetParent.id);
            element.remove();
          }
        },
      });
    });
  };

  getEditor = (): Editor => {
    return UICommand.prototype.editor;
  };

  executeWithUserInput = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    inputs?: TableGridSizeEditorState
  ): boolean => {
    if (inputs) {
      const { rows, cols } = inputs;
      return this.getEditor().commands.insertTable({ rows, cols });
    }
    return false;
  };
}
export default TableInsertCommand;
