// @flow

import { EditorState } from 'prosemirror-state';
import { setCellAttr } from 'prosemirror-tables';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { atAnchorRight, createPopUp, findNodesWithSameMark, MARK_TEXT_COLOR } from '@modusoperandi/licit-ui-commands';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { ColorEditor } from '@modusoperandi/color-picker';

const setCellBackgroundBlack = setCellAttr('background', '#000000');

class TableBackgroundColorCommand extends UICommand {
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
    const { doc, selection, schema } = state;
    const markType = schema.marks[MARK_TEXT_COLOR];
    const { from, to } = selection;
    const result = findNodesWithSameMark(doc, from, to, markType);
    const anchor = event ? event.currentTarget : null;
    const hex = result ? result.mark.attrs.color : null;

    return new Promise((resolve) => {
      this._popUp = createPopUp(ColorEditor, { hex, runtime: view.runtime },
        {
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
    hex
  ): boolean => {
    if (dispatch && hex !== undefined) {
      const cmd = setCellAttr('background', hex.color);
      cmd(state, dispatch, view);
      return true;
    }
    return false;
  };

  cancel(): void {
    this._popUp?.close(undefined);
  }
}

export default TableBackgroundColorCommand;
