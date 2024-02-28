// @flow

import { EditorView } from 'prosemirror-view';
import * as React from 'react';

import type { DirectEditorProps, EditorRuntime, StyleRuntime } from '../Types.js';


// https://github.com/ProseMirror/prosemirror-view/blob/master/src/index.js
class CustomEditorView extends EditorView {
  disabled: boolean;
  placeholder: ?(string | React.Element<any>);
  readOnly: boolean;
  runtime: ?EditorRuntime;
  styleRuntime: ?StyleRuntime;
  constructor(place: HTMLElement, props: DirectEditorProps) {
    super(place, props);
    this.runtime = null;
    this.readOnly = true;
    this.disabled = true;
    this.placeholder = null;
    this.styleRuntime = null;
  }

  destroy() {
    super.destroy();
    this._props = {};
  }
}

export default CustomEditorView;
