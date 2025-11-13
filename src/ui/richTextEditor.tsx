/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { Editor, EditorContent } from '@tiptap/react';
import EditorFrameset from './editorFrameset';
import EditorToolbar from './editorToolbar';
import Frag from './frag';
import uuid from './uuid';

import type { EditorFramesetProps } from './editorFrameset';
import type { EditorProps } from './editor';
import { Transaction } from 'prosemirror-state';
// import { EditorToolbar } from '@modusoperandi/licit-toolbar';
type EditorContainer = { editor?: Editor };

type RichTextEditorProps = EditorContainer &
  EditorFramesetProps &
  EditorProps &
  RichTextEditorState & { children?};

type RichTextEditorState = {
  editorView?: EditorView;
};

class RichTextEditor extends React.PureComponent<
  RichTextEditorProps,
  RichTextEditorState
> {
  declare props: RichTextEditorProps;

 declare  state: RichTextEditorState;

  _id: string;

  constructor(props: RichTextEditorProps, context: Record<string, unknown>) {
    super(props, context);
    this._id = uuid();
    this.state = {
      contentHeight: NaN,
      contentOverflowHidden: false,
      editorView: null,
    } as RichTextEditorState;
  }

  render(): React.ReactElement<EditorFrameset> {
    const {
      //autoFocus,
      children,
      className,
      disabled,
      embedded,
      header,
      height,
      //onChange,
      //nodeViews,
      //placeholder,
      readOnly,
      width,
      toolbarConfig
    } = this.props;

    const { editorState /*, runtime*/ } = this.props;
    const { editorView } = this.props;
    //Seybi : This causes delay in edit
    // this.props.editor.setEditable(!readOnly);

    const toolbar =
      !!readOnly === true ? null : (
        <EditorToolbar
          disabled={disabled}
          dispatchTransaction={this._dispatchTransaction}
          editorState={editorState}
          editorView={editorView}
          readOnly={readOnly}
          toolbarConfig={toolbarConfig}
        />
      );

    const body = (
      <Frag>
        <EditorContent
          editor={this.props.editor}
          height={height}
          width={width}
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
    this.props.editor.view.dispatch(tr as Transaction);
  };

  _onReady = (editorView: EditorView): void => {
    if (editorView !== this.state.editorView) {
      this.setState({ editorView });
      const { onReady } = this.props;
      onReady?.(editorView);
    }
  };
}

export default RichTextEditor;
/*<Editor
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
        />*/
