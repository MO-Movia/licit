// @flow

import {Schema} from 'prosemirror-model';
import {Transform} from 'prosemirror-transform';
import {HEADING, PARAGRAPH} from './NodeNames';
import * as MarkNames from './MarkNames';
import {setTextAlign} from './TextAlignCommand';
import {setTextLineSpacing} from './TextLineSpacingCommand';

const {
  MARK_EM,
  MARK_FONT_SIZE,
  MARK_FONT_TYPE,
  MARK_STRIKE,
  MARK_STRONG,
  MARK_TEXT_COLOR,
  MARK_TEXT_HIGHLIGHT,
  MARK_UNDERLINE,
  MARK_CUSTOMSTYLES,
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
  // [FS] IRAD-1042 2020-09-18
  // Fix: To clear custom style format.
  MARK_CUSTOMSTYLES,
];

// [FS] IRAD-1053 2020-11-13
// Clear format not removes the line spacing
function removeTextAlignAndLineSpacing(
  tr: Transform,
  schema: Schema
): Transform {
  // to clear the text align format.
  tr = setTextAlign(tr, schema, null);
  // to clear the applied line spacing format.
  tr = setTextLineSpacing(tr, schema, null);
  return tr;
}

export function clearMarks(tr: Transform, schema: Schema): Transform {
  const {doc, selection} = tr;
  if (!selection || !doc) {
    return tr;
  }
  const {from, to, empty} = selection;
  if (empty) {
    return tr;
  }

  const markTypesToRemove = new Set(
    FORMAT_MARK_NAMES.map((n) => schema.marks[n]).filter(Boolean)
  );

  if (!markTypesToRemove.size) {
    return tr;
  }

  const tasks = [];
  doc.nodesBetween(from, to, (node, pos) => {
    if (node.marks && node.marks.length) {
      node.marks.some((mark) => {
        if (markTypesToRemove.has(mark.type)) {
          tasks.push({node, pos, mark});
        }
      });
      return true;
    }
    return true;
  });
  if (!tasks.length) {
    // It should clear text alignment and line spacing.
    tr = removeTextAlignAndLineSpacing(tr, schema);
    return tr;
  }

  tasks.forEach((job) => {
    const {mark} = job;
    // [FS] IRAD-1043 2020-10-27
    // Issue fix on when clear the format of a selected word, the entire paragrapghs style removed
    tr = tr.removeMark(from, to, mark.type);
  });

  // It should clear text alignment and line spacing.
  tr = removeTextAlignAndLineSpacing(tr, schema);
  return tr;
}

// [FS] IRAD-948 2020-05-22
// Clear Header formatting
export function clearHeading(tr: Transform, schema: Schema) {
  const {doc, selection} = tr;

  if (!selection || !doc) {
    return tr;
  }
  const {from, to, empty} = selection;
  if (empty) {
    return tr;
  }
  const {nodes} = schema;

  const heading = nodes[HEADING];
  const paragraph = nodes[PARAGRAPH];

  const tasks = [];

  doc.nodesBetween(from, to, (node, pos) => {
    if (heading === node.type) {
      tasks.push({node, pos});
    }
    return true;
  });

  if (!tasks.length) {
    return tr;
  }

  tasks.forEach((job) => {
    const {node, pos} = job;
    tr = tr.setNodeMarkup(pos, paragraph, node.attrs, node.marks);
  });
  return tr;
}
