// @flow

import nullthrows from 'nullthrows';
import { EditorState } from 'prosemirror-state';
import { setCellAttr } from 'prosemirror-tables';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { ColorEditor } from '@modusoperandi/licit-ui-commands';
import { atAnchorRight } from '@modusoperandi/licit-ui-commands';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { createPopUp } from '@modusoperandi/licit-ui-commands';

const setCellBorderBlack = setCellAttr('borderColor', '#000000');

class TableBorderColorCommand extends UICommand {
  _popUp = null;

  shouldRespondToUIEvent = (e: SyntheticEvent<> | MouseEvent): boolean => {
    return e.type === UICommand.EventType.MOUSEENTER;
  };

  isEnabled = (state: EditorState): boolean => {
    return setCellBorderBlack(state.tr);
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
    const target = nullthrows(event).currentTarget;
    if (!(target instanceof HTMLElement)) {
      return Promise.resolve(undefined);
    }

    const anchor = event ? event.currentTarget : null;
    return new Promise((resolve) => {
      this._popUp = createPopUp(ColorEditor, null, {
        anchor,
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
    color: ?string
  ): boolean => {
    if (dispatch && color !== undefined) {
      const cmd = setCellAttr('borderColor', color);
      cmd(state, dispatch, view);
      return true;
    }
    return false;
  };

  cancel(): void {
    this._popUp && this._popUp.close(undefined);
  }
}

export default TableBorderColorCommand;
