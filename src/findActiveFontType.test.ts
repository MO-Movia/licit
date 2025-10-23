import { EditorState, TextSelection } from 'prosemirror-state';
import { schema } from 'prosemirror-schema-basic';
import { MARK_FONT_SIZE, HEADING, MARK_FONT_TYPE } from '@modusoperandi/licit-ui-commands';
import findActiveFontType from './findActiveFontType';
import findActiveMark from './findActiveMark';
import { findParentNodeOfType } from 'prosemirror-utils';
import StrongMarkSpec from './specs/strongMarkSpec';
import FontTypeMarkSpec from './specs/fontTypeMarkSpec';

jest.mock('./findActiveMark', () => jest.fn());

const createState = (selection, storedMarks = []) => {
    return {
        schema: {
            marks: {
                [MARK_FONT_TYPE]: FontTypeMarkSpec, // Use an existing valid mark
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

describe('findActiveFontType', () => {
    it('returns default font type when no mark is present', () => {
        const doc = schema.node('doc', null, [schema.node('paragraph', null, [])]);
        const state = createState(EditorState.create({ doc }).selection);
        expect(findActiveFontType(state)).toBe('Arial');
    });

    it('returns font type from storedMarks when selection is empty', () => {
        const doc = schema.node('doc', null, [
            schema.node('paragraph', null, [schema.text('Test text')]),
        ]);
        const selection = TextSelection.create(doc, 0);
        const storedMarks = [{ type: FontTypeMarkSpec, attrs: { name: 'dummy-font' } }];

        const state = createState(selection, storedMarks);
        expect(findActiveFontType(state)).toBe('dummy-font');
    });

    it('should return default font type if $cursor.marks has value', () => {
        const doc = schema.node('doc', null, [
            schema.node('paragraph', null, [schema.text('Test text')]),
        ]);

        const selection = { ...EditorState.create({ doc }).selection, empty: true, $cursor: { marks: jest.fn() } };
        const state = {
            schema: {
                marks: {
                    [MARK_FONT_TYPE]: FontTypeMarkSpec,
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

        expect(findActiveFontType(state)).toBe('Arial');
    });

    it('returns default type when no markType is present', () => {
        (findActiveMark as jest.Mock).mockReturnValue({ attrs: { name: 'dummy-font' } });
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

        expect(findActiveFontType(state)).toBe('Arial');
    });

    it('returns font type from active mark in selection', () => {
        (findActiveMark as jest.Mock).mockReturnValue({ attrs: { name: 'dummy-font' } });
        const doc = schema.node('doc', null, [
            schema.node('paragraph', null, [schema.text('Hello, world!')])
        ]);
        const state = createState({ ...EditorState.create({ doc }).selection, empty: false });

        expect(findActiveFontType(state)).toBe('dummy-font');
    });

    it('if marks not having font type then shpuld return default font', () => {
        (findActiveMark as jest.Mock).mockReturnValue(null);


        const doc = schema.node('doc', null, [
            schema.node('paragraph', null, [schema.text('Hello, world!')])
        ]);
        const state = createState({ ...EditorState.create({ doc }).selection, empty: false });
        expect(findActiveFontType(state)).toBe('Arial');
    });

});
