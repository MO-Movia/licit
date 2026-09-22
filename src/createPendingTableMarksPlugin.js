// @flow

import { Plugin, PluginKey } from 'prosemirror-state';

export const PENDING_TABLE_MARKS_ATTRIBUTE = 'pendingMarks';

function deserializeMarks(state, value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const marks = [];
  value.forEach((json) => {
    try {
      marks.push(state.schema.markFromJSON(json));
    } catch {
      // Ignore marks written by a schema that is not installed in this host.
    }
  });
  return marks;
}

function sameMarks(left, right) {
  if (left?.length !== right.length) {
    return false;
  }
  return right.every((mark) => left.some((candidate) => candidate.eq(mark)));
}

function findPendingParagraph(state) {
  if (!state.selection.empty) {
    return null;
  }
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name !== 'paragraph') {
      continue;
    }
    if (node.content.size) {
      return null;
    }
    const marks = deserializeMarks(
      state,
      node.attrs[PENDING_TABLE_MARKS_ATTRIBUTE]
    );
    return marks.length ? { marks, node, pos: $from.before(depth) } : null;
  }
  return null;
}

function applyPendingMarks(state, tr) {
  const updates = [];
  tr.doc.descendants((node, pos) => {
    const pending = node.attrs?.[PENDING_TABLE_MARKS_ATTRIBUTE];
    if (node.type.name === 'paragraph' && node.content.size && pending) {
      updates.push({
        marks: deserializeMarks(state, pending),
        node,
        pos,
      });
    }
    return true;
  });

  updates.forEach(({ marks, node, pos }) => {
    const from = pos + 1;
    const to = from + node.content.size;
    marks.forEach((mark) => {
      tr = tr.addMark(from, to, mark);
    });
    const current = tr.doc.nodeAt(pos) || node;
    tr = tr.setNodeMarkup(pos, undefined, {
      ...current.attrs,
      [PENDING_TABLE_MARKS_ATTRIBUTE]: null,
    });
  });
  return tr;
}

export default function createPendingTableMarksPlugin() {
  return new Plugin({
    key: new PluginKey('pendingTableMarksPlugin'),
    appendTransaction(transactions, _oldState, newState) {
      let tr = newState.tr;
      if (transactions.some((transaction) => transaction.docChanged)) {
        tr = applyPendingMarks(newState, tr);
      }
      const pending = findPendingParagraph(newState);
      if (pending && !sameMarks(newState.storedMarks, pending.marks)) {
        tr = tr.setStoredMarks(pending.marks);
      }
      return tr.docChanged || tr.storedMarksSet ? tr : null;
    },
  });
}
