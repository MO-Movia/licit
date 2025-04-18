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
    // Use the effectivePlugins, editor hangs, b'coz of missing default core plugins
    return createEmptyEditorState(schema, defaultSchema, effectivePlugins);
  }

  // Handle gracefully when error thrown on invalid json
  let doc = null;

  try {
    if (undefined === json.content) {
      json.content = [{ type: 'paragraph' }];
    }
    doc = editorSchema.nodeFromJSON(json);
  } catch (error) {
    console.error('Failed to convert JSON to valid ProseMirror: ', error);
    return null;
  }

  return EditorState.create({
    doc: doc,
    schema: editorSchema,
    plugins: effectivePlugins,
  });
}
