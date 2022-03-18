// @flow

import { EditorView } from 'prosemirror-view';

import {
  BACKSPACE,
  DELETE,
  DOWN_ARROW,
  LEFT_ARROW,
  RIGHT_ARROW,
  UP_ARROW,
} from './KeyCodes';

const AtomicNodeKeyCodes = new Set([
  BACKSPACE,
  DELETE,
  DOWN_ARROW,
  LEFT_ARROW,
  RIGHT_ARROW,
  UP_ARROW,
]);

export default function handleEditorKeyDown(
  view: EditorView,
  event: KeyboardEvent
): boolean {
  const { selection, tr } = view.state;
  const { from, to } = selection;
  if (from === to - 1) {
    const node = tr.doc.nodeAt(from);
    if (node.isAtom && !node.isText && node.isLeaf) {
      // [FS] IRAD-1738 2022-03-18
      // This is for handling "Copy Special" when image(s) is selected.
      // TODO: Need to move this to rich-copy-embed-images plugin. Have to find a way for that.
      if (event.ctrlKey && event.altKey && 'C' === event.key.toUpperCase()) {
        return false;
      }
      // An atomic node (e.g. Image) is selected.
      // Only whitelisted keyCode should be allowed, which prevents user
      // from typing letter after the atomic node selected.
      return !AtomicNodeKeyCodes.has(event.keyCode);
    }
  }
  return false;
}
