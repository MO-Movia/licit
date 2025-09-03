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
    color: ?{ color: string, selectedPosition?: string[] }
  ): boolean => {
    if (dispatch && color !== undefined) {
      const pos = this.findCellPosFromSelection(view.state);
      if (pos !== null) {
        this.setCellBorder(view, pos, color.selectedPosition, color.color);
      }
      return true;
    }
    return false;
  };

  cancel(): void {
    this._popUp?.close(undefined);
  }

  setCellBorder(view: ?EditorView, pos: Number, sides: string, color: string) {
    const width = '0.25px';
    const style = 'solid';
    const { state, dispatch } = view;
    const node = state.doc.nodeAt(pos);
    if (!node || !['table_cell', 'table_header'].includes(node.type.name)) return;

    const newAttrs = { ...node.attrs };
    const cssValue = `${width} ${style} ${color}`;
    sides.forEach(side => {
      const attrName = `border${side.charAt(0).toUpperCase() + side.slice(1)}`;
      newAttrs[attrName] = cssValue;
    });
    dispatch(state.tr.setNodeMarkup(pos, null, newAttrs));
  }

  findCellPosFromSelection(state: EditorState) {
    const { $from } = state.selection;
    for (let d = $from.depth; d > 0; d--) {
      const node = $from.node(d);
      if (['cell', 'header_cell'].includes(node.type.spec.tableRole)) {
        return $from.before(d);
      }
    }
    return null;
  }
}

export default TableBorderColorCommand;