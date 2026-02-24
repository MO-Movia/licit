import { Schema } from 'prosemirror-model';
import { EditorState, TextSelection, Transaction } from 'prosemirror-state';
import LandscapeCommand from './LandscapeCommand';
import LandscapeSectionNodeSpec from '../specs/landscapeSectionNodeSpec';

describe('LandscapeCommand', () => {
  let schema: Schema;

  beforeEach(() => {
    schema = new Schema({
      nodes: {
        doc: { content: 'block+' },
        paragraph: { content: 'text*', group: 'block' },
        table: {
          content: 'table_row+',
          group: 'block',
          tableRole: 'table',
        },
        table_row: {
          content: 'table_cell+',
          tableRole: 'row',
        },
        table_cell: {
          content: 'block+',
          tableRole: 'cell',
        },
        landscape_section: LandscapeSectionNodeSpec,
        text: { group: 'inline' },
      },
      marks: {},
    });
  });

  test('inserts empty landscape section for collapsed selection', () => {
    const doc = schema.node('doc', null, [
      schema.node('paragraph', null, [schema.text('Hello')]),
    ]);
    const state = EditorState.create({
      schema,
      doc,
      selection: TextSelection.create(doc, 2),
    });
    const command = new LandscapeCommand();
    let applied: Transaction = null;

    const handled = command.execute(state, (tr) => {
      applied = tr;
    });

    expect(handled).toBe(true);
    expect(applied).toBeTruthy();
    expect(applied.doc.childCount).toBe(2);
    expect(applied.doc.child(1).type.name).toBe('landscape_section');
    expect(applied.doc.child(1).child(0).type.name).toBe('paragraph');
    expect(applied.doc.child(1).child(0).content.size).toBe(0);
  });

  test('wraps selected content in landscape section', () => {
    const doc = schema.node('doc', null, [
      schema.node('paragraph', null, [schema.text('Hello')]),
    ]);
    const state = EditorState.create({
      schema,
      doc,
      selection: TextSelection.create(doc, 1, 6),
    });
    const command = new LandscapeCommand();
    let applied: Transaction = null;

    const handled = command.execute(state, (tr) => {
      applied = tr;
    });

    expect(handled).toBe(true);
    expect(applied).toBeTruthy();
    expect(applied.doc.child(0).type.name).toBe('landscape_section');
  });

  test('wraps the entire table when cursor is inside a table cell', () => {
    const doc = schema.node('doc', null, [
      schema.node('paragraph', null, [schema.text('Before')]),
      schema.node('table', null, [
        schema.node('table_row', null, [
          schema.node('table_cell', null, [
            schema.node('paragraph', null, [schema.text('Cell')]),
          ]),
        ]),
      ]),
    ]);

    let cursorPos = -1;
    doc.descendants((node, pos) => {
      if (node.isText && node.text === 'Cell') {
        cursorPos = pos + 1;
        return false;
      }
      return true;
    });

    expect(cursorPos).toBeGreaterThan(0);

    const state = EditorState.create({
      schema,
      doc,
      selection: TextSelection.create(doc, cursorPos),
    });
    const command = new LandscapeCommand();
    let applied: Transaction = null;

    const handled = command.execute(state, (tr) => {
      applied = tr;
    });

    expect(handled).toBe(true);
    expect(applied).toBeTruthy();
    expect(applied.doc.child(1).type.name).toBe('landscape_section');
    expect(applied.doc.child(1).child(0).type.name).toBe('table');
  });

});
