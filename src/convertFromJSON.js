// @flow

import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { Plugin } from 'prosemirror-state';
import createEmptyEditorState from './createEmptyEditorState';

import { COMMAND_GROUPS } from './ui/EditorToolbarConfig';

export default function convertFromJSON(
  json: Object | string,
  schema: ?Schema,
  defaultSchema: Schema,
  plugins: ?Array<Plugin>,
  defaultPlugins: Array<Plugin>
): EditorState {
  let editorSchema = schema || defaultSchema;

  // [FS][IRAD-???? 2020-08-17]
  // Loads plugins and its curresponding schema in editor
  const effectivePlugins = defaultPlugins;

  if (plugins) {
    for (const p of plugins) {
      if (!effectivePlugins.includes(p)) {
        effectivePlugins.push(p);
        if (p.getEffectiveSchema) {
          editorSchema = p.getEffectiveSchema(editorSchema);
        }

        if (p.initKeyCommands) {
          effectivePlugins.push(p.initKeyCommands());
        }

        if (p.initButtonCommands) {
          COMMAND_GROUPS.push(p.initButtonCommands());
        }
      }
    }
  }
  if (typeof json === 'string') {
    try {
      json = JSON.parse(json);
    } catch (ex) {
      console.error('convertFromJSON:', ex);
      // [FS] IRAD-1455 2021-06-16
      // Use the effectivePlugins, editor hangs, b'coz of missing default core plugins
      return createEmptyEditorState(
        schema,
        defaultSchema,
        plugins,
        defaultPlugins
      );
    }
  }

  if (!json || typeof json !== 'object') {
    console.error('convertFromJSON: invalid object', json);
    // [FS] IRAD-1455 2021-06-16
    // Use the effectivePlugins, editor hangs, b'coz of missing default core plugins
    return createEmptyEditorState(
      schema,
      defaultSchema,
      plugins,
      defaultPlugins
    );
  }

  // [FS] IRAD-1067 2020-09-19
  // Handle gracefully when error thrown on invalid json
  let doc = null;

  try {
    doc = editorSchema.nodeFromJSON(json);
  } catch (error) {
    return null;
  }

  return EditorState.create({
    doc: doc,
    schema: editorSchema,
    plugins: effectivePlugins,
  });
}
