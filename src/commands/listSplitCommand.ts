import { EditorState, Transaction } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import splitListItem from '../splitListItem';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

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
    const { selection, schema } = state;
    const tr = splitListItem(
      state.tr.setSelection(selection),
      schema
    ) as Transaction;
    if (tr.docChanged) {
      dispatch && dispatch(tr);
      return true;
    } else {
      return false;
    }
  };
}

export default ListSplitCommand;
