/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import * as React from 'react';
import nullthrows from 'nullthrows';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import {
  atAnchorRight,
  createPopUp,
  RuntimeService,
  // ColorEditor
} from '@modusoperandi/licit-ui-commands';
import { ColorEditor } from '@modusoperandi/color-picker';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { Editor } from '@tiptap/react';

class TableColorCommand extends UICommand {
  executeCustom(_state: EditorState, tr: Transform, _from: number, _to: number): Transform {
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

  isEnabled = (_state: EditorState): boolean => {
    return true;
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
      this._popUp = createPopUp(ColorEditor, { hex: null, runtime: RuntimeService.Runtime, Textcolor: null }, {
        anchor,
        popUpId: 'mo-menuList-child',
        position: atAnchorRight,
        autoDismiss: true,
        onClose: (val) => {
          if (this._popUp) {
            this._popUp = null;
            resolve(val);
          }
        },
      });
    });
  };

  getEditor = (): Editor => {
    return UICommand.prototype.editor;
  };

  executeWithUserInput = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    hex?: string
  ): boolean => {
    if (hex !== undefined) {
      return this.getEditor().commands.setCellAttribute(this.attribute, hex);
    }
    return false;
  };

  cancel(): void {
    this._popUp?.close(undefined);
  }
}

export default TableColorCommand;
