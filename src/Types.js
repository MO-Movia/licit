// @flow

import * as React from 'react';
import { Style } from '@modusoperandi/licit-custom-styles';
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

};
export type StyleRuntime = {

  saveStyle?: (style: Style) => Promise<Style[]>,
  getStylesAsync?: () => Promise<Style[]>,

  renameStyle?: (oldName: string, newName: string) => Promise<Style[]>,
  removeStyle?: (styleName: string) => Promise<Style[]>,

  fetchStyles?: () => Promise<Style[]>,
  buildRoute?: (...path: string[]) => String,
};

export type EditorState = any;
