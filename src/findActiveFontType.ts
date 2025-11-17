/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorState, TextSelection } from 'prosemirror-state';

import { MARK_FONT_TYPE } from '@modusoperandi/licit-ui-commands';
import findActiveMark from './findActiveMark';

// This should map to `--czi-content-font-size` at `czi-editor.css`.
export const FONT_TYPE_NAME_DEFAULT = 'Arial';

export default function findActiveFontType(state: EditorState): string {
  const { schema, doc, selection, tr } = state;
  const markType = schema.marks[MARK_FONT_TYPE];
  if (!markType) {
    return FONT_TYPE_NAME_DEFAULT;
  }
  const { from, to, empty } = selection;

  if (empty) {
    const storedMarks =
      tr.storedMarks ||
      state.storedMarks ||
      ((selection as TextSelection).$cursor &&
        (selection as TextSelection).$cursor.marks &&
        (selection as TextSelection).$cursor.marks()) ||
      [];
    const sm = storedMarks.find((m) => m.type === markType);
    return sm?.attrs?.name as string  || FONT_TYPE_NAME_DEFAULT;
  }

  const mark = findActiveMark(doc, from, to, markType);
  const fontName = mark?.attrs.name;
  if (!fontName) {
    return FONT_TYPE_NAME_DEFAULT;
  }

  return fontName as string;
}
