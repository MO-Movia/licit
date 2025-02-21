// @flow

import { Schema } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import createEmptyEditorState from './createEmptyEditorState.js';

export default function convertFromJSON(
  json: Object | string,
  schema: ?Schema,
  defaultSchema: Schema,
  effectivePlugins: Array<Plugin>
): EditorState {
  const editorSchema = schema || defaultSchema;
  let error = false;

  if (typeof json === 'string') {
    try {
      json = JSON.parse(json);
    } catch (ex) {
      console.error('convertFromJSON:', ex);
      error = true;
    }
  }

  if (!json || typeof json !== 'object') {
    console.error('convertFromJSON: invalid object', json);
    error = true;
  }

  if (error) {
    // [FS] IRAD-1455 2021-06-16
    // Use the effectivePlugins, editor hangs, b'coz of missing default core plugins
    return createEmptyEditorState(schema, defaultSchema, effectivePlugins);
  }

  // [FS] IRAD-1067 2020-09-19
  // Handle gracefully when error thrown on invalid json
  let doc = null;

  try {
    doc = editorSchema.nodeFromJSON(json);
  } catch {
    return null;
  }

  return EditorState.create({
    doc: doc,
    schema: editorSchema,
    plugins: effectivePlugins,
  });
}
