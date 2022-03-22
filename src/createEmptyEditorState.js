// @flow

import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { Plugin } from 'prosemirror-state';
import DefaultEditorPlugins from './buildEditorPlugins';

import convertFromJSON from './convertFromJSON';
import EditorSchema from './EditorSchema';

export const EMPTY_DOC_JSON = {
  type: 'doc',
  content: [
    {
      type: 'paragraph'
    },// [FS] IRAD-1710 2022-03-04 - No text content needed
  ],
};

export default function createEmptyEditorState(
  schema: ?Schema,
  defaultSchema: ?Schema,
  plugins: ?Array<Plugin>,
  defaultPlugins: ?Array<Plugin>
): EditorState {
  const newSchema = schema || (defaultSchema ? defaultSchema : EditorSchema);
  // TODO: Check if schema support doc and paragraph nodes.
  return convertFromJSON(
    EMPTY_DOC_JSON,
    schema,
    defaultSchema ? defaultSchema : EditorSchema,
    plugins,
    defaultPlugins ? defaultPlugins : new DefaultEditorPlugins(newSchema).get()
  );
}
