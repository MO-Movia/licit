/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */
import { Plugin, PluginKey } from 'prosemirror-state';
import {
  MARK_EM,
  MARK_FONT_SIZE,
  MARK_FONT_TYPE,
  MARK_LETTER_SPACING,
  MARK_STRONG,
  MARK_TEXT_COLOR,
  MARK_UNDERLINE,
} from './MarkNames.js';
const TABLE_CELL_STYLE_INHERITANCE_META = 'tableCellStyleInheritance';
const TABLE_CELL_STYLE_INHERITANCE_KEY = new PluginKey(
  'tableCellStyleInheritance'
);
function normalizeString(value) {
  return typeof value === 'string' && value.trim().length ? value.trim() : null;
}
function normalizeLineSpacing(value) {
  const normalized = normalizeString(value);
  if (!normalized || normalized.toLowerCase() === 'normal') {
    return null;
  }
  return normalized;
}
function normalizeFontPointSize(value) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }
  const parsed = Number.parseFloat(normalized.replace(/px|pt/i, ''));
  return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
}
function isTableCell(node) {
  return (
    node.type.spec.tableRole === 'cell' ||
    node.type.spec.tableRole === 'header_cell' ||
    node.type.name === 'table_cell' ||
    node.type.name === 'table_header'
  );
}
function hasTruthyCellAttr(cellAttrs, attrName) {
  return cellAttrs[attrName] === true || cellAttrs[attrName] === 'true';
}
function ensureParagraphAttrs(tr, node, pos, cellAttrs) {
  if (node.type.name !== 'paragraph') {
    return tr;
  }
  const attrs = { ...node.attrs };
  let changed = false;
  const textAlign = hasTruthyCellAttr(cellAttrs, 'textAlignOverridden')
    ? normalizeString(cellAttrs.textAlign)
    : null;
  const lineSpacing = hasTruthyCellAttr(cellAttrs, 'lineHeightOverridden')
    ? normalizeLineSpacing(cellAttrs.lineHeight)
    : null;
  if (
    textAlign &&
    Object.prototype.hasOwnProperty.call(attrs, 'align') &&
    (attrs.align !== textAlign ||
      attrs.overriddenAlign !== true ||
      attrs.overriddenAlignValue !== textAlign)
  ) {
    attrs.align = textAlign;
    attrs.overriddenAlign = true;
    attrs.overriddenAlignValue = textAlign;
    changed = true;
  }
  if (
    lineSpacing &&
    Object.prototype.hasOwnProperty.call(attrs, 'lineSpacing') &&
    (attrs.lineSpacing !== lineSpacing ||
      attrs.overriddenLineSpacing !== true ||
      attrs.overriddenLineSpacingValue !== lineSpacing)
  ) {
    attrs.lineSpacing = lineSpacing;
    attrs.overriddenLineSpacing = true;
    attrs.overriddenLineSpacingValue = lineSpacing;
    changed = true;
  }
  return changed ? tr.setNodeMarkup(pos, undefined, attrs) : tr;
}
function markAttrsMatch(node, markType, attrs) {
  const existing = markType.isInSet(node.marks);
  return Boolean(
    existing &&
    Object.entries(attrs).every(([key, value]) => existing.attrs[key] === value)
  );
}
function ensureMark(tr, node, from, markType, attrs, removeWhenNull = false) {
  if (!markType) {
    return tr;
  }
  const to = from + node.nodeSize;
  if (!attrs) {
    return removeWhenNull && markType.isInSet(node.marks)
      ? tr.removeMark(from, to, markType)
      : tr;
  }
  if (markAttrsMatch(node, markType, attrs)) {
    return tr;
  }
  return tr
    .removeMark(from, to, markType)
    .addMark(from, to, markType.create(attrs));
}
function ensureTextMarks(tr, node, pos, schema, cellAttrs) {
  if (!node.isText) {
    return tr;
  }
  const fontName = hasTruthyCellAttr(cellAttrs, 'fontNameOverridden')
    ? normalizeString(cellAttrs.fontName)
    : null;
  const fontSize = hasTruthyCellAttr(cellAttrs, 'fontSizeOverridden')
    ? normalizeFontPointSize(cellAttrs.fontSize)
    : null;
  const textColor = hasTruthyCellAttr(cellAttrs, 'textColorOverridden')
    ? normalizeString(cellAttrs.textColor)
    : null;
  const letterSpacing = hasTruthyCellAttr(cellAttrs, 'letterSpacingOverridden')
    ? normalizeString(cellAttrs.letterSpacing)
    : null;
  const overridesBold = hasTruthyCellAttr(cellAttrs, 'fontWeightOverridden');
  const fontWeight = normalizeString(cellAttrs.fontWeight)?.toLowerCase();
  const bold =
    fontWeight === 'bold' ||
    fontWeight === 'bolder' ||
    Number.parseInt(fontWeight || '', 10) >= 600;
  const overridesItalic = hasTruthyCellAttr(cellAttrs, 'fontStyleOverridden');
  const fontStyle = normalizeString(cellAttrs.fontStyle)?.toLowerCase();
  const italic = fontStyle === 'italic' || fontStyle === 'oblique';
  const overridesUnderline = hasTruthyCellAttr(
    cellAttrs,
    'textDecorationOverridden'
  );
  const underline = Boolean(
    normalizeString(cellAttrs.textDecoration)
      ?.toLowerCase()
      .includes('underline')
  );
  tr = ensureMark(
    tr,
    node,
    pos,
    schema.marks[MARK_FONT_TYPE],
    fontName ? { name: fontName, overridden: true } : null
  );
  tr = ensureMark(
    tr,
    node,
    pos,
    schema.marks[MARK_FONT_SIZE],
    fontSize ? { pt: fontSize, overridden: true } : null
  );
  tr = ensureMark(
    tr,
    node,
    pos,
    schema.marks[MARK_TEXT_COLOR],
    textColor ? { color: textColor, overridden: true } : null
  );
  tr = ensureMark(
    tr,
    node,
    pos,
    schema.marks[MARK_LETTER_SPACING],
    letterSpacing ? { letterSpacing, overridden: true } : null
  );
  tr = ensureMark(
    tr,
    node,
    pos,
    schema.marks[MARK_STRONG],
    overridesBold && bold ? { overridden: true } : null,
    overridesBold
  );
  tr = ensureMark(
    tr,
    node,
    pos,
    schema.marks[MARK_EM],
    overridesItalic && italic ? { overridden: true } : null,
    overridesItalic
  );
  return ensureMark(
    tr,
    node,
    pos,
    schema.marks[MARK_UNDERLINE],
    overridesUnderline && underline ? { overridden: true } : null,
    overridesUnderline
  );
}
function applyCellInheritance(tr, node, pos, schema, cellAttrs) {
  const activeCellAttrs = isTableCell(node) ? node.attrs : cellAttrs;
  if (activeCellAttrs) {
    tr = ensureParagraphAttrs(tr, node, pos, activeCellAttrs);
    tr = ensureTextMarks(tr, node, pos, schema, activeCellAttrs);
  }
  node.forEach((child, offset) => {
    tr = applyCellInheritance(
      tr,
      child,
      pos + offset + 1,
      schema,
      activeCellAttrs
    );
  });
  return tr;
}
export default class TableCellStyleInheritancePlugin extends Plugin {
  constructor() {
    super({
      key: TABLE_CELL_STYLE_INHERITANCE_KEY,
      appendTransaction: (transactions, _oldState, newState) => {
        if (
          !transactions.some((tr) => tr.docChanged) ||
          transactions.some((tr) =>
            tr.getMeta(TABLE_CELL_STYLE_INHERITANCE_META)
          )
        ) {
          return null;
        }
        const tr = applyCellInheritance(
          newState.tr,
          newState.doc,
          -1,
          newState.schema,
          null
        );
        if (!tr.docChanged) {
          return null;
        }
        tr.setMeta(TABLE_CELL_STYLE_INHERITANCE_META, true);
        return tr;
      },
    });
  }
}
export { TABLE_CELL_STYLE_INHERITANCE_KEY, TABLE_CELL_STYLE_INHERITANCE_META };
