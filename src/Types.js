// @flow

import * as React from 'react';
export type NodeSpec = {
  attrs?: ?{ [key: string]: any },
  content?: ?string,
  draggable?: ?boolean,
  group?: ?string,
  inline?: ?boolean,
  name?: ?string,
  parseDOM?: ?Array<any>,
  toDOM?: ?(node: any) => Array<any>,
};

export type MarkSpec = {
  attrs?: ?{ [key: string]: any },
  name?: ?string,
  parseDOM: Array<any>,
  toDOM: (node: any) => Array<any>,
};

export type RecentColor = {
  id: number,
  color: string,
};

export type EditorProps = {
  // TODO: Fill the interface.
  // https://github.com/ProseMirror/prosemirror-view/blob/master/src/index.js
};

export type DirectEditorProps = EditorProps & {
  // TODO: Fill the interface.
  // https://github.com/ProseMirror/prosemirror-view/blob/master/src/index.js
};

export type RenderCommentProps = {
  commentThreadId: string,
  isActive: boolean,
  requestCommentThreadDeletion: Function,
  requestCommentThreadReflow: Function,
};

export type ImageLike = {
  height: number,
  id: string,
  src: string,
  width: number,
};

export type TableEditorBorderStyle = {
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'none',
  width: string,
  color: string,
};

export type TableEditorDialogData = {
  table?: Object,
  borders?: Object,
  typography?: Object,
  layout?: Object,
  metadata?: Object,
  selectionMode?: 'single' | 'range',
  fontOptions?: Array<{ label: string, value: string }>,
  mixed?: Object,
};

export type TableEditorResult = {
  table: Object,
  borders: Object,
  typography: Object,
  layout: Object,
  metadata: Object,
  selectionMode: 'single' | 'range',
  changed?: Object,
};

export type EditorRuntime = {
  // Image Proxy
  canProxyImageSrc?: (src: string) => boolean,
  getProxyImageSrc?: (src: string) => string,

  // Image Upload
  canUploadImage?: () => boolean,
  uploadImage?: (obj: Blob) => Promise<ImageLike>,

  // Comments
  canComment?: () => boolean,
  createCommentThreadID?: () => string,
  renderComment?: (props: RenderCommentProps) => ?React.Element<any>,

  // External HTML
  canLoadHTML?: () => boolean,
  loadHTML?: () => Promise<?string>,

  // Host-owned Table Settings dialog
  openTableEditorDialog?: (
    data: TableEditorDialogData,
    applyTableEditorResult?: (result: TableEditorResult) => void,
    closeTableEditor?: () => void
  ) => void,
};
export type EditorState = any;

export const INNER_LINK = 'INNER______LINK';
