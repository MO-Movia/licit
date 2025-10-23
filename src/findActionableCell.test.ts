import { Schema, Node } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';
import { CellSelection, TableMap } from 'prosemirror-tables';
import { findParentNodeOfType } from 'prosemirror-utils';
import findActionableCell from './findActionableCell';

// Mock the module and findParentNodeOfType
jest.mock('prosemirror-utils', () => ({
    ...jest.requireActual('prosemirror-utils'),
    findParentNodeOfType: jest.fn(),
}));

const tableNodes = {
    table: {
        content: 'tableRow+',
        group: 'block',
    },
    tableRow: {
        content: 'tableCell+',
    },
    tableCell: {
        content: 'block+',
    },
    tableHeader: {
        content: 'block+',
    },
};

xdescribe('findActionableCell', () => {
    let schema: Schema;

    beforeAll(() => {
        schema = new Schema({
            nodes: {
                doc: { content: 'block+' },
                text: { group: 'inline' },
                paragraph: { content: 'inline*', group: 'block', toDOM: () => ['p', 0] },
            },
        });

        schema.spec.nodes.append(tableNodes);
    });

    beforeEach(() => {
        jest.clearAllMocks(); // Reset mocks before each test
    });

    function createStateWithTable(includeHeader = false) {
        const rows = [
            schema.node('tableRow', null, [
                schema.node(includeHeader ? 'tableHeader' : 'tableCell', null, [
                    schema.node('paragraph', null, [schema.text('Header1')]),
                ]),
                schema.node(includeHeader ? 'tableHeader' : 'tableCell', null, [
                    schema.node('paragraph', null, [schema.text('Header2')]),
                ]),
            ]),
            schema.node('tableRow', null, [
                schema.node('tableCell', null, [schema.node('paragraph', null, [schema.text('A1')])]),
                schema.node('tableCell', null, [schema.node('paragraph', null, [schema.text('A2')])]),
            ]),
        ];

        const tableNode = schema.node('table', null, rows);
        const doc = schema.node('doc', null, [tableNode]);
        return EditorState.create({ doc });
    }

    it('should return null if schema has no table nodes', () => {
        const emptySchema = new Schema({
            nodes: {
                doc: { content: 'block+' },
                text: { group: 'inline' },
                paragraph: { content: 'inline*', group: 'block' },
            },
        });

        const doc = emptySchema.node('doc', null, [
            emptySchema.node('paragraph', null, [emptySchema.text('Hello World')]),
        ]);

        const state = EditorState.create({ doc });

        expect(findActionableCell(state)).toBeNull();
    });

    it('should return actionable cell when text selection is inside a table cell', () => {


        const state = createStateWithTable(false);
        const tableNode = state.doc.firstChild!;
        const tablePos = state.doc.resolve(1);
        const tableMap = TableMap.get(tableNode);
        const firstCellPos = tablePos.start() + tableMap.map[0]; // First table_cell position


        // Mock `findParentNodeOfType` to return a fake parent node
        (findParentNodeOfType as jest.Mock).mockImplementation(() => () => ({
            node: tableNode, // Fake table cell node
            pos: 2, // Example position
        }));

        const selection = new TextSelection(state.doc.resolve(firstCellPos));
        const newState = state.apply(state.tr.setSelection(selection));


        const result = findActionableCell(newState);

        expect(result).not.toBeNull();
        expect(result!.node.type.name).toBe('table_cell');
    });

    it('should return actionable cell when text selection is inside a table header', () => {
        const state = createStateWithTable(true);
        const tableNode = state.doc.firstChild!;
        const tablePos = state.doc.resolve(1);
        const tableMap = TableMap.get(tableNode);
        const headerCellPos = tablePos.start() + tableMap.map[0]; // First table_header position

        const selection = new TextSelection(state.doc.resolve(headerCellPos));
        const newState = state.apply(state.tr.setSelection(selection));

        const result = findActionableCell(newState);

        expect(result).not.toBeNull();
        expect(result!.node.type.name).toBe('table_header');
    });

    it('should return null when text selection is outside a table', () => {
        // Mock `findParentNodeOfType` to return a fake parent node
        (findParentNodeOfType as jest.Mock).mockImplementation(() => () => (null));

        const doc = schema.node('doc', null, [
            schema.node('paragraph', null, [schema.text('Outside table')]),
        ]);
        const selection = new TextSelection(doc.resolve(1));
        const state = EditorState.create({ doc, selection });

        expect(findActionableCell(state)).toBeNull();
    });

    it('should return actionable cell when selection is a CellSelection', () => {
        const state = createStateWithTable(false);
        const tableNode = state.doc.firstChild!;
        const tablePos = state.doc.resolve(1);
        const tableMap = TableMap.get(tableNode);
        const firstCellPos = tablePos.start() + tableMap.map[0]; // First cell

        const selection = new CellSelection(state.doc.resolve(firstCellPos));
        const newState = state.apply(state.tr.setSelection(selection));

        const result = findActionableCell(newState);

        expect(result).not.toBeNull();
        expect(result!.node.type.name).toBe('table_cell');
    });

    it('should return null for unsupported selection types', () => {
        const state = createStateWithTable(false);

        state.tr.setSelection = {} as any;
        state.selection = {} as any;
        expect(findActionableCell(state)).toBeNull();
    });

    it('should return null if from !== to', () => {
        const state = createStateWithTable(false);

        const selection = TextSelection.create(state.doc, 1, 3);
        const newState = state.apply(state.tr.setSelection(selection));

        expect(findActionableCell(newState)).toBeNull();
    });
});

