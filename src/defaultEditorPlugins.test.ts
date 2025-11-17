/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { Schema } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import DefaultEditorPlugins from './defaultEditorPlugins';
import ContentPlaceholderPlugin from './plugins/contentPlaceholderPlugin';
import CursorPlaceholderPlugin from './plugins/cursorPlaceholderPlugin';
import EditorPageLayoutPlugin from './plugins/editorPageLayoutPlugin';
import LinkTooltipPlugin from './plugins/linkTooltipPlugin';
import SelectionPlaceholderPlugin from './plugins/selectionPlaceholderPlugin';
import buildInputRules from './buildInputRules';
import { setPluginKey } from '@modusoperandi/licit-doc-attrs-step';
import TableCellMenuPlugin from './plugins/tableCellMenuPlugin';

jest.mock('./plugins/contentPlaceholderPlugin', () => jest.fn(() => new Plugin({})));
jest.mock('./plugins/cursorPlaceholderPlugin', () => jest.fn(() => new Plugin({})));
jest.mock('./plugins/editorPageLayoutPlugin', () => jest.fn(() => new Plugin({})));
jest.mock('./plugins/linkTooltipPlugin', () => jest.fn(() => new Plugin({})));
jest.mock('./plugins/selectionPlaceholderPlugin', () => jest.fn(() => new Plugin({})));
jest.mock('./plugins/tableCellMenuPlugin', () => jest.fn(() => new Plugin({})));
jest.mock('./buildInputRules', () => jest.fn(() => new Plugin({})));
jest.mock('./createEditorKeyMap', () => jest.fn(() => ({})));
jest.mock('@modusoperandi/licit-doc-attrs-step', () => ({
  setPluginKey: jest.fn((plugin: Plugin, _key: string): Plugin => plugin),
}));

describe('DefaultEditorPlugins', () => {
    let schema: Schema;

    beforeEach(() => {
        schema = new Schema({
            nodes: {
                doc: {},
                paragraph: {},
                text: {},
            },
            marks: {},
        });
    });

    test('should initialize with the expected plugins', () => {
        const editorPlugins = new DefaultEditorPlugins(schema);
        const plugins = editorPlugins.get();

        expect(plugins).toHaveLength(8);
        expect(ContentPlaceholderPlugin).toHaveBeenCalledTimes(1);
        expect(CursorPlaceholderPlugin).toHaveBeenCalledTimes(1);
        expect(EditorPageLayoutPlugin).toHaveBeenCalledTimes(1);
        expect(LinkTooltipPlugin).toHaveBeenCalledTimes(1);
        expect(SelectionPlaceholderPlugin).toHaveBeenCalledTimes(1);
        expect(TableCellMenuPlugin).toHaveBeenCalledTimes(1);
        expect(buildInputRules).toHaveBeenCalledWith(schema);
        expect(setPluginKey).toHaveBeenCalledWith(expect.any(Plugin), 'InputRules');
        expect(setPluginKey).toHaveBeenCalledWith(expect.any(Plugin), 'EditorKeyMap');
    });

    test('should return an array of Plugin instances', () => {
        const editorPlugins = new DefaultEditorPlugins(schema);
        const plugins = editorPlugins.get();

        expect(Array.isArray(plugins)).toBe(true);
        plugins.forEach((plugin) => {
            expect(plugin).toBeInstanceOf(Plugin);
        });
    });
});
