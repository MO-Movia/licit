// @flow

import { Schema, Node } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import { setTextAlign } from './TextAlignCommand';
import { setTextLineSpacing } from './TextLineSpacingCommand';
import { setParagraphSpacing } from './ParagraphSpacingCommand';
import { RESERVED_STYLE_NONE } from './ParagraphNodeSpec';

// [FS] IRAD-1053 2020-11-13
// Issue fix: Line spacing and paragraph spacing not removed when select Remove style.
export function removeTextAlignAndLineSpacing(
  tr: Transform,
  schema: Schema
): Transform {
  tr = setTextAlign(tr, schema, null);
  // to remove the applied line spacing
  tr = setTextLineSpacing(tr, schema, null);
  // to remove the paragraph spacing after format
  tr = setParagraphSpacing(tr, schema, '0', true);
  // to remove the paragraph spacing before format
  tr = setParagraphSpacing(tr, schema, '0', false);
  return tr;
}

export function clearCustomStyleAttribute(node: Node) {
  if (node.attrs) {
    if (node.attrs.styleName) {
      node.attrs.styleName = RESERVED_STYLE_NONE;
    }
    //ToDo: Need to handle indent override
    node.attrs.indent = null;
  }
}
