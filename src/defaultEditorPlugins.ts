/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { Schema } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import ContentPlaceholderPlugin from './plugins/contentPlaceholderPlugin';
import CursorPlaceholderPlugin from './plugins/cursorPlaceholderPlugin';
import EditorPageLayoutPlugin from './plugins/editorPageLayoutPlugin';
import LinkTooltipPlugin from './plugins/linkTooltipPlugin';
import SelectionPlaceholderPlugin from './plugins/selectionPlaceholderPlugin';
import buildInputRules from './buildInputRules';
import { setPluginKey } from '@modusoperandi/licit-doc-attrs-step';
import TableCellMenuPlugin from './plugins/tableCellMenuPlugin';
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
      setPluginKey(buildInputRules(schema), 'InputRules') as Plugin,
      setPluginKey(keymap(createEditorKeyMap()), 'EditorKeyMap') as Plugin,
      new TableCellMenuPlugin(),
    ];
  }

  get(): Array<Plugin> {
    return this.plugins;
  }
}
