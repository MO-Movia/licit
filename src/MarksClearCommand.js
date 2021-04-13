// @flow

import {EditorState} from 'prosemirror-state';
import {AllSelection, TextSelection} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';

import {clearMarks, clearHeading} from './clearMarks';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {getNode, getMarkByStyleName} from './CustomStyleCommand';

class MarksClearCommand extends UICommand {
  isActive = (state: EditorState): boolean => {
    return false;
  };

  isEnabled = (state: EditorState) => {
    const {selection} = state;
    return (
      !selection.empty &&
      (selection instanceof TextSelection || selection instanceof AllSelection)
    );
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    let tr = clearMarks(state.tr.setSelection(state.selection), state.schema);
    // [FS] IRAD-948 2021-02-22
    // Issue fix: after apply clear format on custom style applied paragraph, the custom style is not continuing
    const startPos = state.selection.$from.before(1);
    const endPos = state.selection.$to.after(1);
    const node = getNode(state, startPos, endPos, state.tr);
    let styleName = '';
    if (node && node.attrs) {
      styleName = node.attrs.styleName;
    }
    const storedmarks = getMarkByStyleName(styleName, state.schema);

    // [FS] IRAD-948 2021-02-22
    // Clear Header formatting
    tr = clearHeading(tr, state.schema);
    // [FS] IRAD-948 2020-05-22
    // Issue fix: after apply clear format on custom style applied paragraph, the custom style is not continuing
    tr.storedMarks = storedmarks;
    if (dispatch && tr.docChanged) {
      dispatch(tr);
      return true;
    }
    return false;
  };
}

export default MarksClearCommand;
