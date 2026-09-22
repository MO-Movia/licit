// @flow

import { Mark } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';

import { PARAGRAPH } from './NodeNames.js';

export default function TablePendingStyleMarksPlugin(): Plugin {
  return new Plugin({
    appendTransaction(transactions, _oldState, newState) {
      if (!transactions.some((tr) => tr.docChanged)) {
        return null;
      }

      const tr = newState.tr;
      let changed = false;

      newState.doc.descendants((node, pos) => {
        if (
          node.type.name !== PARAGRAPH ||
          !Array.isArray(node.attrs.tableStyleMarks) ||
          !node.attrs.tableStyleMarks.length ||
          !node.content.size
        ) {
          return true;
        }

        const marks = node.attrs.tableStyleMarks
          .map((markJSON) => {
            try {
              return Mark.fromJSON(newState.schema, markJSON);
            } catch {
              return null;
            }
          })
          .filter(Boolean);

        marks.forEach((mark) => {
          tr.addMark(pos + 1, pos + 1 + node.content.size, mark);
        });

        tr.setNodeMarkup(pos, null, {
          ...node.attrs,
          tableStyleMarks: null,
        });
        changed = true;
        return true;
      });

      return changed ? tr : null;
    },
  });
}
