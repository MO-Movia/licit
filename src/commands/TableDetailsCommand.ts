/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {Node as ProseMirrorNode, NodeType, Schema} from 'prosemirror-model';
import {EditorState, Selection, TextSelection, Transaction} from 'prosemirror-state';
import * as React from 'react';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import TableDetails, {TableDetailsInput} from '../ui/TableDetails';
import {findParentNodeOfType} from 'prosemirror-utils';
import {createPopUp} from '@modusoperandi/licit-ui-commands';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {TableMap} from 'prosemirror-tables';

type ParentNodeRef = {
  pos: number;
  start: number;
  node: ProseMirrorNode;
};

type TableDetailNodeRefs = {
  table: ParentNodeRef;
  row: ParentNodeRef | null;
  cell: ParentNodeRef | null;
};

class TableDetailsCommand extends UICommand {
  _popUp = null;

  execute = (
    state: EditorState,
    _dispatch: (tr: Transform) => void,
    view: EditorView
  ): boolean => {
    if (!view) {
      return false;
    }

    const {selection, schema} = state;
    const tableType = this.getNodeType(schema, ['table']);
    const rowType = this.getNodeType(schema, ['tableRow', 'table_row']);
    const cellTypes = this.getNodeTypes(schema, ['tableCell', 'table_cell']);

    const tableNode = this.getParentNodeRef(selection, tableType);
    if (!tableNode) {
      return false;
    }

    const rowNode = this.getParentNodeRef(selection, rowType);
    const cellNode = this.getParentNodeRefByTypes(selection, cellTypes);

    const tableDOM = this.findTableDOM(view, tableNode.start);
    if (!tableDOM) {
      return false;
    }

    const tableRect = tableDOM.getBoundingClientRect();
    const cellDOM = this.getSelectedCellDOM(view);
    const cellRect = cellDOM?.getBoundingClientRect();

    const viewProps = {
      close: () => {
        this._popUp?.close(undefined);
      },
      onApply: (inputs: TableDetailsInput) => {
        this.applyAttributeInputs(view, {
          table: tableNode,
          row: rowNode,
          cell: cellNode,
        }, inputs);
      },
      editorView: view,
      table: {
        width: Math.round(tableRect.width),
        height: Math.round(tableRect.height),
        noOfColumns: tableNode.node.attrs.noOfColumns ?? null,
        tableHeight: tableNode.node.attrs.tableHeight ?? null,
      },
      row: rowNode
        ? {
            rowHeight: rowNode.node.attrs.rowHeight ?? null,
            rowWidth: rowNode.node.attrs.rowWidth ?? null,
          }
        : null,
      cell: cellRect
        ? {
            width: Math.round(cellRect.width),
            height: Math.round(cellRect.height),
            cellWidth: cellNode?.node.attrs.cellWidth ?? null,
            cellStyle: cellNode?.node.attrs.cellStyle ?? null,
            fontSize: cellNode?.node.attrs.fontSize ?? null,
            letterSpacing: cellNode?.node.attrs.letterSpacing ?? null,
            marginTop: cellNode?.node.attrs.marginTop ?? null,
            MarginBottom: cellNode?.node.attrs.MarginBottom ?? null,
          }
        : null,
    };

    this._popUp = createPopUp(TableDetails, viewProps, {
      modal: true,
      onClose: () => {
        if (this._popUp) {
          this._popUp = null;
        }
      },
    });

    return true;
  };

  isActive = (_state: EditorState): boolean => {
    return false;
  };

  isEnabled = (state: EditorState): boolean => {
    const {$from} = state.selection;

    for (let depth = $from.depth; depth > 0; depth--) {
      if ($from.node(depth).type.name === 'table') {
        return true;
      }
    }

    return false;
  };

  executeCustom(
    _state: EditorState,
    tr: Transform,
    _from: number,
    _to: number
  ): Transform {
    return tr;
  }

  executeCustomStyleForTable(_state: EditorState, tr: Transform): Transform {
    return tr;
  }

  waitForUserInput = (
    _state: EditorState,
    _dispatch: (tr: Transform) => void,
    _view: EditorView,
    _event: React.SyntheticEvent
  ): Promise<undefined> => {
    return Promise.resolve(undefined);
  };

  executeWithUserInput = (
    _state: EditorState,
    _dispatch: (tr: Transform) => void,
    _view: EditorView,
    _inputs: string
  ): boolean => {
    return false;
  };

  findTableDOM(view: EditorView, pos: number): HTMLElement | null {
    const dom = view.domAtPos(pos);

    if (dom.node instanceof HTMLElement) {
      return dom.node.closest('table');
    }

    return null;
  }

  getSelectedCellDOM(view: EditorView): HTMLElement | null {
    const {selection} = view.state;

    if (!(selection instanceof TextSelection)) {
      return null;
    }

    const {node} = view.domAtPos(selection.from);

    let element: HTMLElement | null = null;

    if (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        element = node.parentElement;
      } else if (node instanceof HTMLElement) {
        element = node;
      }
    }

    if (!element) {
      return null;
    }

