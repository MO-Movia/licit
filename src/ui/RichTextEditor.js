// @flow

import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';

import createEmptyEditorState from '../createEmptyEditorState.js';
import Editor from './Editor.js';
import EditorFrameset from './EditorFrameset.js';
import EditorToolbar from './EditorToolbar.js';
import Frag from './Frag.js';
import uuid from './uuid.js';

import type { EditorFramesetProps } from './EditorFrameset.js';
import type { EditorProps } from './Editor.js';

type Props = EditorFramesetProps & EditorProps & { children?: ?any };

type State = {
  editorView: ?EditorView,
};

const EMPTY_EDITOR_RUNTIME = {};

class RichTextEditor extends React.PureComponent<any, any> {
  props: Props;

  state: State;

  _id: string;

  constructor(props: any, context: any) {
    super(props, context);
    this._id = uuid();
    this.state = {
      contentHeight: NaN,
      contentOverflowHidden: false,
      editorView: null,
    };
  }

  render(): React.Element<any> {
    const {
      autoFocus,
      children,
      className,
      disabled,
      embedded,
      header,
      height,
      onChange,
      nodeViews,
      placeholder,
      readOnly,
      width,
    } = this.props;

    let { editorState, runtime, styleRuntime } = this.props;

    editorState = editorState || createEmptyEditorState();
    runtime = runtime || EMPTY_EDITOR_RUNTIME;

    const { editorView } = this.state;

    const toolbar =
      !!readOnly === true ? null : (
        <EditorToolbar
          disabled={disabled}
          dispatchTransaction={this._dispatchTransaction}
          editorState={editorState || Editor.EDITOR_EMPTY_STATE}
          editorView={editorView}
          readOnly={readOnly}
        />
      );

    const body = (
      <Frag>
        <Editor
          autoFocus={autoFocus}
          disabled={disabled}
          dispatchTransaction={this._dispatchTransaction}
          editorState={editorState}
          embedded={embedded}
          id={this._id}
          nodeViews={nodeViews}
          onChange={onChange}
          onReady={this._onReady}
          placeholder={placeholder}
          readOnly={readOnly}
          runtime={runtime}
          styleRuntime={styleRuntime}
        />
        {children}
      </Frag>
    );

    return (
      <EditorFrameset
        body={body}
        className={className}
        embedded={embedded}
        header={header}
        height={height}
        toolbar={toolbar}
        width={width}
      />
    );
  }

  _dispatchTransaction = (tr: Transform): void => {
    const { onChange, editorState } = this.props;
    // [FS] IRAD-1171 2021-02-04
    // To bring selection on editor in read-only mode.
    // Removed force return when readOnly flag is true
    if (onChange) {
      // [FS-AFQ][20-FEB-2020]
      // Collaboration
      onChange({
        state: editorState || Editor.EDITOR_EMPTY_STATE,
        transaction: tr,
      });
    }
  };

  _onReady = (editorView: EditorView): void => {
    if (editorView !== this.state.editorView) {
      this.setState({ editorView });
      const { onReady } = this.props;
      onReady && onReady(editorView);
    }
  };
}

export default RichTextEditor;
