// @flow

import { Mark, Node } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { TableMap, selectedRect } from 'prosemirror-tables';

import { PARAGRAPH } from './NodeNames.js';
import {
  MARK_LINK,
  MARK_SPACER,
  MARK_TEXT_SELECTION,
} from './MarkNames.js';

type TableCommand = (
  state: EditorState,
  dispatch?: ?(tr: Transform) => void,
  view?: ?EditorView
) => boolean;

type InsertKind = 'column' | 'row';
type InsertSide = 'before' | 'after';

const PARAGRAPH_ATTRS_TO_COPY = [
  'align',
  'lineSpacing',
  'indent',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'reset',
  'overriddenAlign',
  'overriddenAlignValue',
  'overriddenLineSpacing',
  'overriddenLineSpacingValue',
  'overriddenIndent',
  'overriddenIndentValue',
  'hangingIndent',
  'indentPosition',
];

const OVERRIDE_ATTRS = new Set([
  'overriddenAlign',
  'overriddenAlignValue',
  'overriddenLineSpacing',
  'overriddenLineSpacingValue',
  'overriddenIndent',
  'overriddenIndentValue',
]);

const NON_FORMATTING_MARKS = new Set([
  MARK_LINK,
  MARK_SPACER,
  MARK_TEXT_SELECTION,
]);

export default class TableInsertPreserveStyleCommand extends UICommand {
  _insertKind: InsertKind;
  _insertSide: InsertSide;
  _tableCommand: TableCommand;

  constructor(
    tableCommand: TableCommand,
    insertKind: InsertKind,
    insertSide: InsertSide
  ) {
    super();
    this._tableCommand = tableCommand;
    this._insertKind = insertKind;
    this._insertSide = insertSide;
  }

  isEnabled = (state: EditorState): boolean => {
    return this._tableCommand(state);
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    if (!dispatch) {
      return this._tableCommand(state, null, view);
    }

    let rect = null;
    try {
      rect = selectedRect(state);
    } catch {
      return this._tableCommand(state, dispatch, view);
    }

    return this._tableCommand(
      state,
      (tr) => {
        dispatch(
          preserveInsertedTableStyles(
            tr,
            rect,
            this._insertKind,
            this._insertSide
          )
        );
      },
      view
    );
  };

  waitForUserInput = (): Promise<undefined> => {
    return Promise.resolve(undefined);
  };

  executeWithUserInput = (): boolean => {
    return false;
  };

  cancel(): void {
    return null;
  }
}

export function preserveInsertedTableStyles(
  tr: Transform,
  rect: Object,
  insertKind: InsertKind,
  insertSide: InsertSide
): Transform {
  const tablePos = rect.tableStart - 1;
  const table = tr.doc.nodeAt(tablePos);
  if (!table || table.type.spec.tableRole !== 'table') {
    return tr;
  }

  if (insertKind === 'row') {
    return preserveInsertedRowStyles(tr, rect, table, insertSide);
  }

  return preserveInsertedColumnStyles(tr, rect, table, insertSide);
}

function preserveInsertedRowStyles(
  tr: Transform,
  rect: Object,
  newTable: Node,
  insertSide: InsertSide
): Transform {
  const insertedRow = insertSide === 'before' ? rect.top : rect.bottom;
  const sourceRow = insertedRow - 1;
  if (sourceRow < 0) {
    return tr;
  }

  const sourceFormats = collectRowFormats(rect.table, rect.map, sourceRow);
  if (!sourceFormats.size) {
    return tr;
  }

  const newMap = TableMap.get(newTable);
  const seen = new Set();
  for (let col = 0; col < newMap.width; col++) {
    const cellPos = newMap.map[insertedRow * newMap.width + col];
    if (seen.has(cellPos)) {
      continue;
    }
    seen.add(cellPos);

    const cellRect = newMap.findCell(cellPos);
    if (cellRect.top !== insertedRow) {
      continue;
    }

    const format = sourceFormats.get(col);
    if (format) {
      applyCellParagraphFormat(tr, rect.tableStart + cellPos, format);
    }
  }

  return tr;
}

function preserveInsertedColumnStyles(
  tr: Transform,
  rect: Object,
  newTable: Node,
  insertSide: InsertSide
): Transform {
  const insertedCol = insertSide === 'before' ? rect.left : rect.right;
  const sourceCol = insertedCol - 1;
  if (sourceCol < 0) {
    return tr;
  }

  const sourceFormats = collectColumnFormats(rect.table, rect.map, sourceCol);
  if (!sourceFormats.size) {
    return tr;
  }

  const newMap = TableMap.get(newTable);
  const seen = new Set();
  for (let row = 0; row < newMap.height; row++) {
    const cellPos = newMap.map[row * newMap.width + insertedCol];
    if (seen.has(cellPos)) {
      continue;
    }
    seen.add(cellPos);

    const cellRect = newMap.findCell(cellPos);
    if (cellRect.left !== insertedCol) {
      continue;
    }

    const format = sourceFormats.get(row);
    if (format) {
      applyCellParagraphFormat(tr, rect.tableStart + cellPos, format);
    }
  }

  return tr;
}

