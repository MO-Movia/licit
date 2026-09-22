// @flow

import { TableMap } from 'prosemirror-tables';
import { PENDING_TABLE_MARKS_ATTRIBUTE } from './createPendingTableMarksPlugin.js';

const FORMAT_MARK_NAMES = new Set([
  'em',
  'mark-font-size',
  'mark-font-type',
  'mark-letter-spacing',
  'mark-text-color',
  'mark-text-highlight',
  'override',
  'strike',
  'strong',
  'sub',
  'super',
  'underline',
]);

const CELL_STYLE_ATTRS = [
  'background',
  'backgroundColor',
  'backgroundColorOverridden',
  'borderBottom',
  'borderBottomColor',
  'borderBottomStyle',
  'borderBottomWidth',
  'borderColor',
  'borderLeft',
  'borderLeftColor',
  'borderLeftStyle',
  'borderLeftWidth',
  'borderRight',
  'borderRightColor',
  'borderRightStyle',
  'borderRightWidth',
  'borderTop',
  'borderTopColor',
  'borderTopStyle',
  'borderTopWidth',
  'borderWidth',
  'cellStyle',
  'fontName',
  'fontNameOverridden',
  'fontSize',
  'fontSizeOverridden',
  'fontStyle',
  'fontStyleOverridden',
  'fontWeight',
  'fontWeightOverridden',
  'letterSpacing',
  'letterSpacingOverridden',
  'lineHeight',
  'lineHeightOverridden',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'textAlign',
  'textAlignOverridden',
  'textColor',
  'textColorOverridden',
  'textDecoration',
  'textDecorationOverridden',
  'vAlign',
  'verticalAlign',
  'verticalAlignOverridden',
];

const DIRECT_PARAGRAPH_ATTRS = [
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
];

const OVERRIDDEN_PARAGRAPH_ATTRS = [
  ['overriddenAlign', 'overriddenAlignValue', 'align'],
  ['overriddenIndent', 'overriddenIndentValue', 'indent'],
  ['overriddenLineSpacing', 'overriddenLineSpacingValue', 'lineSpacing'],
];

function hasValue(value) {
  return value !== null && value !== undefined && value !== '';
}

function findParentPosition($pos, role) {
  for (let depth = $pos.depth; depth > 0; depth--) {
    if ($pos.node(depth).type.spec.tableRole === role) {
      return $pos.before(depth);
    }
  }
  return null;
}

function getTableContext(state) {
  const tablePos = findParentPosition(state.selection.$from, 'table');
  if (tablePos === null) {
    return null;
  }
  const table = state.doc.nodeAt(tablePos);
  if (!table) {
    return null;
  }
  const tableStart = tablePos + 1;
  const anchorPos =
    state.selection.$anchorCell?.pos ??
    findParentPosition(state.selection.$from, 'cell') ??
    findParentPosition(state.selection.$from, 'header_cell');
  const headPos =
    state.selection.$headCell?.pos ??
    findParentPosition(state.selection.$to, 'cell') ??
    findParentPosition(state.selection.$to, 'header_cell') ??
    anchorPos;
  if (anchorPos === null || headPos === null) {
    return null;
  }
  const map = TableMap.get(table);
  return {
    map,
    rect: map.rectBetween(anchorPos - tableStart, headPos - tableStart),
    table,
    tablePos,
  };
}

function getCellPos(tablePos, table, map, row, column) {
  if (row < 0 || row >= map.height || column < 0 || column >= map.width) {
    return null;
  }
  return tablePos + 1 + map.positionAt(row, column, table);
}

function getParagraphAttrs(node) {
  const attrs = {};
  OVERRIDDEN_PARAGRAPH_ATTRS.forEach(([flag, value, attr]) => {
    if (hasValue(node.attrs[flag]) || hasValue(node.attrs[value])) {
      attrs[flag] = node.attrs[flag];
      attrs[value] = node.attrs[value];
      attrs[attr] = node.attrs[attr];
    }
  });
  DIRECT_PARAGRAPH_ATTRS.forEach((attr) => {
    if (hasValue(node.attrs[attr])) {
      attrs[attr] = node.attrs[attr];
    }
  });
  return attrs;
}

function getParagraphMarks(node) {
  const textNodes = [];
  node.descendants((child) => {
    if (child.isText && child.text?.length) {
      textNodes.push(child);
    }
    return true;
  });
  if (!textNodes.length) {
    return [];
  }
  return textNodes[0].marks.filter(
    (mark) =>
      FORMAT_MARK_NAMES.has(mark.type.name) &&
      (mark.type.name === 'override' || mark.attrs?.overridden === true) &&
      textNodes.every((textNode) =>
        textNode.marks.some((candidate) => candidate.eq(mark))
      )
  );
}

function snapshotCell(cell) {
  const attrs = {};
  CELL_STYLE_ATTRS.forEach((attr) => {
    if (Object.prototype.hasOwnProperty.call(cell.attrs, attr)) {
      attrs[attr] = cell.attrs[attr];
    }
  });
  const paragraphs = [];
  cell.descendants((node) => {
    if (node.type.name === 'paragraph') {
      paragraphs.push({
        attrs: getParagraphAttrs(node),
        marks: getParagraphMarks(node).map((mark) => mark.toJSON()),
      });
    }
    return true;
  });
  return { attrs, paragraphs };
}

