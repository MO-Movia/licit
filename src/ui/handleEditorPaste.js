// @flow

import {EditorView} from 'prosemirror-view';

import {uploadImageFiles} from '../ImageUploadPlaceholderPlugin';

// workaround to support ClipboardEvent as a valid type.
// https://github.com/facebook/flow/issues/1856
declare class ClipboardEvent extends Event {
  clipboardData: DataTransfer;
}

export default function handleEditorPaste(
  view: EditorView,
  event: ClipboardEvent
): boolean {
  const {clipboardData} = event;
  if (!clipboardData) {
    return false;
  }

  const {files} = clipboardData;
  if (!files || !files.length) {
    return false;
  }
  const filesList = Array.from(files);

  if (uploadImageFiles(view, filesList)) {
    event.preventDefault();
    return true;
  }
  return false;
}

// [FS] IRAD-1076 2020-10-16
// paste the text as a plain text.
export function pasteAsPlainText(
  slice:Slice
): boolean {

  if(slice&& slice.content && slice.content.content && 0< slice.content.content.length){
    for (let i = 0; i < slice.content.content.length; i++) {
      const node = slice.content.content[i];
      if(node.content && node.content.content && 0 < node.content.content.length && node.content.content[0].marks)
      {
        node.content.content[0].marks = [];
      }
    }
    return true;
  }
  return false;
}