function collectRowFormats(table: Node, map: TableMap, row: number): Map<number, Object> {
  const formats = new Map();
  for (let col = 0; col < map.width; col++) {
    const cell = table.nodeAt(map.map[row * map.width + col]);
    const format = cell && getCellWholeParagraphFormat(cell);
    if (format) {
      formats.set(col, format);
    }
  }
  return formats;
}

function collectColumnFormats(table: Node, map: TableMap, col: number): Map<number, Object> {
  const formats = new Map();
  for (let row = 0; row < map.height; row++) {
    const cell = table.nodeAt(map.map[row * map.width + col]);
    const format = cell && getCellWholeParagraphFormat(cell);
    if (format) {
      formats.set(row, format);
    }
  }
  return formats;
}

function getCellWholeParagraphFormat(cell: Node): ?Object {
  const paragraphFormats = [];
  cell.forEach((child) => {
    if (child.type.name === PARAGRAPH) {
      const format = getParagraphWholeOverrideFormat(child);
      if (format) {
        paragraphFormats.push(format);
      }
    }
  });

  if (!paragraphFormats.length) {
    return null;
  }

  const first = JSON.stringify(paragraphFormats[0]);
  const allParagraphsMatch = paragraphFormats.every(
    (format) => JSON.stringify(format) === first
  );
  return allParagraphsMatch ? paragraphFormats[0] : null;
}

function getParagraphWholeOverrideFormat(paragraph: Node): ?Object {
  const attrs = getCopyableParagraphAttrs(paragraph);
  const marks = getWholeParagraphMarks(paragraph);

  if (!Object.keys(attrs).length && !marks.length) {
    return null;
  }

  return {
    attrs,
    marks,
    tableStyleMarks: marks.map((mark) => mark.toJSON()),
  };
}

function getCopyableParagraphAttrs(paragraph: Node): Object {
  const attrs = {};
  PARAGRAPH_ATTRS_TO_COPY.forEach((name) => {
    const value = paragraph.attrs?.[name];
    if (value === null || value === undefined || value === '') {
      return;
    }

    if (OVERRIDE_ATTRS.has(name) || isExplicitParagraphAttr(name, value)) {
      attrs[name] = value;
    }
  });

  return attrs;
}

function isExplicitParagraphAttr(name: string, value: any): boolean {
  if (name === 'align') {
    return value !== 'left';
  }
  if (name === 'indent') {
    return value !== 0;
  }
  return true;
}

function getWholeParagraphMarks(paragraph: Node): Array<Mark> {
  let firstMarks = null;
  let hasInlineContent = false;
  let isUniform = true;

  paragraph.forEach((child) => {
    if (!child.isInline) {
      return;
    }

    const marks = getCopyableMarks(child.marks);
    if (!hasInlineContent) {
      firstMarks = marks;
      hasInlineContent = true;
      return;
    }

    if (!sameMarks(firstMarks || [], marks)) {
      isUniform = false;
    }
  });

  return hasInlineContent && isUniform ? firstMarks || [] : [];
}

function getCopyableMarks(marks: Array<Mark>): Array<Mark> {
  return marks
    .filter((mark) => {
      return !NON_FORMATTING_MARKS.has(mark.type.name);
    })
    .sort(compareMarks);
}

function compareMarks(a: Mark, b: Mark): number {
  return markKey(a) < markKey(b) ? -1 : markKey(a) > markKey(b) ? 1 : 0;
}

function sameMarks(a: Array<Mark>, b: Array<Mark>): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((mark, index) => mark.eq(b[index]));
}

function markKey(mark: Mark): string {
  return `${mark.type.name}:${JSON.stringify(mark.attrs || {})}`;
}

function applyCellParagraphFormat(
  tr: Transform,
  cellPos: number,
  format: Object
): void {
  const cell = tr.doc.nodeAt(cellPos);
  if (!cell) {
    return;
  }

  const paragraphOffset = findFirstParagraphOffset(cell);
  if (paragraphOffset === null) {
    return;
  }

  const paragraphPos = cellPos + 1 + paragraphOffset;
  const paragraph = tr.doc.nodeAt(paragraphPos);
  if (!paragraph || paragraph.type.name !== PARAGRAPH) {
    return;
  }

  tr.setNodeMarkup(paragraphPos, null, {
    ...paragraph.attrs,
    ...format.attrs,
    tableStyleMarks: format.tableStyleMarks?.length
      ? format.tableStyleMarks
      : paragraph.attrs.tableStyleMarks,
  });

  if (paragraph.content.size && format.marks.length) {
    format.marks.forEach((mark) => {
      tr.addMark(paragraphPos + 1, paragraphPos + 1 + paragraph.content.size, mark);
    });
  }
}

function findFirstParagraphOffset(cell: Node): ?number {
  let found = null;
  cell.forEach((child, offset) => {
    if (found === null && child.type.name === PARAGRAPH) {
      found = offset;
    }
  });
  return found;
}
