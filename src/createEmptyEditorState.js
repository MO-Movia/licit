// @flow

import { Schema } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import convertFromJSON from './convertFromJSON.js';
import EditorSchema from './EditorSchema.js';

export const EMPTY_DOC_JSON = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    }, // [FS] IRAD-1710 2022-03-04 - No text content needed
  ],
};

export default function createEmptyEditorState(
  schema: ?Schema,
  defaultSchema: ?Schema,
  plugins: Array<Plugin>
): EditorState {
  // TODO: Check if schema support doc and paragraph nodes.
  return convertFromJSON(
    EMPTY_DOC_JSON,
    schema,
    defaultSchema || EditorSchema,
    plugins
  );
}
