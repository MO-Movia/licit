import { EditorState, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { CellSelection, tableNodes } from 'prosemirror-tables';
import { ResolvedPos, Schema } from 'prosemirror-model';

import TableCellMenuPlugin from './tableCellMenuPlugin';
import findActionableCell from '../findActionableCell';
import { createPopUp } from '@modusoperandi/licit-ui-commands';
import isElementFullyVisible from '../isElementFullyVisible';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { schema as baseSchema } from 'prosemirror-schema-basic';
import { builders } from 'prosemirror-test-builder';

// Mock dependencies
jest.mock('../findActionableCell', () => jest.fn());
jest.mock('@modusoperandi/licit-ui-commands', () => ({
    ...jest.requireActual('@modusoperandi/licit-ui-commands'),
    createPopUp: jest.fn(),
}));
jest.mock('../isElementFullyVisible', () => jest.fn());

describe('TableCellMenuPlugin', () => {
    let plugin: TableCellMenuPlugin;
    let editorView: EditorView;
    let state: EditorState;

    beforeEach(() => {
        plugin = new TableCellMenuPlugin();

        // Mock state and selection
        const mySchema = new Schema({
            nodes: {
                doc: {
                    attrs: { lineSpacing: { default: 'test' } },
                    content: 'block+',
                },
                paragraph: {
                    attrs: { lineSpacing: { default: 'test' } },
                    content: 'text*',
                    group: 'block',
                },
                heading: {
                    attrs: { lineSpacing: { default: 'test' } },
                    content: 'text*',
                    group: 'block',
                    defining: true,
                },
                bullet_list: {
                    content: 'list_item+',
                    group: 'block',
                },
                list_item: {
                    attrs: { lineSpacing: { default: 'test' } },
                    content: 'paragraph',
                    defining: true,
                },
                blockquote: {
                    attrs: { lineSpacing: { default: 'test' } },
                    content: 'block+',
                    group: 'block',
                },
                text: {
                    inline: true,
                },
            },
        });
        const dummyDoc = mySchema.node('doc', null, [
            mySchema.node('heading', { marks: [] }, [mySchema.text('Heading 1')]),
            mySchema.node('paragraph', { marks: [] }, [
                mySchema.text('This is a paragraph'),
            ]),
            mySchema.node('bullet_list', { marks: [] }, [
                mySchema.node('list_item', { marks: [] }, [
                    mySchema.node('paragraph', { marks: [] }, [
                        mySchema.text('List item 1'),
                    ]),
                ]),
                mySchema.node('list_item', { marks: [] }, [
                    mySchema.node('paragraph', { marks: [] }, [
                        mySchema.text('List item 2'),
                    ]),
                ]),
            ]),
            mySchema.node('blockquote', { marks: [] }, [
                mySchema.node('paragraph', { marks: [] }, [
                    mySchema.text('This is a blockquote'),
                ]),
            ]),
        ]);

        // Mock ProseMirror editor state
        state = {
            doc: dummyDoc,
            schema: mySchema,
            selection: {},
            tr: {
                setSelection: jest.fn().mockReturnThis(),
            },
        } as unknown as EditorState;
        editorView = {
            state,
            readOnly: false,
            disabled: false,
            dispatch: jest.fn(),
            domAtPos: jest.fn().mockReturnValue({ node: document.createElement('td') }),
        } as unknown as EditorView;
    });

    it('should create a new plugin instance', () => {
        expect(plugin).toBeInstanceOf(TableCellMenuPlugin);
    });

    it('should not create popup when no actionable cell is found', () => {
        (findActionableCell as jest.Mock).mockReturnValue(null);

        const tooltipView = plugin.spec.view!(editorView);
        tooltipView.update(editorView, state);

        expect(findActionableCell).toHaveBeenCalledWith(state);
        expect(createPopUp).not.toHaveBeenCalled();
    });

    it('should call destroy if domFound  is null', () => {
        (findActionableCell as jest.Mock).mockReturnValue({ pos: 10 });
        (createPopUp as jest.Mock).mockReturnValue({ close: jest.fn(), update: jest.fn() });
        const mockPopup = { close: jest.fn() };

        const tooltipView = plugin.spec.view!(editorView);
        editorView.domAtPos = jest.fn().mockReturnValue(null);
        (tooltipView as any)._popUp = mockPopup;
        tooltipView.update(editorView, state);
        expect(findActionableCell).toHaveBeenCalledWith(state);
        expect(createPopUp).not.toHaveBeenCalled();
        expect(mockPopup.close).toHaveBeenCalled();
    });

    it('should create popup when actionable cell is found and visible', () => {
        (findActionableCell as jest.Mock).mockReturnValue({ pos: 10 });
        (isElementFullyVisible as jest.Mock).mockReturnValue(true);
        (createPopUp as jest.Mock).mockReturnValue({ close: jest.fn(), update: jest.fn() });

        const tooltipView = plugin.spec.view!(editorView);
        tooltipView.update(editorView, state);

        expect(createPopUp).toHaveBeenCalled();
    });

    it('should close existing popup if cell is not fully visible', () => {
        (findActionableCell as jest.Mock).mockReturnValue({ pos: 10 });
        (isElementFullyVisible as jest.Mock).mockReturnValue(false);

        const tooltipView = plugin.spec.view!(editorView);
        tooltipView.update(editorView, state);

        expect(createPopUp).not.toHaveBeenCalled();
    });

    it('should set actionNode when result is found and selection is a CellSelection', () => {
        (findActionableCell as jest.Mock).mockReturnValue({ pos: 10 });
        (isElementFullyVisible as jest.Mock).mockReturnValue(true);
        (createPopUp as jest.Mock).mockReturnValue({ close: jest.fn(), update: jest.fn() });

        const schema = new Schema({
            nodes: baseSchema.spec.nodes.append(
                tableNodes({
                    tableGroup: 'block',
                    cellContent: 'block+',
                    cellAttributes: {
                        test: { default: 'default' },
                    },
                }),
            ),
            marks: baseSchema.spec.marks,
        });

        const nodeBuilders = builders(schema, {
            p: { nodeType: 'paragraph' },
            tr: { nodeType: 'table_row' },
            td: { nodeType: 'table_cell' },
            th: { nodeType: 'table_header' },
        });

        const { doc, table, tr, p, td, th } = nodeBuilders;
        const cEmpty = td(p());

        const t = doc(
            table(
                tr(/* 2*/ cEmpty, /* 6*/ cEmpty, /*10*/ cEmpty),
                tr(/*16*/ cEmpty, /*20*/ cEmpty, /*24*/ cEmpty),
                tr(/*30*/ cEmpty, /*34*/ cEmpty, /*36*/ cEmpty),
            ),
        );

        let testState = EditorState.create({
            doc: t,
            selection: CellSelection.create(t, 2, 24),
        });

        editorView.state = testState;

        const tooltipView = plugin.spec.view!(editorView);
        tooltipView.update(editorView, testState);

        expect(createPopUp).toHaveBeenCalled();

        (tooltipView as any)._popUp = null;
        (tooltipView as any)._cellElement = null;
        (tooltipView as any)._onScroll();

        (tooltipView as any)._scrollHandle = { dispose: jest.fn() };
        (tooltipView as any)._onClose();
        expect((tooltipView as any)._scrollHandle).toBeNull()
    });
});
