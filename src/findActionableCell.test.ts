/**
 * @jest-environment jsdom
 */

import {Schema, Node as PMNode} from 'prosemirror-model';
import {
  EditorState,
  TextSelection,
  NodeSelection,
} from 'prosemirror-state';
import findActionableCell from './findActionableCell';
import {findParentNodeOfType} from 'prosemirror-utils';

// Mock the Prosemirror-utils helper used internally
// NOTE: We are using a global mock definition since you didn't provide the import for findParentNodeOfType
jest.mock('prosemirror-utils', () => ({
  findParentNodeOfType: jest.fn(() => jest.fn()),
}));

/* -------------------------
    Minimal schema with table support (Base Schema)
    ------------------------- */
const schema = new Schema({
  nodes: {
    doc: {content: 'block+'},
    text: {group: 'inline'},
    paragraph: {
      content: 'inline*',
      group: 'block',
      toDOM: () => ['p', 0],
    },
    table: {content: 'tableRow+', group: 'block', toDOM: () => ['table', 0]},
    tableRow: {content: '(tableCell | tableHeader)+', toDOM: () => ['tr', 0]},
    tableCell: {content: 'paragraph+', group: 'block', toDOM: () => ['td', 0]},
    tableHeader: {
      content: 'paragraph+',
      group: 'block',
      toDOM: () => ['th', 0],
    },
  },
});

function buildParagraph(
  text: string = '',
  targetSchema: Schema = schema
): PMNode {
  const contentText = text === '' ? ' ' : text;
  return targetSchema.nodes.paragraph.create(
    null,
    targetSchema.text(contentText)
  );
}

function buildTable(): PMNode {
  return schema.nodes.table.create(null, [
    schema.nodes.tableRow.create(null, [
      schema.nodes.tableCell.create(null, buildParagraph('A')),
      schema.nodes.tableCell.create(null, buildParagraph('B')),
    ]),
    schema.nodes.tableRow.create(null, [
      schema.nodes.tableCell.create(null, buildParagraph('C')),
      schema.nodes.tableCell.create(null, buildParagraph('D')),
    ]),
  ]);
}

describe('findActionableCell', () => {
  let doc: PMNode;
  let cellStarts: number[];

  beforeEach(() => {
    jest.clearAllMocks();
    doc = schema.node('doc', null, [buildParagraph(''), buildTable()]);
    cellStarts = [];
    doc.descendants((node, pos) => {
      if (
        node.type === schema.nodes.tableCell ||
        node.type === schema.nodes.tableHeader
      ) {
        cellStarts.push(pos);
      }
    });
  });

  test('returns null when tableCell and tableHeader are missing in schema', () => {
    const fakeSchema = new Schema({
      nodes: {
        doc: {content: 'block+'},
        paragraph: {content: 'inline*', group: 'block'},
        text: {group: 'inline'},
      },
    });
    const doc = fakeSchema.node('doc', null, [
      fakeSchema.nodes.paragraph.create(null, fakeSchema.text('Hello')),
    ]);
    const selection = TextSelection.create(doc, 1);
    const state = EditorState.create({doc, selection});

    expect(findActionableCell(state)).toBeNull();
  });

  test('returns null for TextSelection with non-collapsed range', () => {
    const selection = TextSelection.create(doc, 2, 4);
    const state = EditorState.create({doc, selection});
    expect(findActionableCell(state)).toBeNull();
  });

  test('returns null for non-TextSelection and non-CellSelection (NodeSelection)', () => {
    const tablePos = 3;
    const nodeSel = NodeSelection.create(doc, tablePos);
    const state = EditorState.create({doc, selection: nodeSel});

    expect(findActionableCell(state)).toBeNull();
  });
  test('covers (tdType && findParentNodeOfType(tdType)(selection))', () => {
    const doc = schema.node('doc', null, [buildTable()]);
    const selection = TextSelection.create(doc, 6); // cursor inside first cell
    const state = EditorState.create({doc, selection});

    findActionableCell(state);

    // Assert that findParentNodeOfType was called with tdType
    expect(findParentNodeOfType).toHaveBeenCalledWith(schema.nodes.tableCell);
  });
});
