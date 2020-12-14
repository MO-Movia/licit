// @flow

import { toggleMark } from 'prosemirror-commands';
import { EditorState, TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import findNodesWithSameMark from './findNodesWithSameMark';
import UICommand from './ui/UICommand';

class MarkToggleCommand extends UICommand {
  _markName: string;

  constructor(markName: string) {
    super();
    this._markName = markName;
  }

  isActive = (state: EditorState): boolean => {
    const { schema, doc, selection } = state;
    const { from, to } = selection;
    const markType = schema.marks[this._markName];
    if (markType && from < to) {
      return !!findNodesWithSameMark(doc, from, to - 1, markType);
    }
    return false;
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    const { schema, selection, tr } = state;
    const markType = schema.marks[this._markName];
    if (!markType) {
      return false;
    }

    if (selection.empty && !(selection instanceof TextSelection)) {
      return false;
    }

    const { from, to } = selection;
    if (tr && to === from + 1) {
      const node = tr.doc.nodeAt(from);
      if (node.isAtom && !node.isText && node.isLeaf) {
        // An atomic node (e.g. Image) is selected.
        return false;
      }
    }

    // TODO: Replace `toggleMark` with transform that does not change scroll
    // position.
    return toggleMark(markType)(state, dispatch, view);

  };

  // [FS] IRAD-1087 2020-09-30
  // Method to execute strike, em, strong, underline,superscrpt for custom styling implementation.
  executeCustom = (
    state: EditorState,
    tr: Transform,
  ) => {
    const { schema, selection } = state;
    const markType = schema.marks[this._markName];
    if (!markType) {
      return false;
    }

    if (selection.empty && !(selection instanceof TextSelection)) {
      return false;
    }

    const { from, to } = selection;
    if (tr && to === from + 1) {
      const node = tr.doc.nodeAt(from);
      if (node.isAtom && !node.isText && node.isLeaf) {
        // An atomic node (e.g. Image) is selected.
        return false;
      }
    }

    return toggleCustomStyle(markType, null, state, tr);

  };
}

// [FS] IRAD-1042 2020-09-30
// Fix: overrided the toggleMarks for custom style implementation
// Return Transform object
function toggleCustomStyle(markType, attrs, state, tr) {
  const ref = state.selection;
  const empty = ref.empty;
  const $cursor = ref.$cursor;
  const ranges = ref.ranges;
  const startPos = ref.$from.before(1);
  const endPos = ref.$to.after(1);

  if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) {
    return tr;
  }
  if ($cursor) {
    if (markType.isInSet(state.storedMarks || $cursor.marks())) {
      tr = state.tr.removeStoredMark(markType);
    } else {
      tr = state.tr.addStoredMark(markType.create(attrs));
    }
  }
  else {
    // [FS] IRAD-1043 2020-10-27
    // No need to remove the applied custom style, if user select the same style multiple times.
    tr.addMark(startPos, endPos, markType.create(attrs));
  }
  return tr;
}
//overrided method from prosemirror Transform
function markApplies(doc, ranges, type) {
  let returned = false;
  const loop = function (i) {
    const ref = ranges[i];
    const $from = ref.$from;
    const $to = ref.$to;
    let can = $from.depth == 0 ? doc.type.allowsMarkType(type) : false;
    let bOk = false;

    doc.nodesBetween($from.pos, $to.pos, function (node) {
      if (can) {
        return false;
      }
      can = node.inlineContent && node.type.allowsMarkType(type);
      return true;
    });
    if (can) {
      bOk = true;
    }
    return bOk;
  };

  for (let i = 0; i < ranges.length; i++) {
    returned = loop(i);
    if (returned) {
      return returned;
    }
  }
  return returned;
}


export default MarkToggleCommand;
