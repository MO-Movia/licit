/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import * as React from 'react';
import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { SetDocAttrStep, UICommand } from '@modusoperandi/licit-doc-attrs-step';
import DocLayoutEditor from '../ui/docLayoutEditor';
import { createPopUp } from '@modusoperandi/licit-ui-commands';

import type { DocLayoutEditorValue } from '../ui/docLayoutEditor';
import { Editor } from '@tiptap/react';

function setDocLayout(
  tr: Transform,
  _schema: Schema,
  width?: number,
  layout?: string
): Transform {
  const { doc } = tr;
  if (!doc) {
    return tr;
  }

  tr = tr.step(new SetDocAttrStep('width', width || null));
  tr = tr.step(new SetDocAttrStep('layout', layout || null));
  return tr;
}

class DocLayoutCommand extends UICommand {
  _popUp = null;

  getEditor = (): Editor => {
    return UICommand.prototype.editor;
  };

  isEnabled = (_state: EditorState): boolean => {
    return true;
  };

  isActive = (_state: EditorState): boolean => {
    return !!this._popUp;
  };

  waitForUserInput = (
    state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    _event?: React.SyntheticEvent
  ): Promise<PromiseConstructor> => {
    if (this._popUp) {
      return Promise.resolve(undefined);
    }

    const { doc } = state;

    return new Promise((resolve) => {
      const props = {
        initialValue: doc.attrs,
      };
      this._popUp = createPopUp(DocLayoutEditor, props, {
        modal: true,
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
    dispatch?: (tr: Transform) => void,
    view?: EditorView,
    inputs?: DocLayoutEditorValue
  ): boolean => {
    if (dispatch) {
      const { selection, schema } = state;
      let { tr } = state;
      tr = tr.setSelection(selection);

      if (inputs) {
        const { width, layout } = inputs;
        (tr as Transform) = setDocLayout(tr, schema, width, layout);
      }
      this.getEditor().view.dispatch(tr);
      if (view) view.focus();
    }

    return false;
  };

  cancel(): void {
    return null;
  }
  executeCustom(_state: EditorState, tr: Transform, _from: number, _to: number): Transform {
    return tr;
  }
  executeCustomStyleForTable(_state: EditorState, tr: Transform): Transform {
    return tr;
  }
}

export default DocLayoutCommand;
