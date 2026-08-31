/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */
import {
  CellSelection,
  isInTable,
  selectionCell,
  TableMap,
} from 'prosemirror-tables';
import { atAnchorRight, createPopUp } from '@modusoperandi/licit-ui-commands';
import { ColorEditor } from '@modusoperandi/color-picker';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
const BORDER_SIDES = ['Top', 'Bottom', 'Left', 'Right'];
const OPPOSITE_BORDER_SIDE = {
  Top: 'Bottom',
  Bottom: 'Top',
  Left: 'Right',
  Right: 'Left',
};
function normalizeBorderSides(sides) {
  if (!sides) {
    return [];
  }
  return BORDER_SIDES.filter((side) => sides.includes(side));
}
function findTableDepth($cell) {
  for (let depth = $cell.depth; depth >= 0; depth--) {
    if ($cell.node(depth).type.spec.tableRole === 'table') {
      return depth;
    }
  }
  return -1;
}
function getAdjacentRange(rect, side) {
  switch (side) {
    case 'Top':
      return {
        columnEnd: rect.right,
        columnStart: rect.left,
        rowEnd: rect.top,
        rowStart: rect.top - 1,
      };
    case 'Bottom':
      return {
        columnEnd: rect.right,
        columnStart: rect.left,
        rowEnd: rect.bottom + 1,
        rowStart: rect.bottom,
      };
    case 'Left':
      return {
        columnEnd: rect.left,
        columnStart: rect.left - 1,
        rowEnd: rect.bottom,
        rowStart: rect.top,
      };
    case 'Right':
      return {
        columnEnd: rect.right + 1,
        columnStart: rect.right,
        rowEnd: rect.bottom,
        rowStart: rect.top,
      };
    default:
      return {
        columnEnd: 0,
        columnStart: 0,
        rowEnd: 0,
        rowStart: 0,
      };
  }
}
function addMappedCell(adjacent, map, tableStart, row, column) {
  if (row < 0 || row >= map.height || column < 0 || column >= map.width) {
    return;
  }
  adjacent.add(tableStart + map.map[row * map.width + column]);
}
class TableColorCommand extends UICommand {
  executeCustom(_state, tr, _from, _to) {
    return tr;
  }
  executeCustomStyleForTable(_state, tr) {
    return tr;
  }
  _popUp = null;
  attribute = null;
  constructor(attribute) {
    super();
    this.attribute = attribute;
  }
  shouldRespondToUIEvent = (e) => {
    return e.type === UICommand.EventType.MOUSEENTER;
  };
  isEnabled = (state) => {
    const { $from } = state.selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      if ($from.node(depth).type.spec.tableRole === 'table') {
        return true;
      }
    }
    return false;
  };
  waitForUserInput = (_state, _dispatch, _view, event) => {
    // replaced any with PromiseConstructor seems to not cause any errors
    this.cancel();
    const target = event?.currentTarget;
    if (!(target instanceof HTMLElement)) {
      return Promise.resolve(undefined);
    }
    const anchor = event ? event.currentTarget : null;
    return new Promise((resolve) => {
      this._popUp = createPopUp(
        ColorEditor,
        {
          hex: null,
          runtime: _view?.runtime,
          Textcolor: null,
          showCheckbox: this.attribute !== 'backgroundColor',
        },
        {
          anchor,
          popUpId: 'mo-menuList-child',
          position: atAnchorRight,
          autoDismiss: true,
          onClose: (val) => {
            this._popUp = null;
            resolve(val);
          },
        }
      );
    });
  };
  executeWithUserInput = (_state, _dispatch, _view, hex) => {
    if (!hex || typeof hex.color !== 'string' || !hex.color.trim()) {
      return false;
    }
    const activeState = _view?.state ?? _state;
    const activeDispatch = _view ? (tr) => _view.dispatch(tr) : _dispatch;
    if (this.attribute !== 'borderColor') {
      return this.setCellBackgrounds(activeState, activeDispatch, hex.color);
    }
    return this.setCellBorders(
      activeState,
      activeDispatch,
      hex.selectedPosition,
      hex.color
    );
  };
  cancel() {
    const popUp = this._popUp;
    this._popUp = null;
    popUp?.close(undefined);
  }
  getSelectedCellPositions(state) {
    const positions = [];
    if (state.selection instanceof CellSelection) {
      state.selection.forEachCell((_node, pos) => positions.push(pos));
    } else if (isInTable(state)) {
      positions.push(selectionCell(state).pos);
    }
    return positions;
  }
  setCellBackgrounds(state, dispatch, color) {
    const selectedCells = this.getSelectedCellPositions(state);
    if (!selectedCells.length) {
      return false;
    }
    if (dispatch) {
      const tr = state.tr;
      for (const pos of selectedCells) {
        const node = tr.doc.nodeAt(pos);
        const role = node?.type.spec.tableRole;
        if (!node || (role !== 'cell' && role !== 'header_cell')) {
          continue;
        }
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          background: color,
          backgroundColor: color,
          backgroundColorOverridden: true,
        });
      }
      if (tr.docChanged) {
        dispatch(tr);
      }
    }
    return true;
  }
  setCellBorders(state, dispatch, selectedPosition, color) {
    const selectedSides = normalizeBorderSides(selectedPosition);
    if (selectedSides.length === 0 || !isInTable(state)) {
      return false;
    }
    const selectedSideSet = new Set(selectedSides);
    const selectedCells = this.getSelectedCellPositions(state);
    const pendingUpdates = new Map();
    const getPendingUpdate = (pos) => {
      const existing = pendingUpdates.get(pos);
      if (existing) {
        return existing;
      }
      const node = state.doc.nodeAt(pos);
      const tableRole = node?.type.spec.tableRole;
      if (!node || (tableRole !== 'cell' && tableRole !== 'header_cell')) {
        return null;
      }
      const update = {
        attrs: { ...node.attrs },
        changed: false,
      };
      pendingUpdates.set(pos, update);
      return update;
    };
    const updateCellSides = (pos, sides) => {
      const update = getPendingUpdate(pos);
      if (!update) {
        return;
      }
      const { attrs } = update;
      const aggregateColor =
        typeof attrs.borderColor === 'string' && attrs.borderColor.trim()
          ? attrs.borderColor
          : null;
      for (const side of BORDER_SIDES) {
        const colorAttr = `border${side}Color`;
        const nextColor = sides.includes(side)
          ? color
          : (attrs[colorAttr] ?? aggregateColor);
        if (nextColor !== attrs[colorAttr]) {
          attrs[colorAttr] = nextColor;
          update.changed = true;
        }
      }
      // Aggregate borderColor has different render precedence on tableCell and
      // tableHeader. Materialize it into the four side colors, then clear it so
      // a selected side always wins and Table Settings reads the same values.
      if (attrs.borderColor !== null) {
        attrs.borderColor = null;
        update.changed = true;
      }
    };
    const getAdjacentCellPositions = (cellPos, side) => {
      const $cell = state.doc.resolve(cellPos);
      const tableDepth = findTableDepth($cell);
      if (tableDepth < 0) {
        return [];
      }
      const table = $cell.node(tableDepth);
      const tableStart = $cell.start(tableDepth);
      const map = TableMap.get(table);
      const rect = map.findCell(cellPos - tableStart);
      const adjacent = new Set();
      const range = getAdjacentRange(rect, side);
      for (let row = range.rowStart; row < range.rowEnd; row++) {
        for (
          let column = range.columnStart;
          column < range.columnEnd;
          column++
        ) {
          addMappedCell(adjacent, map, tableStart, row, column);
        }
      }
      adjacent.delete(cellPos);
      return [...adjacent];
    };
    for (const cellPos of selectedCells) {
      updateCellSides(cellPos, selectedSides);
      for (const side of selectedSideSet) {
        for (const adjacentPos of getAdjacentCellPositions(cellPos, side)) {
          updateCellSides(adjacentPos, [OPPOSITE_BORDER_SIDE[side]]);
        }
      }
    }
    const changedUpdates = [...pendingUpdates.entries()].filter(
      ([, update]) => update.changed
    );
    if (changedUpdates.length === 0) {
      return false;
    }
    if (dispatch) {
      const tr = state.tr;
      for (const [pos, update] of changedUpdates) {
        tr.setNodeMarkup(pos, undefined, update.attrs);
      }
      dispatch(tr);
    }
    return true;
  }
}
export default TableColorCommand;
