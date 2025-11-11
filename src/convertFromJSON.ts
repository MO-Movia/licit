import { Schema } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

export interface LicitPlugin extends Plugin {
  getEffectiveSchema: (schema: Schema) => Schema;
  initKeyCommands: () => Plugin;
  initButtonCommands: (theme: unknown) => UICommand;
}

export function getEffectiveSchema(
  defaultSchema: Schema,
  defaultPlugins: Array<Plugin>,
  plugins?: Array<Plugin>
): Schema {
  let editorSchema: Schema = defaultSchema;

  // Loads plugins and its corresponding schema in editor
  const effectivePlugins = defaultPlugins;

  if (plugins) {
    for (const p of plugins) {
      if (!effectivePlugins.includes(p)) {
        effectivePlugins.push(p);
        if ('getEffectiveSchema' in p) {
          editorSchema = (p as LicitPlugin).getEffectiveSchema(editorSchema);
        }

        if ('initKeyCommands' in p) {
          effectivePlugins.push((p as LicitPlugin).initKeyCommands());
        }
      }
    }
  }

  return editorSchema;
}
