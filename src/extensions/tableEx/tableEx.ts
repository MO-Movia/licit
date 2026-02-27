/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {findParentNodeClosestToPos, mergeAttributes} from '@tiptap/core';
import Table, {createColGroup, createTable} from '@tiptap/extension-table';
import {DOMOutputSpec, Node as ProseMirrorNode} from 'prosemirror-model';
import {findParentNodeClosestToPos} from '@tiptap/core';
import {Table,createTable} from '@tiptap/extension-table';
import {TextSelection} from 'prosemirror-state';

const DEFAULT_TABLE_COLUMNS = 3;
const DEFAULT_TABLE_HEIGHT = 'auto';

const normalizePositiveInteger = (value: unknown, fallback: number): number => {
  const parsedValue = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return fallback;
  }
  return parsedValue;
};

const normalizeCssSize = (value: unknown, fallback: string): string => {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return `${value}px`;
  }

  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return `${trimmed}px`;
  }

  return trimmed;
};

const getColumnsFromDOM = (element: HTMLElement): number => {
  const firstRow = element.querySelector('tr');
  if (!firstRow) {
    return DEFAULT_TABLE_COLUMNS;
  }

  let colCount = 0;
  Array.from(firstRow.children).forEach((cell) => {
    const colspan = normalizePositiveInteger(
      (cell as HTMLElement).getAttribute('colspan'),
      1
    );
    colCount += colspan;
  });

  return colCount > 0 ? colCount : DEFAULT_TABLE_COLUMNS;
};

const getColumnsFromNode = (node: ProseMirrorNode): number => {
  const firstRow = node.firstChild;
  if (!firstRow) {
    return DEFAULT_TABLE_COLUMNS;
  }

  let colCount = 0;
  for (let i = 0; i < firstRow.childCount; i += 1) {
    colCount += normalizePositiveInteger(firstRow.child(i).attrs.colspan, 1);
  }

  return colCount > 0 ? colCount : DEFAULT_TABLE_COLUMNS;
};

export const TableEx = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      noOfColumns: {
        default: DEFAULT_TABLE_COLUMNS,
        parseHTML: (element) => {
          const attr = element.getAttribute('noOfColumns') ??
            element.getAttribute('data-no-of-columns') ??
            element.getAttribute('no.of.columns');

          if (attr) {
            return normalizePositiveInteger(attr, DEFAULT_TABLE_COLUMNS);
          }

          return getColumnsFromDOM(element as HTMLElement);
        },
        renderHTML: (attributes) => {
          const noOfColumns = normalizePositiveInteger(
            attributes.noOfColumns,
            DEFAULT_TABLE_COLUMNS
          );
          return {
            noOfColumns,
            'data-no-of-columns': noOfColumns,
          };
        },
      },
      tableHeight: {
        default: DEFAULT_TABLE_HEIGHT,
        parseHTML: (element) => {
          return normalizeCssSize(
            element.getAttribute('tableHeight') ?? element.style.height,
            DEFAULT_TABLE_HEIGHT
          );
        },
        renderHTML: (attributes) => {
          const tableHeight = normalizeCssSize(
            attributes.tableHeight,
            DEFAULT_TABLE_HEIGHT
          );
          return {
            tableHeight,
          };
        },
      },
    };
  },

  renderHTML({node, HTMLAttributes}) {
    const {colgroup, tableWidth} = createColGroup(node, this.options.cellMinWidth);
    const noOfColumns = normalizePositiveInteger(
      node.attrs.noOfColumns,
      getColumnsFromNode(node)
    );
    const tableHeight = normalizeCssSize(
      node.attrs.tableHeight,
      DEFAULT_TABLE_HEIGHT
    );

    const style = tableWidth
      ? `width: ${tableWidth}; height: ${tableHeight};`
      : `min-width: ${noOfColumns * this.options.cellMinWidth}px; height: ${tableHeight};`;

    const table: DOMOutputSpec = [
      'table',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {style}),
      colgroup,
      ['tbody', 0],
    ];

    return this.options.renderWrapper ? ['div', {class: 'tableWrapper'}, table] : table;
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        const {state} = this.editor;
        const {selection} = state;

        const parentCell = findParentNodeClosestToPos(
          selection.$from,
          (node) =>
            node.type.spec.tableRole === 'cell' ||
            node.type.spec.tableRole === 'header_cell'
        );

        const cellNode = parentCell?.node;
        const moved = this.editor.commands.goToNextCell();
        if (moved) {
          return true;
        } else if (!moved && cellNode?.attrs?.vignette === false) {
          return this.editor.chain().addRowAfter().goToNextCell().run();
        }
      },
      'Shift-Tab': () => this.editor.commands.goToPreviousCell(),
    };
  },
  addCommands() {
    return {
      ...this.parent?.(),

      // override only insertTable to remove header row
      insertTable:
        ({rows = 3, cols = 3} = {}) =>
        ({tr, dispatch, editor}) => {
          const withHeaderRow = false;

          const rowCount = normalizePositiveInteger(rows, 3);
          const colCount = normalizePositiveInteger(cols, 3);
          const node = createTable(editor.schema, rowCount, colCount, withHeaderRow);
          const nodeWithAttributes = node.type.createChecked(
            {
              ...node.attrs,
              noOfColumns: colCount,
              tableHeight: normalizeCssSize(
                node.attrs.tableHeight,
                DEFAULT_TABLE_HEIGHT
              ),
            },
            node.content,
            node.marks
          );

          if (dispatch) {
            const offset = tr.selection.from + 1;

            tr.replaceSelectionWith(nodeWithAttributes)
              .scrollIntoView()
              .setSelection(TextSelection.near(tr.doc.resolve(offset)));
          }

          return true;
        },
    };
  },
});
