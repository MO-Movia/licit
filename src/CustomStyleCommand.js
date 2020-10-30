// @flow

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { Schema } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { AllSelection, TextSelection } from 'prosemirror-state';
import applyMark from './applyMark';
import { MARK_CUSTOMSTYLES } from './MarkNames';
import UICommand from './ui/UICommand';

// [FS] IRAD-1042 2020-09-14
// Fix: To display selected style.
function toggleCustomStyle(markType, attrs, state, tr, dispatch) {
  const ref = state.selection;
  const empty = ref.empty;
  const $cursor = ref.$cursor;
  const ranges = ref.ranges;
  if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) {
    return tr;
  }
  if (dispatch) {
    if ($cursor) {
      if (markType.isInSet(state.storedMarks || $cursor.marks())) {
        tr = tr.removeStoredMark(markType);
      } else {
        tr = tr.addStoredMark(markType.create(attrs));
      }
    } else {
      for (let i$1 = 0; i$1 < ranges.length; i$1++) {
        const ref$2 = ranges[i$1];
        const $from$1 = ref$2.$from;
        const $to$1 = ref$2.$to;
        tr.addMark($from$1.pos, $to$1.pos, markType.create(attrs));
      }
    }
  }
  return tr;
}

function markApplies(doc, ranges, type) {
  let returned = false;
  const len = ranges.length;
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

  for (let i = 0; i < len; i++) {
    returned = loop(i);
    if (returned) {
      // break the loop
      i = len + 1;
    }
  }
  return returned;
}

function setCustomInlineStyle(
  tr: Transform,
  schema: Schema,
  customStyles: any
): Transform {

  const markType = schema.marks[MARK_CUSTOMSTYLES];
  const attrs = customStyles;
  const { selection } = tr;

  if (!markType) {
    return tr;
  }
  if (
    !(selection instanceof TextSelection || selection instanceof AllSelection)
  ) {
    return tr;
  }
  tr = applyMark(tr, schema, markType, attrs);
  return tr;
}

class CustomStyleCommand extends UICommand {
  _customStyleName: string;
  _customStyle = [];

  constructor(customStyle: any, customStyleName: string) {
    super();
    this._customStyle = customStyle;
    this._customStyleName = customStyleName;
  }

  getTheInlineStyles = (isInline: boolean) => {
    let attrs = {};
    let propsCopy = [];
    propsCopy = Object.assign(propsCopy, this._customStyle);

    propsCopy.forEach((style) => {
      attrs = Object.assign(attrs, style);
      Object.entries(style).forEach(([key, value]) => {
        if (isInline && typeof value === 'boolean') {
          delete attrs[key];
        } else if (!isInline && typeof value != 'boolean') {
          delete attrs[key];
        }
      });
    });
    return attrs;
  };

  isEmpty = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  isEnabled = (state: EditorState): boolean => {
    //now the button is always enabled
    return true;
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {

    let { tr } = state;
    const { schema, selection } = state;
    if (this._customStyle) {
      const inlineStyles = this.getTheInlineStyles(true);
      if (!this.isEmpty(inlineStyles)) {
        tr = setCustomInlineStyle(
          tr.setSelection(selection),
          schema,
          inlineStyles
        );
      }
      const commonStyle = this.getTheInlineStyles(false);
      for (const key in commonStyle) {
        const markType = schema.marks[key];
        tr = toggleCustomStyle(markType, undefined, state, tr, dispatch);
      }
    }

    if (tr.docChanged || tr.storedMarksSet) {
      // If selection is empty, the color is added to `storedMarks`, which
      // works like `toggleMark`
      // (see https://prosemirror.net/docs/ref/#commands.toggleMark).
      dispatch && dispatch(tr);
      return true;
    }
    return false;
  };

}

export default CustomStyleCommand;
