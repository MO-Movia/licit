import * as React from 'react';
import nullthrows from 'nullthrows';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import {
  ColorEditor,
  atAnchorRight,
  createPopUp,
} from '@modusoperandi/licit-ui-commands';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { Editor } from '@tiptap/react';

class TableColorCommand extends UICommand {
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
      this._popUp = createPopUp(ColorEditor, null, {
        anchor,
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

  getEditor = (): Editor => {
    return UICommand.prototype.editor as Editor;
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
    this._popUp && this._popUp.close(undefined);
  }
}

export default TableColorCommand;
