/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import * as React from 'react';
import nullthrows from 'nullthrows';
import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';

import {
  atAnchorRight,
  createPopUp,
  RuntimeService,
  // ColorEditor
} from '@modusoperandi/licit-ui-commands';
import {ColorEditor} from '@modusoperandi/color-picker';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {Editor} from '@tiptap/react';

class TableColorCommand extends UICommand {
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
  _popUp = null;
  attribute = null;

  constructor(attribute: string) {
    super();
    this.attribute = attribute;
  }

  shouldRespondToUIEvent = (e: React.SyntheticEvent | MouseEvent): boolean => {
    return e.type === UICommand.EventType.MOUSEENTER;
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

  waitForUserInput = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    event?: React.SyntheticEvent
  ): Promise<PromiseConstructor> => {
    // replaced any with PromiseConstructor seems to not cause any errors
    if (this._popUp) {
      return Promise.resolve(undefined);
    }
    const target = nullthrows(event).currentTarget;

    if (!(target instanceof HTMLElement)) {
      return Promise.resolve(undefined);
    }
    

    const anchor = event ? event.currentTarget : null;
    return new Promise((resolve) => {
      this._popUp = createPopUp(
        ColorEditor,
        {
          hex: null,
          runtime: RuntimeService.Runtime,
          Textcolor: null,
          showCheckbox: this.attribute !== 'backgroundColor',
        },
        {
          anchor,
          popUpId: 'mo-menuList-child',
          position: atAnchorRight,
          autoDismiss: false,
          onClose: (val) => {
            if (this._popUp) {
              this._popUp = null;
              resolve(val);
            }
          },
        }
      );
    });
  };

  getEditor = (): Editor => {
    return UICommand.prototype.editor;
  };

  executeWithUserInput = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    hex?: {color: string; selectedPosition?: string[]}
  ): boolean => {
    if (hex !== undefined) {
      const editor = this.getEditor();
      const success = editor.commands.setCellAttribute(this.attribute, hex);
      if (success) {
        this.setCellBorders(editor, hex.selectedPosition, hex.color);
      }
    }
    return false;
  };

  cancel(): void {
    this._popUp?.close(undefined);
  }

  setCellBorders(editor: Editor, selectedPosition: string[], color: string) {
    const width = '0.25px';
    const style = 'solid';
    const cssValue = `${width} ${style} ${color}`;

    const attrs: Record<string, string> = {};

    for (const side of selectedPosition) {
      attrs[`border${side}`] = cssValue;
    }

    editor.chain().focus().updateAttributes('tableCell', attrs).run();
  }
}

export default TableColorCommand;
