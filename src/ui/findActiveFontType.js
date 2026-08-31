/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */
import { MARK_FONT_TYPE } from '../MarkNames.js';
import findActiveMark from '../findActiveMark.js';
// This should map to `--czi-content-font-size` at `czi-editor.css`.
export const FONT_TYPE_NAME_DEFAULT = 'Arial';
function normalizeFontFamily(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }
  const quoted = /^(?:"([^"]+)"|'([^']+)')/.exec(normalized);
  return (quoted?.[1] ?? quoted?.[2] ?? normalized.split(',')[0])
    .trim()
    .replace(/^(?:"|')|(?:"|')$/g, '');
}
function getCellFontFamily(cell, markType) {
  const fallback = normalizeFontFamily(cell.attrs.fontName);
  const values = [];
  cell.descendants((node) => {
    if (!node.isText || !node.text?.trim()) {
      return true;
    }
    const mark = node.marks.find((candidate) => candidate.type === markType);
    values.push(normalizeFontFamily(mark?.attrs.name) ?? fallback ?? '');
    return false;
  });
  if (!values.length) {
    return fallback;
  }
  return values.every((value) => value === values[0])
    ? values[0] || null
    : 'Mixed';
}
function findSelectedCellFontFamily(state, markType) {
  const cells = [];
  const selection = state.selection;
  selection.forEachCell?.((node) => cells.push(node));
  if (!cells.length && selection.$anchorCell) {
    const node = state.doc.nodeAt(selection.$anchorCell.pos);
    if (node) {
      cells.push(node);
    }
  }
  if (!cells.length) {
    for (let depth = selection.$from.depth; depth > 0; depth--) {
      const node = selection.$from.node(depth);
      if (
        node.type.spec.tableRole === 'cell' ||
        node.type.spec.tableRole === 'header_cell'
      ) {
        cells.push(node);
        break;
      }
    }
  }
  const values = cells
    .map((cell) => getCellFontFamily(cell, markType))
    .filter((value) => value !== null);
  if (!values.length) {
    return null;
  }
  return values.every((value) => value === values[0]) ? values[0] : 'Mixed';
}
export default function findActiveFontType(state) {
  const { schema, doc, selection, tr } = state;
  const markType = schema.marks[MARK_FONT_TYPE];
  if (!markType) {
    return FONT_TYPE_NAME_DEFAULT;
  }
  const { from, to, empty } = selection;
  if (empty) {
    const storedMarks =
      tr.storedMarks || state.storedMarks || selection.$cursor?.marks?.() || [];
    const sm = storedMarks.find((m) => m.type === markType);
    return (
      normalizeFontFamily(sm?.attrs?.name) ??
      findSelectedCellFontFamily(state, markType) ??
      FONT_TYPE_NAME_DEFAULT
    );
  }
  const mark = findActiveMark(doc, from, to, markType);
  const fontName = mark?.attrs.name;
  return (
    normalizeFontFamily(fontName) ??
    findSelectedCellFontFamily(state, markType) ??
    FONT_TYPE_NAME_DEFAULT
  );
}
