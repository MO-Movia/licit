import { EditorState, Plugin, TextSelection, Transaction } from 'prosemirror-state';
import { schema } from 'prosemirror-schema-basic';
import { DOMParser } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

import SelectionPlaceholderPlugin, {
    showSelectionPlaceholder,
    hideSelectionPlaceholder,
} from './selectionPlaceholderPlugin';

describe('SelectionPlaceholderPlugin', () => {
    let view: EditorView;

    beforeEach(() => {
        const content = document.createElement('div');
        content.innerHTML = '<p>Hello World</p>';

        const doc = DOMParser.fromSchema(schema).parse(content);

        const state = EditorState.create({
            doc,
            schema,
            plugins: [new SelectionPlaceholderPlugin()],
        });

        const el = document.createElement('div');
        document.body.appendChild(el);

        view = new EditorView(el, {
            state,
        });
    });

    afterEach(() => {
        view.destroy();
    });

    it('should initialize plugin with empty decoration set', () => {
        const plugin = view.state.plugins.find(
            (p) => p instanceof SelectionPlaceholderPlugin
        ) as Plugin;

        const pluginState = plugin.getState(view.state);
        expect(pluginState.find()).toHaveLength(0);
    });

    it('should add a selection placeholder decoration', () => {
        const { state } = view;
        const { tr } = state;

        let newTr = showSelectionPlaceholder(state, tr) as Transaction;
        newTr.getMeta = jest.fn().mockReturnValue({ add: { from: 1, to: 5 } });
        const plugin = view.state.plugins.find(
            (p) => p instanceof SelectionPlaceholderPlugin
        ) as Plugin;

        const nextState = state.apply(newTr);
        const decorations = plugin.getState(nextState);

        expect(decorations.find()).toHaveLength(1);
        const deco = decorations.find()[0];
        expect(deco.spec.id.name).toBe('SelectionPlaceholderPlugin');
        expect(deco.type.attrs.class).toBe('czi-selection-placeholder');
    });
    it('should add a selection placeholder when selection is created', () => {
        const { state } = view;
        const selection = TextSelection.create(state.doc, 1, 5);
        const tr = state.tr.setSelection(selection);

        let newTr = showSelectionPlaceholder(state, tr) as Transaction;
        const plugin = view.state.plugins.find(
            (p) => p instanceof SelectionPlaceholderPlugin
        ) as Plugin;

        const nextState = state.apply(newTr);
        const decorations = plugin.getState(nextState);

        expect(decorations.find()).toHaveLength(1);
        const deco = decorations.find()[0];
        expect(deco.spec.id.name).toBe('SelectionPlaceholderPlugin');
        expect(deco.type.attrs.class).toBe('czi-selection-placeholder');
    });
    it('Selection should be empty if set not provided', () => {
        const { state } = view;
        const { tr } = state;

        let newTr = showSelectionPlaceholder(state, tr) as Transaction;
        newTr.getMeta = jest.fn().mockReturnValue({ remove: jest.fn() });
        const plugin = view.state.plugins.find(
            (p) => p instanceof SelectionPlaceholderPlugin
        ) as Plugin;

        const nextState = state.apply(newTr);
        const decorations = plugin.getState(nextState);
        expect(decorations.find()).toHaveLength(0);
    });

    it('should not add placeholder if selection is empty', () => {
        const emptyTr = view.state.tr.setSelection(view.state.selection);
        const newTr = showSelectionPlaceholder(view.state, emptyTr) as Transaction;;
        expect(newTr.getMeta(SelectionPlaceholderPlugin as unknown as Plugin)).toBeUndefined();
    });

    it('should remove a selection placeholder decoration', () => {
        const { state } = view;
        let tr = showSelectionPlaceholder(state, state.tr) as Transaction;
        const plugin = view.state.plugins.find(
            (p) => p instanceof SelectionPlaceholderPlugin
        ) as Plugin;

        const nextState = state.apply(tr);
        const withPlaceholder = EditorState.create({
            schema,
            doc: nextState.doc,
            plugins: [plugin],
        });

        tr = hideSelectionPlaceholder(withPlaceholder, withPlaceholder.tr) as Transaction;
        const finalState = withPlaceholder.apply(tr);

        const decorations = plugin.getState(finalState);
        expect(decorations.find()).toHaveLength(0);
    });

    it('should hide placeholder decoration', () => {
        const { state } = view;
        const selection = TextSelection.create(state.doc, 1, 5);
        const tr = state.tr.setSelection(selection);

        let newTr = showSelectionPlaceholder(state, tr) as Transaction;
        const plugin = view.state.plugins.find(
            (p) => p instanceof SelectionPlaceholderPlugin
        ) as Plugin;

        const nextState = state.apply(newTr);

        let result = hideSelectionPlaceholder(nextState, nextState.tr) as Transaction;

        expect((result as any).meta.SelectionPlaceholderPlugin$.remove).toBeDefined();

    });

    it('Should return same tr if plugin is not available', () => {
        const { state } = view;

        const stateWithoutPlugin = EditorState.create({
            doc: state.doc,
            schema,
        });

        const selection = TextSelection.create(stateWithoutPlugin.doc, 1, 5);
        const tr = stateWithoutPlugin.tr.setSelection(selection);

        let newTr = showSelectionPlaceholder(stateWithoutPlugin, tr) as Transaction;
        expect(newTr).toBe(tr);

    });

    it('Should state tr if tr is null for showSelectionPlaceholder', () => {
        const { state } = view;

        const stateWithoutPlugin = EditorState.create({
            doc: state.doc,
            schema,
        });

        let newTr = showSelectionPlaceholder(stateWithoutPlugin) as Transaction;
        expect(newTr).toEqual(state.tr);

    });

    it('should be a singleton plugin', () => {
        const firstInstance = new SelectionPlaceholderPlugin();
        const secondInstance = new SelectionPlaceholderPlugin();
        expect(firstInstance).toBe(secondInstance);
    });
});
