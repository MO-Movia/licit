import { EditorState, TextSelection } from 'prosemirror-state';
import { schema } from 'prosemirror-schema-basic';
import { MARK_FONT_SIZE, HEADING } from '@modusoperandi/licit-ui-commands';
import findActiveFontSize from './findActiveFontSize';
import findActiveMark from './findActiveMark';
import { findParentNodeOfType } from 'prosemirror-utils';
import StrongMarkSpec from './specs/strongMarkSpec';

jest.mock('./findActiveMark', () => jest.fn());
// Mock the module and findParentNodeOfType
jest.mock('prosemirror-utils', () => ({
    ...jest.requireActual('prosemirror-utils'),
    findParentNodeOfType: jest.fn(),
}));

const createState = (selection, storedMarks = []) => {
    return {
        schema: {
            marks: {
                [MARK_FONT_SIZE]: StrongMarkSpec, // Use an existing valid mark
            },
            nodes: { [HEADING]: schema.nodes.heading },
        },
        doc: schema.node('doc', null, [
            schema.node('paragraph', null, [
                schema.text('Hello World')
            ]),
        ]),
        selection,
        tr: { storedMarks },
        storedMarks,
    } as unknown as EditorState;
};

afterEach(() => {
    jest.clearAllMocks();
});

describe('findActiveFontSize', () => {
    it('returns default size when no mark is present', () => {
        const doc = schema.node('doc', null, [schema.node('paragraph', null, [])]);
        const state = createState(EditorState.create({ doc }).selection);
        expect(findActiveFontSize(state)).toBe('11');
    });

    it('returns font size from storedMarks when selection is empty', () => {
        const doc = schema.node('doc', null, [
            schema.node('paragraph', null, [schema.text('Test text')]),
        ]);
        const selection = TextSelection.create(doc, 0);
        const storedMarks = [{ type: StrongMarkSpec, attrs: { pt: 18 } }];

        const state = createState(selection, storedMarks);
        expect(findActiveFontSize(state)).toBe('18');
    });

    it('should return default font size if $cursor.marks has value', () => {
        const doc = schema.node('doc', null, [
            schema.node('paragraph', null, [schema.text('Test text')]),
        ]);

        const selection = { ...EditorState.create({ doc }).selection, empty: true, $cursor: { marks: jest.fn() } };
        const state = {
            schema: {
                marks: {
                    [MARK_FONT_SIZE]: StrongMarkSpec,
                },
                nodes: { [HEADING]: schema.nodes.heading },
            },
            doc: schema.node('doc', null, [
                schema.node('paragraph', null, [
                    schema.text('Hello World')
                ]),
            ]),
            selection,
            tr: {},
        } as unknown as EditorState;

        expect(findActiveFontSize(state)).toBe('11');
    });

    it('returns default size when no markType is present', () => {
        (findActiveMark as jest.Mock).mockReturnValue({ attrs: { pt: 14 } });
        const doc = schema.node('doc', null, [
            schema.node('paragraph', null, [schema.text('Hello, world!')])
        ]);

        const selection = { ...EditorState.create({ doc }).selection, empty: false };
        const state = {
            schema: {
                marks: {
                },
                nodes: { [HEADING]: schema.nodes.heading },
            },
            doc: schema.node('doc', null, [
                schema.node('paragraph', null, [
                    schema.text('Hello World')
                ]),
            ]),
            selection
        } as unknown as EditorState;

        expect(findActiveFontSize(state)).toBe('11');
    });

    it('returns font size from active mark in selection', () => {
        (findActiveMark as jest.Mock).mockReturnValue({ attrs: { pt: 14 } });
        const doc = schema.node('doc', null, [
            schema.node('paragraph', null, [schema.text('Hello, world!')])
        ]);
        const state = createState({ ...EditorState.create({ doc }).selection, empty: false });

        expect(findActiveFontSize(state)).toBe('14');
    });


    it('should return the default size if heading is empty', () => {
        (findActiveMark as jest.Mock).mockReturnValue(null);


        const doc = schema.node('doc', null, [
            schema.node('paragraph', null, [schema.text('Hello, world!')])
        ]);

        const selection = { ...EditorState.create({ doc }).selection, empty: false };
        const state = {
            schema: {
                marks: {
                    [MARK_FONT_SIZE]: StrongMarkSpec,
                },
                nodes: {},
            },
            doc: schema.node('doc', null, [
                schema.node('paragraph', null, [
                    schema.text('Hello World')
                ]),
            ]),
            selection
        } as unknown as EditorState;

        expect(findActiveFontSize(state)).toBe('11');
    });

    it('should returns default size if findParentNodeOfType is null', () => {
        (findActiveMark as jest.Mock).mockReturnValue(null);
        (findParentNodeOfType as jest.Mock).mockReturnValue(jest.fn().mockReturnValue(null));

        const doc = schema.node('doc', null, [
            schema.node('paragraph', null, [schema.text('Hello, world!')])
        ]);
        const state = createState({ ...EditorState.create({ doc }).selection, empty: false });
        expect(findActiveFontSize(state)).toBe('11');
    });

    it('returns font size based on heading level', () => {
        (findActiveMark as jest.Mock).mockReturnValue(null);
        (findParentNodeOfType as jest.Mock).mockReturnValue(jest.fn().mockReturnValue({
            node: { attrs: { level: '2' } },
        }));

        const doc = schema.node('doc', null, [
            schema.node('paragraph', null, [schema.text('Hello, world!')])
        ]);
        const state = createState({ ...EditorState.create({ doc }).selection, empty: false });
        expect(findActiveFontSize(state)).toBe(18);
    });

    it('returns default size if no heading or mark is found', () => {
        (findActiveMark as jest.Mock).mockReturnValue(null);
        (findParentNodeOfType as jest.Mock).mockReturnValue(null);

        const doc = schema.node('doc', null, [schema.node('paragraph', null, [])]);
        const state = createState(EditorState.create({ doc }).selection);
        expect(findActiveFontSize(state)).toBe('11');
    });
});
