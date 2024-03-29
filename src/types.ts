import * as React from 'react';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

export type NodeSpec = {
  attrs?: Record<string, unknown>;
  content?: string;
  draggable?: boolean;
  group?: string;
  inline?: boolean;
  name?: string;
  defining?: boolean;
  parseDOM?: Record<string, unknown>[];
  toDOM?: (node) => (string | number | Record<string, unknown>)[];
};

export type MarkSpec = {
  attrs?: Record<string, unknown>;
  inline?: boolean;
  defining?: boolean;
  draggable?: boolean;
  excludes?: string;
  group?: string;
  inclusive?: boolean;
  name?: string;
  spanning?: boolean;
  parseDOM: Array<Record<string, unknown>>;
  toDOM: (node) => (string | number | Record<string, unknown>)[];
};

export type EditorProps = {
  // TODO: Fill the interface.
  // https://github.com/ProseMirror/prosemirror-view/blob/master/src/index.js
};

export type DirectEditorProps = EditorProps & {
  clipboardSerializer;
  dispatchTransaction: (tr: Transform) => void;
  editable: () => boolean;
  nodeViews;
  state: EditorState;
  transformPastedHTML: (html: string) => string;
  handleDOMEvents;
  // TODO: Fill the interface.
  // https://github.com/ProseMirror/prosemirror-view/blob/master/src/index.js
};

export type RenderCommentProps = {
  commentThreadId: string;
  isActive: boolean;
  requestCommentThreadDeletion: () => void;
  requestCommentThreadReflow: () => void;
};

export type ImageLike = {
  height: number;
  id: string;
  src: string;
  width: number;
};

export type ToolbarMenuConfig={
  menuPosition:number;
  key:string;
  menuCommand:UICommand|unknown;
  isPlugin?:boolean;
  group:string;

}
export type EditorRuntime = {
  // Image Proxy
  canProxyImageSrc?: (src: string) => boolean;
  getProxyImageSrc?: (src: string) => string;

  // Image Upload
  canUploadImage?: () => boolean;
  uploadImage?: (obj: Blob) => Promise<ImageLike>;

  // Comments
  canComment?: () => boolean;
  createCommentThreadID?: () => string;
  renderComment?: (props: RenderCommentProps) => React.ReactElement | null;

  // External HTML
  canLoadHTML?: () => boolean;
  loadHTML?: () => Promise<string>;
};