    return element.closest('td, th');
  }

  getNodeType(schema: Schema, names: string[]): NodeType | null {
    for (const name of names) {
      const nodeType = schema.nodes[name];
      if (nodeType) {
        return nodeType;
      }
    }

    return null;
  }

  getNodeTypes(schema: Schema, names: string[]): NodeType[] {
    const nodeTypes: NodeType[] = [];

    for (const name of names) {
      const nodeType = schema.nodes[name];
      if (nodeType) {
        nodeTypes.push(nodeType);
      }
    }

    return nodeTypes;
  }

  getParentNodeRef(selection: Selection, nodeType: NodeType | null): ParentNodeRef | null {
    if (!nodeType) {
      return null;
    }

    const parentNodeRef = findParentNodeOfType(nodeType)(selection);
    if (!parentNodeRef) {
      return null;
    }

    return {
      pos: parentNodeRef.pos,
      start: parentNodeRef.start,
      node: parentNodeRef.node,
    };
  }

  getParentNodeRefByTypes(selection: Selection, nodeTypes: NodeType[]): ParentNodeRef | null {
    if (!nodeTypes.length) {
      return null;
    }

    const parentNodeRef = findParentNodeOfType(nodeTypes)(selection);
    if (!parentNodeRef) {
      return null;
    }

    return {
      pos: parentNodeRef.pos,
      start: parentNodeRef.start,
      node: parentNodeRef.node,
    };
  }

  normalizeString(value: string): string | null {
    const normalized = value.trim();
    return normalized.length ? normalized : null;
  }

  normalizeNumber(value: string): number | null {
    const normalized = this.normalizeString(value);
    if (!normalized) {
      return null;
    }

    const parsed = Number.parseInt(normalized, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  normalizeSizeAsNumber(value: string): number | null {
    const normalized = this.normalizeString(value);
    if (!normalized) {
      return null;
    }

    const parsed = Number.parseFloat(normalized.replace(/px$/i, ''));
    if (Number.isNaN(parsed) || parsed <= 0) {
      return null;
    }

    return Math.round(parsed);
  }

  applyColumnWidth(
    tr: Transaction,
    tableRef: ParentNodeRef,
    cellRef: ParentNodeRef,
    width: number
  ): Transaction {
    const tableNode = tr.doc.nodeAt(tableRef.pos);
    if (!tableNode) {
      return tr;
    }

    if (tableNode.type.spec.tableRole !== 'table') {
      return tr;
    }

    const tableMap = TableMap.get(tableNode);
    const cellPosRelative = cellRef.pos - tableRef.start;
    const mapIndex = tableMap.map.indexOf(cellPosRelative);
    if (mapIndex < 0) {
      return tr;
    }

    const column = mapIndex % tableMap.width;
    const updatedCells = new Set<number>();

    for (let row = 0; row < tableMap.height; row++) {
      const rowIndex = row * tableMap.width + column;
      const mappedCellPos = tableMap.map[rowIndex];

      if (updatedCells.has(mappedCellPos)) {
        continue;
      }

      updatedCells.add(mappedCellPos);
      const absoluteCellPos = tableRef.start + mappedCellPos;
      const currentCell = tr.doc.nodeAt(absoluteCellPos);
      if (!currentCell) {
        continue;
      }

      const colspan = Number(currentCell.attrs.colspan) || 1;
      tr = tr.setNodeMarkup(absoluteCellPos, undefined, {
        ...currentCell.attrs,
        colwidth: Array.from({length: colspan}, () => width),
      });
    }

    return tr;
  }

  applyAttributeInputs(
    view: EditorView,
    nodes: TableDetailNodeRefs,
    inputs: TableDetailsInput
  ): void {
    let tr = view.state.tr;

    tr = tr.setNodeMarkup(nodes.table.pos, undefined, {
      ...nodes.table.node.attrs,
      noOfColumns: this.normalizeNumber(inputs.noOfColumns),
      tableHeight: this.normalizeString(inputs.tableHeight),
    });

    if (nodes.row) {
      tr = tr.setNodeMarkup(nodes.row.pos, undefined, {
        ...nodes.row.node.attrs,
        rowHeight: this.normalizeString(inputs.rowHeight),
        rowWidth: this.normalizeString(inputs.rowWidth),
      });
    }

    if (nodes.cell) {
      const cellWidth = this.normalizeSizeAsNumber(inputs.cellWidth);
      if (cellWidth) {
        tr = this.applyColumnWidth(tr, nodes.table, nodes.cell, cellWidth);
      }

      const currentCell = tr.doc.nodeAt(nodes.cell.pos) || nodes.cell.node;
      tr = tr.setNodeMarkup(nodes.cell.pos, undefined, {
        ...currentCell.attrs,
        cellWidth: this.normalizeString(inputs.cellWidth),
        cellStyle: this.normalizeString(inputs.cellStyle),
        fontSize: this.normalizeString(inputs.fontSize),
        letterSpacing: this.normalizeString(inputs.letterSpacing),
        marginTop: this.normalizeString(inputs.marginTop),
        MarginBottom: this.normalizeString(inputs.MarginBottom),
      });
    }

    view.dispatch(tr);
    view.focus();
  }

  cancel(): void {
    this._popUp?.close(undefined);
  }
}

export default TableDetailsCommand;
