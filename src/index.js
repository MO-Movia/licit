// @flow

export { EditorState } from 'prosemirror-state';
export { default as isEditorStateEmpty } from './isEditorStateEmpty';
export { default as uuid } from './ui/uuid';
// [FS] IRAD-978 2020-06-05
// Export Licit as a component
export { default as Licit, DataType } from './client/Licit.js';
// export { ImageLike, EditorRuntime } from './Types'; //Flow garbles these types beyond use for now
export { GET, POST, DELETE, PATCH } from './client/http';

export { SetDocAttrStep } from '@modusoperandi/licit-doc-attrs-step';
