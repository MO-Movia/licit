// @flow

import { EditorState  } from 'prosemirror-state';
import { TableMap, setCellAttr,CellSelection  } from 'prosemirror-tables';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { ColorEditor } from '@modusoperandi/color-picker';
import { atAnchorRight, createPopUp, findNodesWithSameMark, MARK_TEXT_COLOR } from '@modusoperandi/licit-ui-commands';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

const setCellBorderBlack = setCellAttr('borderColor', '#000000');

class TableBorderColorCommand extends UICommand {
  _popUp = null;

  shouldRespondToUIEvent = (e: SyntheticEvent<> | MouseEvent): boolean => {
    return e.type === UICommand.EventType.MOUSEENTER;
  };

  isEnabled = (state: EditorState): boolean => {
    return setCellBorderBlack(state.tr);
  };

  waitForUserInput = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
    event: ?SyntheticEvent<>
  ): Promise<any> => {
    if (this._popUp) {
      return Promise.resolve(undefined);
    }
    const target = event?.currentTarget;
    if (!(target instanceof HTMLElement)) {
      return Promise.resolve(undefined);
    }
    const { doc, selection, schema } = state;
    const markType = schema.marks[MARK_TEXT_COLOR];
    const { from, to } = selection;
    const result = findNodesWithSameMark(doc, from, to, markType);

    const anchor = event ? event.currentTarget : null;
    const hex = result ? result.mark.attrs.color : null;

    return new Promise((resolve) => {
      this._popUp = createPopUp(ColorEditor, { hex, runtime: view.runtime, showCheckbox: true },
        {
          anchor,
          autoDismiss: false,
          position: atAnchorRight,
          onClose: (val) => {
            if (this._popUp) {
              this._popUp = null;
              resolve(val);
            }
          },
        });
    });
  };

  executeWithUserInput = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
    color
  ): boolean => {
    if (dispatch && color !== undefined) {
     view =  this.clearAdjacentCellBorder(view, color.selectedPosition,color.color,dispatch);
      const cmd = this.setCellBorderSideColor(color.selectedPosition, color.color);
      cmd(state, dispatch, view);
      return true;
    }
    return false;
  };

  cancel(): void {
    this._popUp?.close(undefined);
  }
  setCellBorderSideColor(side: 'top' | 'right' | 'bottom' | 'left', color: string) {
    const attrName = `border${side[0].toUpperCase() + side.slice(1)}Color`;
    return setCellAttr(attrName, color);
  }

  findCellAround($pos) {
  for (let depth = $pos.depth; depth > 0; depth--) {
    const node = $pos.node(depth);
    if (node.type.spec.tableRole === 'cell' || node.type.spec.tableRole === 'header_cell') {
      return {
        pos: $pos.before(depth),
        start: $pos.start(depth),
        node,
      };
    }
  }
  return null;
}

getCellSelectionForSelectedCell(state) {
  const { selection } = state;
  const $from = selection.$from;
  const cell = this.findCellAround($from);

  if (cell) {
    const $cellPos = state.doc.resolve(cell.pos);
    return new CellSelection($cellPos);
  }

  return null;
  }

  findTable(selection) {
    const { $from } = selection;
    for (let d = $from.depth; d > 0; d--) {
      const node = $from.node(d);
      if (node.type.spec.tableRole === 'table') {
        return {
          node,
          pos: $from.before(d),
          start: $from.start(d),
          depth: d,
        };
      }
    }
    return null;
  }
  clearAdjacentCellBorder(view, direction, selectedBorderColor, dispatch) {
  const { state } = view;
  const { doc, selection } = state;

  const table = this.findTable(selection);
  if (!table) return view;

  const cellSelection = this.getCellSelectionForSelectedCell(state);
  const $refCell = cellSelection?.$anchorCell;
  if (!$refCell) return view;

  const tableMap = TableMap.get(table.node);
  const cellStartInTable = $refCell.pos - table.pos - 1;

  const tr = state.tr;

  let adjacentCellPos = null;
  let borderAttr = null;

  switch (direction) {
    case 'Right':
      adjacentCellPos = tableMap.nextCell(cellStartInTable, 'horiz', 1);
      borderAttr = 'borderLeftColor';
      break;
    case 'Bottom':
      adjacentCellPos = tableMap.nextCell(cellStartInTable, 'vert', 1);
      borderAttr = 'borderTopColor';
      break;
    default:
      return view;
  }

  if (adjacentCellPos !== null) {
    const docPos = table.pos + 1 + adjacentCellPos;
    const node = doc.nodeAt(docPos);
    if (node) {
      tr.setNodeMarkup(docPos, null, {
        ...node.attrs,
        [borderAttr]: selectedBorderColor,
      });
    }
     dispatch(tr);
  }
  return view;
}
}

export default TableBorderColorCommand;