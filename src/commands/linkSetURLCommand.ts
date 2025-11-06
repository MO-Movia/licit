import * as React from 'react';
import {EditorState, TextSelection} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';

import {
  MARK_LINK,
  applyMark,
  findNodesWithSameMark,
  createPopUp,
} from '@modusoperandi/licit-ui-commands';
import {
  hideSelectionPlaceholder,
  showSelectionPlaceholder,
} from '../plugins/selectionPlaceholderPlugin';
import LinkURLEditor from '../ui/linkURLEditor';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';

class LinkSetURLCommand extends UICommand {
  _popUp = null;

  isEnabled = (state: EditorState): boolean => {
    if (!(state.selection instanceof TextSelection)) {
      // Could be a NodeSelection or CellSelection.
      return false;
    }

    const markType = state.schema.marks[MARK_LINK];
    if (!markType) {
      return false;
    }
    const {from, to} = state.selection;
    return from < to;
  };

  waitForUserInput = (
    state: EditorState,
    dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    _event?: React.SyntheticEvent
  ): Promise<PromiseConstructor> => {
    // replaced any with PromiseConstructor seems to not cause any errors
    if (this._popUp) {
      return Promise.resolve(undefined);
    }

    if (dispatch) {
      dispatch(showSelectionPlaceholder(state));
    }

    const {doc, schema, selection} = state;
    const markType = schema.marks[MARK_LINK];
    if (!markType) {
      return Promise.resolve(undefined);
    }
    const {from, to} = selection;
    const result = findNodesWithSameMark(doc, from, to, markType);
    const href = result ? result.mark.attrs.href : null;
    return new Promise((resolve) => {
      this._popUp = createPopUp(
        LinkURLEditor,
        {href},
        {
          modal: true,
          onClose: (val) => {
            if (this._popUp) {
              this._popUp = null;
              resolve(val);
            }
          },
        }
      );
    });
  };

  executeWithUserInput = (
    state: EditorState,
    dispatch?: (tr: Transform) => void,
    view?: EditorView,
    href?: string
  ): boolean => {
    if (dispatch) {
      const {selection, schema} = state;
      let {tr} = state;
      (tr as Transform) = view ? hideSelectionPlaceholder(view.state) : tr;
      tr = tr?.setSelection(selection);
      if (href !== undefined) {
        const markType = schema.marks[MARK_LINK];
        const attrs = href ? {href} : null;
        (tr as Transform) = applyMark(
          tr.setSelection(state.selection),
          schema,
          markType,
          attrs
        );
      }
      dispatch(tr);
    }
    if (view) {
      view.focus();
    }
    return true;
  };

  cancel(): void {
    return null;
  }
  executeCustom(
    _state: EditorState,
    tr: Transform,
    _from: number,
    _to: number
  ): Transform {
    return tr;
  }
  executeCustomStyleForTable(_state: EditorState, tr: Transform): Transform {
    return tr;
  }
}

export default LinkSetURLCommand;
