// @flow

import { EditorState } from 'prosemirror-state';

import { MARK_CUSTOMSTYLES } from '../MarkNames';
import findActiveMark from '../findActiveMark';
import { RESERVED_STYLE_NONE } from '../ParagraphNodeSpec';

// [FS] IRAD-1042 2020-09-17
// To find the selected custom style

export default function findActiveCustomStyle(state: EditorState): string {
  const { schema, doc, selection, tr } = state;
  const markType = schema.marks[MARK_CUSTOMSTYLES];
  if (!markType) {
    return RESERVED_STYLE_NONE;
  }
  const { from, to, empty } = selection;

  if (empty) {
    const storedMarks =
      tr.storedMarks ||
      state.storedMarks ||
      (selection.$cursor &&
        selection.$cursor.marks &&
        selection.$cursor.marks()) ||
      [];
    const sm = storedMarks.find((m) => m.type === markType);
    return (sm && sm.attrs.styleName) || RESERVED_STYLE_NONE;
  }

  const mark = findActiveMark(doc, from, to, markType);
  const name = mark && mark.attrs.styleName;
  if (!name) {
    return RESERVED_STYLE_NONE;
  }
  return name;
}