function snapshotOperation(state, operation) {
  const context = getTableContext(state);
  if (!context) {
    return null;
  }
  const { map, rect, table, tablePos } = context;
  const snapshots = [];
  const seen = new Set();
  const isRow = operation.startsWith('addRow');
  const sourceIndex = isRow
    ? operation === 'addRowAfter'
      ? rect.bottom - 1
      : rect.top
    : operation === 'addColumnAfter'
      ? rect.right - 1
      : rect.left;
  const targetIndex = isRow
    ? operation === 'addRowAfter'
      ? rect.bottom
      : rect.top
    : operation === 'addColumnAfter'
      ? rect.right
      : rect.left;
  const count = isRow ? map.width : map.height;
  for (let index = 0; index < count; index++) {
    const row = isRow ? sourceIndex : index;
    const column = isRow ? index : sourceIndex;
    const pos = getCellPos(tablePos, table, map, row, column);
    if (pos === null || seen.has(pos)) {
      continue;
    }
    const cell = state.doc.nodeAt(pos);
    if (!cell) {
      continue;
    }
    snapshots.push({ index, snapshot: snapshotCell(cell) });
    seen.add(pos);
  }
  let sourceRowAttrs = null;
  if (isRow && snapshots.length) {
    const sourceCellPos = getCellPos(tablePos, table, map, sourceIndex, 0);
    if (sourceCellPos !== null) {
      const $cell = state.doc.resolve(sourceCellPos);
      for (let depth = $cell.depth; depth > 0; depth--) {
        if ($cell.node(depth).type.spec.tableRole === 'row') {
          sourceRowAttrs = { ...$cell.node(depth).attrs };
          break;
        }
      }
    }
  }
  return { isRow, snapshots, sourceRowAttrs, tablePos, targetIndex };
}

function findParagraphs(cell, cellPos) {
  const paragraphs = [];
  cell.descendants((node, pos) => {
    if (node.type.name === 'paragraph') {
      paragraphs.push({ node, pos: cellPos + 1 + pos });
    }
    return true;
  });
  return paragraphs;
}

function applyParagraphSnapshot(tr, target, snapshot) {
  const attrs = { ...target.node.attrs, ...snapshot.attrs };
  if (snapshot.marks.length && !target.node.content.size) {
    attrs[PENDING_TABLE_MARKS_ATTRIBUTE] = snapshot.marks;
  }
  if (Object.keys(snapshot.attrs).length || snapshot.marks.length) {
    tr = tr.setNodeMarkup(target.pos, undefined, attrs);
  }
  const paragraph = tr.doc.nodeAt(target.pos);
  if (paragraph?.content.size && snapshot.marks.length) {
    const from = target.pos + 1;
    const to = from + paragraph.content.size;
    snapshot.marks.forEach((json) => {
      try {
        tr = tr.addMark(from, to, tr.doc.type.schema.markFromJSON(json));
      } catch {
        // Ignore stale marks not installed in this schema.
      }
    });
  }
  return tr;
}

function applySnapshot(tr, operationSnapshot) {
  if (!operationSnapshot) {
    return tr;
  }
  const table = tr.doc.nodeAt(operationSnapshot.tablePos);
  if (!table) {
    return tr;
  }
  const map = TableMap.get(table);
  const seen = new Set();
  operationSnapshot.snapshots.forEach(({ index, snapshot }) => {
    const row = operationSnapshot.isRow ? operationSnapshot.targetIndex : index;
    const column = operationSnapshot.isRow
      ? index
      : operationSnapshot.targetIndex;
    const cellPos = getCellPos(
      operationSnapshot.tablePos,
      table,
      map,
      row,
      column
    );
    if (cellPos === null || seen.has(cellPos)) {
      return;
    }
    const cell = tr.doc.nodeAt(cellPos);
    if (!cell) {
      return;
    }
    tr = tr.setNodeMarkup(cellPos, undefined, {
      ...cell.attrs,
      ...snapshot.attrs,
    });
    const updatedCell = tr.doc.nodeAt(cellPos) || cell;
    const paragraphs = findParagraphs(updatedCell, cellPos);
    paragraphs.forEach((paragraph, paragraphIndex) => {
      if (snapshot.paragraphs[paragraphIndex]) {
        tr = applyParagraphSnapshot(
          tr,
          paragraph,
          snapshot.paragraphs[paragraphIndex]
        );
      }
    });
    seen.add(cellPos);
  });

  if (operationSnapshot.isRow && operationSnapshot.sourceRowAttrs) {
    const targetCellPos = getCellPos(
      operationSnapshot.tablePos,
      table,
      map,
      operationSnapshot.targetIndex,
      0
    );
    if (targetCellPos !== null) {
      const $cell = tr.doc.resolve(targetCellPos);
      for (let depth = $cell.depth; depth > 0; depth--) {
        if ($cell.node(depth).type.spec.tableRole === 'row') {
          tr = tr.setNodeMarkup($cell.before(depth), undefined, {
            ...$cell.node(depth).attrs,
            ...operationSnapshot.sourceRowAttrs,
          });
          break;
        }
      }
    }
  }
  return tr;
}

export default function preserveTableProperties(command, operation) {
  return (state, dispatch, view) => {
    if (!dispatch) {
      return command(state, undefined, view);
    }
    const snapshot = snapshotOperation(state, operation);
    return command(state, (tr) => dispatch(applySnapshot(tr, snapshot)), view);
  };
}
