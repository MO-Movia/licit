// @flow

import { toggleMark } from 'prosemirror-commands';
import { EditorState, TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import applyMark from './applyMark';

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
  // New method to execute new styling implementation of 
  //strike, em, strong, underline,superscrpt
  executeCustom = (
    state: EditorState,
    tr
  ) => {
    const { schema, selection } = state;
    // let { tr } = state
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

    return toggleCustomStyle(markType, null, state, tr)

  };
}

// [FS] IRAD-1042 2020-09-30
// Fix: overrided the toggleMarks
//in our use case no need of dispatch tr inside the toggle mark
function toggleCustomStyle(markType, attrs, state, tr) {
  var ref = state.selection;
  var empty = ref.empty;
  var $cursor = ref.$cursor;
  var ranges = ref.ranges;
  if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) {
    return false;
  }
  if ($cursor) {
    if (markType.isInSet(state.storedMarks || $cursor.marks())) {
      tr = tr.removeStoredMark(markType);
    } else {
      tr = tr.addStoredMark(markType.create(attrs));
    }
  } else {
    // var has = false;
    // for (var i = 0; !has && i < ranges.length; i++) {
    //   var ref$1 = ranges[i];
    //   var $from = ref$1.$from;
    //   var $to = ref$1.$to;
    //   has = state.doc.rangeHasMark($from.pos, $to.pos, markType);
    // }
    for (var i$1 = 0; i$1 < ranges.length; i$1++) {
      var ref$2 = ranges[i$1];
      var $from$1 = ref$2.$from;
      var $to$1 = ref$2.$to;
      // if (has) {
      //   tr.removeMark($from$1.pos, $to$1.pos, markType);
      // } else {
      tr.addMark($from$1.pos, $to$1.pos, markType.create(attrs));
      // }
    }
    return tr;
  }

  return tr;
}

function markApplies(doc, ranges, type) {
  var loop = function (i) {
    var ref = ranges[i];
    var $from = ref.$from;
    var $to = ref.$to;
    var can = $from.depth == 0 ? doc.type.allowsMarkType(type) : false;
    doc.nodesBetween($from.pos, $to.pos, function (node) {
      if (can) {
        return false;
      }
      can = node.inlineContent && node.type.allowsMarkType(type);
    });
    if (can) {
      return { v: true };
    }
  };

  for (var i = 0; i < ranges.length; i++) {
    var returned = loop(i);

    if (returned) return returned.v;
  }
  return false;
}


export default MarkToggleCommand;
