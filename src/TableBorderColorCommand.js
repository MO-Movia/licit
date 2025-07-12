// @flow

import { EditorState } from 'prosemirror-state';
import { setCellAttr } from 'prosemirror-tables';
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
      const pos = this.findCellPosFromSelection(view.state);
      if (pos !== null) {
        this.setTableCellClass(view, pos, color.selectedPosition, color.color);
      }
      return true;
    }
    return false;
  };

  cancel(): void {
    this._popUp?.close(undefined);
  }
  setCellBorderSideColor(side, color) {
    const attrName = `border${side[0].toUpperCase() + side.slice(1)}Color`;
    return setCellAttr(attrName, color);
  }

  setTableCellClass(view, pos, direction, selectedColor) {
    const { state, dispatch } = view;
    const node = state.doc.nodeAt(pos);
    const classPrefix = `custom-${direction.toLowerCase()}-`;
    const color = this.getBaseColor(selectedColor);
    const className = `custom-${direction.toLowerCase()}-${color}`;
    if (node && (node.type.name === 'table_cell' || node.type.name === 'table_header')) {
      const existingClass = node.attrs.className || '';
      const classList = new Set(
        existingClass
          .split(/\s+/)
          .filter(cls => cls && !cls.startsWith(classPrefix))
      );

      classList.add(className);

      const updatedClass = Array.from(classList).join(' ');

      dispatch(
        state.tr.setNodeMarkup(pos, null, {
          ...node.attrs,
          className: updatedClass,
        })
      );
    }
  }

  findCellPosFromSelection(state) {
    const { $from } = state.selection;
    for (let d = $from.depth; d > 0; d--) {
      const node = $from.node(d);
      if (node.type.spec.tableRole === 'cell' || node.type.spec.tableRole === 'header_cell') {
        return $from.before(d);
      }
    }
    return null;
  }

  colorMap = {
    '#000000': 'black', '#444444': 'darkgrey', '#666666': 'grey', '#999999': 'basaltgrey', '#acacac': 'silvergrey',
    '#c8c8c8': 'lightgrey', '#e1e1e1': 'greywhite', '#f3f3f3': 'whitesmoke', '#ffffff': 'white',
    // Red group
    '#ff0000': 'red', '#fcf0f0': 'red', '#fadcd9': 'red', '#fabbb4': 'red',
    '#fc9086': 'red', '#fa5343': 'red', '#d91f11': 'red', '#a1160a': 'red',
    '#75160c': 'red',

    // Light yellow group
    '#ffc000': 'lightyellow', '#fcf2eb': 'lightyellow', '#fcddc7': 'lightyellow', '#fcbc97': 'lightyellow',
    '#fc9162': 'lightyellow', '#e86427': 'lightyellow', '#bf4815': 'lightyellow', '#8f3415': 'lightyellow',
    '#632b17': 'lightyellow',

    // Yellow group
    '#ffff00': 'yellow', '#faf6cf': 'yellow', '#f7e379': 'yellow', '#f5c518': 'yellow',
    '#d9a514': 'yellow', '#b3870e': 'yellow', '#946613': 'yellow', '#70491c': 'yellow',
    '#54341f': 'yellow',

    // Light Green group
    '#92d050': 'lightgreen', '#ebf7da': 'lightgreen', '#d5f0b1': 'lightgreen', '#aad971': 'lightgreen',
    '#78bf39': 'lightgreen', '#52a31d': 'lightgreen', '#3c7d0e': 'lightgreen', '#2e5c0e': 'lightgreen',
    '#254211': 'lightgreen',

    // Green group
    '#00b050': 'green', '#ebf7ed': 'green', '#c7ebd1': 'green', '#88dba8': 'green',
    '#43c478': 'green', '#16a163': 'green', '#077d55': 'green', '#075e45': 'green',
    '#094536': 'green',

    // Light Blue group
    '#00b0f0': 'lightblue', '#ebf3f7': 'lightblue', '#c9e7f5': 'lightblue', '#8bd3f7': 'lightblue',
    '#48b8f0': 'lightblue', '#1195d6': 'lightblue', '#0073ba': 'lightblue', '#08548a': 'lightblue',
    '#0e3d66': 'lightblue',

    // Blue group
    '#0070c0': 'blue', '#f0f4fa': 'blue', '#d5e4fa': 'blue', '#adccf7': 'blue',
    '#75b1ff': 'blue', '#3d8df5': 'blue', '#186ade': 'blue', '#0d4ea6': 'blue',
    '#103a75': 'blue',

    // Pink group
    '#ff00ff': 'pink', '#fcf0f8': 'pink', '#f7daed': 'pink', '#f7b7e2': 'pink',
    '#fa87d4': 'pink', '#ed4cb7': 'pink', '#cc1d92': 'pink', '#961574': 'pink',
    '#6b155a': 'pink',

    // Purple group
    '#7030a0': 'purple', '#f7f2fc': 'purple', '#eadcfc': 'purple', '#dabefa': 'purple',
    '#c89afc': 'purple', '#ac71f0': 'purple', '#8f49de': 'purple', '#6b30ab': 'purple',
    '#4c277d': 'purple'
  };

  getBaseColor(inputColor) {
    return this.colorMap[inputColor.toLowerCase()] || null;
  }
}

export default TableBorderColorCommand;