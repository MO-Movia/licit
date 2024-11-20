// @flow

import nullthrows from 'nullthrows';
import { EditorState } from 'prosemirror-state';
import { setCellAttr } from 'prosemirror-tables';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { ColorEditor } from '@modusoperandi/color-picker';
import { atAnchorRight, createPopUp, findNodesWithSameMark, MARK_TEXT_COLOR } from '@modusoperandi/licit-ui-commands';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

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
    const { doc, selection, schema } = state;
    const markType = schema.marks[MARK_TEXT_COLOR];
    const { from, to } = selection;
    const result = findNodesWithSameMark(doc, from, to, markType);

    const anchor = event ? event.currentTarget : null;
    const hex = result ? result.mark.attrs.color : null;

    return new Promise((resolve) => {
      this._popUp = createPopUp(ColorEditor,{ hex, runtime: view.runtime },
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
    this._popUp?.close(undefined);
  }
}

export default TableBorderColorCommand;