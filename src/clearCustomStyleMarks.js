// @flow

import { Schema } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import * as MarkNames from './MarkNames';
import { setTextAlign } from './TextAlignCommand';

const {
  MARK_EM,
  MARK_FONT_SIZE,
  MARK_FONT_TYPE,
  MARK_STRIKE,
  MARK_STRONG,
  MARK_TEXT_COLOR,
  MARK_TEXT_HIGHLIGHT,
  MARK_UNDERLINE,
} = MarkNames;

const FORMAT_MARK_NAMES = [
  MARK_EM,
  MARK_FONT_SIZE,
  MARK_FONT_TYPE,
  MARK_STRIKE,
  MARK_STRONG,
  MARK_TEXT_COLOR,
  MARK_TEXT_HIGHLIGHT,
  MARK_UNDERLINE,
];

// [FS] IRAD-1053 2020-10-08
// to clear the custom styles in the selected paragrapgh
export function clearCustomStyleMarks(tr: Transform, schema: Schema): Transform {
  const { doc, selection } = tr;
  if (!selection || !doc) {
    return tr;
  }
  let { from, to } = selection;
  const { empty } = selection;
  if (empty) {
    // [FS] IRAD-1053 2020-10-09
    // to get the start and end position of a paragrapgh
    from = selection.$from.before(1);
    to = selection.$to.after(1);
  }

  const markTypesToRemove = new Set(
    FORMAT_MARK_NAMES.map(n => schema.marks[n]).filter(Boolean)
  );

  if (!markTypesToRemove.size) {
    return tr;
  }

  const tasks = [];
  const textAlignNode = [];
  doc.nodesBetween(from, to, (node, pos) => {
    if (node.content && node.content.content && node.content.content.length) {
      if (node.content && node.content.content && node.content.content[0].marks && node.content.content[0].marks.length) {
        node.content.content[0].marks.some(mark => {
          if (markTypesToRemove.has(mark.type)) {
            tasks.push({ node, pos, mark });
          }
        });
        return true;
      }
      // [FS] IRAD-1053 2020-10-21
      // Clear Style not removes the text align styles 
      else{
        textAlignNode.push({ node, pos});
      }
    }
    return true;
  });
  if (!tasks.length) {
  // [FS] IRAD-1053 2020-10-21
  // Clear Style not removes the text align styles 
    textAlignNode.forEach(eachnode => {
      const { node } = eachnode;
      node.attrs.styleName = 'None';
    });
    tr = setTextAlign(tr, schema, null); 
    return tr;
  }

  tasks.forEach(job => {
    const { node, mark, pos } = job;
    tr = tr.removeMark(pos, pos + node.nodeSize, mark.type);
    // reset the custom style name to NONE after remove the styles
    node.attrs.styleName = 'None';
  });

  tr = setTextAlign(tr, schema, null);
  return tr;
}
