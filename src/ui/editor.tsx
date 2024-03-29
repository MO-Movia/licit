import { EditorFocused } from '../constants';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView, Decoration } from 'prosemirror-view';
import * as React from 'react';

import { preLoadFonts } from '../specs/fontTypeMarkSpec';
import '../styles/czi-editor.css';
import type { EditorRuntime } from '../types';

export type EditorProps = {
  autoFocus?: boolean;
  disabled?: boolean;
  dispatchTransaction?: (tr: Transform) => void;
  editorState?: EditorState;
  embedded?: boolean;
  id?: string;
  onBlur?: () => void;
  onChange?: (state: EditorState, transaction: Transform) => void;
  onReady?: (view: EditorView) => void;
  // Mapping for custom node views.
  nodeViews?: {
    [nodeName: string]: {
      new (
        node: Node,
        editorView: EditorFocused,
        getPos: () => number,
        decorations: Array<Decoration>
      );
    };
  };
  placeholder?: string | React.ReactElement;
  readOnly?: boolean;
  runtime?: EditorRuntime;
  transformPastedHTML?: (html: string) => string;
  toolbarConfig?:any;
};
// FS IRAD-988 2020-06-18
preLoadFonts();
