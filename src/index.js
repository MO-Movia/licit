// @flow

export { EditorState } from 'prosemirror-state';
export { default as isEditorStateEmpty } from './isEditorStateEmpty';
export { default as uuid } from './ui/uuid';
// [FS] IRAD-978 2020-06-05
// Export Licit as a component
export { default as Licit } from './client/Licit.js';
export { ImageLike, EditorRuntime } from './Types';
export { GET, POST } from './client/http';

// Export the plugin so that consumers of the library have the access required
// to actually create one.
export { default as ObjectIdPlugin } from './objectIdPlugin';