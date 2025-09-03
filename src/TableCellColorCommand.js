// @flow

import { EditorState } from 'prosemirror-state';
import { setCellAttr } from 'prosemirror-tables';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { ColorEditor } from '@modusoperandi/color-picker';
import { atAnchorRight, createPopUp } from '@modusoperandi/licit-ui-commands';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

const setCellBackgroundBlack = setCellAttr('background', '#000000');

class TableCellColorCommand extends UICommand {
  _popUp = null;

  shouldRespondToUIEvent = (e: SyntheticEvent<> | MouseEvent): boolean => {
    return e.type === UICommand.EventType.MOUSEENTER;
  };

  isEnabled = (state: EditorState): boolean => {
    return setCellBackgroundBlack(state.tr);
  };

  waitForUserInput = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
    event: ?SyntheticEvent<>
  ): Promise<any> => {
    if (this._popUp) {
      return Promise.resolve(undefined);
    }
    const target = event?.currentTarget;
    if (!(target instanceof HTMLElement)) {
      return Promise.resolve(undefined);
    }

    const anchor = event ? event.currentTarget : null;
    return new Promise((resolve) => {
      this._popUp = createPopUp(ColorEditor, null, {
        anchor,
        autoDismiss: false,
        position: atAnchorRight,
        onClose: (val) => {
          if (this._popUp) {
            this._popUp = null;
            resolve(val);
          }
        },
      });
    });
  };

  executeWithUserInput = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
    hex: ?{ color: string, selectedPosition?: string[] }
  ): boolean => {
    if (dispatch && hex !== undefined) {
      const cmd = setCellAttr('background', hex.color);
      cmd(state, dispatch, view);
      return true;
    }
    return false;
  };

  cancel(): void {
    return null;
  }
}

export default TableCellColorCommand;
