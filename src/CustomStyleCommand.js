// @flow

import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {toggleMark} from 'prosemirror-commands';
import {findParentNodeOfType} from 'prosemirror-utils';
import {EditorView} from 'prosemirror-view';
import {AllSelection, TextSelection} from 'prosemirror-state';
import applyMark from './applyMark';
import {MARK_CUSTOMSTYLES, MARK_TEXT_COLOR, MARK_STRONG} from './MarkNames';
import {HEADING} from './NodeNames';
import noop from './noop';
import UICommand from './ui/UICommand';
 // [FS] IRAD-1042 2020-09-14
  // Fix: To display selected style.
function toggleCustomStyle(markType, attrs, state, tr, dispatch) {
  const ref = state.selection;
  const empty = ref.empty;
  const $cursor = ref.$cursor;
  const ranges = ref.ranges;
  if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) {
    return false;
  }
  if (dispatch) {
    if ($cursor) {
      if (markType.isInSet(state.storedMarks || $cursor.marks())) {
        dispatch(tr.removeStoredMark(markType));
      } else {
        dispatch(tr.addStoredMark(markType.create(attrs)));
      }
    } else {
      // var has = false;
      // for (var i = 0; !has && i < ranges.length; i++) {
      //   var ref$1 = ranges[i];
      //   var $from = ref$1.$from;
      //   var $to = ref$1.$to;
      //   has = state.doc.rangeHasMark($from.pos, $to.pos, markType);
      // }
      for (let i$1 = 0; i$1 < ranges.length; i$1++) {
        const ref$2 = ranges[i$1];
        const $from$1 = ref$2.$from;
        const $to$1 = ref$2.$to;
        // if (has) {
        //   tr.removeMark($from$1.pos, $to$1.pos, markType);
        // } else {
          tr.addMark($from$1.pos, $to$1.pos, markType.create(attrs));
        // }
      }
      return tr;
    }
  }
  return true;
}

function markApplies(doc, ranges, type) {
  const loop = function (i) {
    const ref = ranges[i];
    const $from = ref.$from;
    const $to = ref.$to;
    let can = $from.depth == 0 ? doc.type.allowsMarkType(type) : false;
    doc.nodesBetween($from.pos, $to.pos, function (node) {
      if (can) {
        return false;
      }
      can = node.inlineContent && node.type.allowsMarkType(type);
    });
    if (can) {
      return {v: true};
    }
  };

  for (let i = 0; i < ranges.length; i++) {
    const returned = loop(i);

    if (returned) return returned.v;
  }
  return false;
}
function setCustomInlineStyle(
  tr: Transform,
  schema: Schema,
  customStyles: any
): Transform {
  const markType = schema.marks[MARK_CUSTOMSTYLES];
  if (!markType) {
    return tr;
  }
  const {selection} = tr;
  if (
    !(selection instanceof TextSelection || selection instanceof AllSelection)
  ) {
    return tr;
  }

  const attrs = customStyles;

  tr = applyMark(tr, schema, markType, attrs);
  return tr;
}

class CustomStyleCommand extends UICommand {
  _customStyleName: string;
  _customStyle = [];

  constructor(customStyle: any,customStyleName:string) {
    super();
    this._customStyle = customStyle;
    this._customStyleName =customStyleName;
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
    for(const key in obj) {
      if (obj.hasOwnProperty(key)) {
         return false;
      }
    }
    return true;
 }

  isEnabled = (state: EditorState): boolean => {
    return true;
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    let {schema, selection, tr} = state;
    if (this._customStyle) {
      const inlineStyles= this.getTheInlineStyles(true);
      if(!this.isEmpty(inlineStyles)){
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

  _findHeading(state: EditorState): ?Object {
    const heading = state.schema.nodes[HEADING];
    const fn = heading ? findParentNodeOfType(heading) : noop;
    return fn(state.selection);
  }
}

export default CustomStyleCommand;
