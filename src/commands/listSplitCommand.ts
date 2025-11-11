import {EditorState, Transaction} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';

import splitListItem from '../splitListItem';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';

class ListSplitCommand extends UICommand {
  constructor() {
    super();
  }

  isEnabled = (_state: EditorState): boolean => {
    return true;
  };

  execute = (
    state: EditorState,
    dispatch?: (tr: Transform) => void,
    _view?: EditorView
  ): boolean => {
    const {selection, schema} = state;
    const tr = splitListItem(
      state.tr?.setSelection(selection),
      schema
    ) as Transaction;
    if (tr.docChanged) {
      if (dispatch) {
        dispatch(tr);
      }
      return true;
    } else {
      return false;
    }
  };

  waitForUserInput(
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    _event?: React.SyntheticEvent
  ): Promise<PromiseConstructor> {
    return Promise.resolve(null);
  }
  executeWithUserInput(
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    _inputs?: string
  ): boolean {
    return false;
  }
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

export default ListSplitCommand;
