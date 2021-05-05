// @flow

import {EditorView} from 'prosemirror-view';

import {uploadImageFiles} from '../ImageUploadPlaceholderPlugin';

// https://prosemirror.net/examples/upload/
export default function handleEditorDrop(
  view: EditorView,
  event: DragEvent
): boolean {
  const {dataTransfer} = event;
  if (!dataTransfer) {
    return false;
  }

  // [FS] IRAD-1298 2021-05-03
  // to block drag and drop citation numbering alone
  const {selection, tr} = view.state;
  let node = selection.node;
  if (!node) {
    node = tr.doc.nodeAt(selection.from + 1);
  }
  if ('citationnote' === node.type.name) {
    event.preventDefault();
    return true;
  }

  const {files} = dataTransfer;
  if (!files || !files.length) {
    return false;
  }

  const filesList = Array.from(files);
  const coords = {x: event.clientX, y: event.clientY};
  if (uploadImageFiles(view, filesList, coords)) {
    event.preventDefault();
    return true;
  }
  return false;
}
