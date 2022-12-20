// @flow
import {baseKeymap} from 'prosemirror-commands';
import {dropCursor} from 'prosemirror-dropcursor';
import {gapCursor} from 'prosemirror-gapcursor';
import {history} from 'prosemirror-history';
import {keymap} from 'prosemirror-keymap';
import {Schema} from 'prosemirror-model';
import {Plugin, PluginKey} from 'prosemirror-state';
import ContentPlaceholderPlugin from './ContentPlaceholderPlugin';
import CursorPlaceholderPlugin from './CursorPlaceholderPlugin';
import EditorPageLayoutPlugin from './EditorPageLayoutPlugin';
import LinkTooltipPlugin from './LinkTooltipPlugin';
import SelectionPlaceholderPlugin from './SelectionPlaceholderPlugin';
import TablePlugins from './TablePlugins';
import buildInputRules from './buildInputRules';
import createEditorKeyMap from './createEditorKeyMap';

// Creates the default plugin for the editor.
export default class DefaultEditorPlugins {
  plugins: Array<Plugin>;

  constructor(schema: Schema) {
    this.plugins = [
      new ContentPlaceholderPlugin(),
      new CursorPlaceholderPlugin(),
      new EditorPageLayoutPlugin(),
      new LinkTooltipPlugin(),
      new SelectionPlaceholderPlugin(),
      this.setPluginKey(buildInputRules(schema), 'InputRules'),
      this.setPluginKey(dropCursor(), 'DropCursor'),
      this.setPluginKey(gapCursor(), 'GapCursor'),
      history(),
      this.setPluginKey(keymap(createEditorKeyMap()), 'EditorKeyMap'),
      this.setPluginKey(keymap(baseKeymap), 'BaseKeymap'),
    ].concat(TablePlugins);
  }
  // [FS] IRAD-1005 2020-07-07
  // Upgrade outdated packages.
  // set plugin keys so that to avoid duplicate key error when keys are assigned automatically.
  setPluginKey(plugin: Plugin, key: string) {
    plugin.spec.key = new PluginKey(key + 'Plugin');
    plugin.key = plugin.spec.key.key;
    return plugin;
  }

  get(): Array<Plugin> {
    return this.plugins;
  }
}
