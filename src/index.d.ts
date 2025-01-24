// from "./isEditorStateEmpty"
import { EditorState, Plugin } from 'prosemirror-state';
import { Node, Schema } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';

export default function isEditorStateEmpty(editorState: EditorState): boolean;

// from "./ui/uuid";
export default function uuid(): string;

// from './client/Licit.js';

export type DataType = Readonly<{
  JSON: symbol;
  HTML: symbol;
}>;

export class Licit extends React.Component<any, any> {
  runtime: any;

  constructor(props: any, context: any);

  /**
   * Provides access to prosemirror view.
   */
  get editorView(): EditorView;

  initialize(props: any);

  initEditorState(plugins: Array<Plugin>, dataType: DataType, data: any);

  getEffectivePlugins(
    schema: Schema,
    defaultPlugins: Array<Plugin>,
    plugins: Array<Plugin>
  ): { plugins: Array<Plugin>; schema: Schema; pasteJSONPlugin: Plugin };

  onReady(state: EditorState);

  showAlert();

  resetCounters(transaction: Transform);

  setCounterFlags(transaction: Transform, reset: boolean);

  getDeletedArtifactIds();

  isNodeHasAttribute(node: Node, attrName: string);

  getDocument(content: any, editorState: EditorState, dataType: DataType);

  insertJSON(json: { [key: string]: any } | string): void;

  setContent(content: any, dataType: DataType): void;

  hasDataChanged(nextData: any, nextDataType: DataType);

  changeContent(data: any, dataType: DataType);

  shouldComponentUpdate(nextProps: any, nextState: any);

  setDocID(nextState: any);

  render(): React.ReactElement<any>;

  _onChange(data: { state: EditorState; transaction: Transform }): void;

  closeOpenedPopupModels();

  _onReady(editorView: EditorView): void;

  /**
   * LICIT properties:
   *  docID {number} [0] Collaborative Doument ID
   *  debug {boolean} [false] To enable/disable ProseMirror Debug Tools, available only in development.
   *  width {string} [100%] Width of the editor.
   *  height {height} [100%] Height of the editor.
   *  readOnly {boolean} [false] To enable/disable editing mode.
   *  onChange {@callback} [null] Fires after each significant change.
   *      @param data {JSON} Modified document data.
   *  onReady {@callback} [null] Fires when the editor is fully ready.
   *      @param ref {LICIT} Rerefence of the editor.
   *  data {JSON} [null] Document data to be loaded into the editor.
   *  disabled {boolean} [false] Disable the editor.
   *  embedded {boolean} [false] Disable/Enable inline behaviour.
   */
  setProps(props: any): void;

  exportPDF();

  goToEnd(): void;

  pageLayout(): void;
}

// from './Types';
export type NodeSpec = {
  attrs?: { [key: string]: any };
  content?: string;
  draggable?: boolean;
  group?: string;
  inline?: boolean;
  name?: string;
  parseDOM?: Array<any>;
  toDOM?: (node: any) => Array<any>;
};

export type MarkSpec = {
  attrs?: { [key: string]: any };
  name?: string;
  parseDOM: Array<any>;
  toDOM: (node: any) => Array<any>;
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
  commentThreadId: string;
  isActive: boolean;
  requestCommentThreadDeletion: Function;
  requestCommentThreadReflow: Function;
};

export type ImageLike = {
  height: number;
  id: string;
  src: string;
  width: number;
};

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
  renderComment?: (
    props: RenderCommentProps
  ) => React.ReactElement<any> | undefined;

  // External HTML
  canLoadHTML?: () => boolean;
  loadHTML?: () => Promise<string>;
};

// from './client/http';
export function GET(url);
export function POST(url, body, type);
export function PUT(url, body, type);
export function DELETE(url, type);
export function PATCH(url, body, type);
