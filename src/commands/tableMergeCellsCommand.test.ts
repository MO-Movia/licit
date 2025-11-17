/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { Editor } from '@tiptap/react';
import TableMergeCellsCommand from './tableMergeCellsCommand';
import { ResolvedPos, Schema } from 'prosemirror-model';
import { CellSelection } from 'prosemirror-tables';

// Mock Editor (used by TableMergeCellsCommand)
jest.mock('@tiptap/react', () => {
  return {
    Editor: jest.fn().mockImplementation(() => ({
      commands: {
        mergeCells: jest.fn(),
      },
    })),
  };
});

jest.mock('prosemirror-tables', () => {
  const actual = jest.requireActual<typeof import('prosemirror-tables')>('prosemirror-tables');
  return {
    ...actual,
    CellSelection: jest.fn() as unknown as typeof actual.CellSelection,
  };
});




jest.mock('prosemirror-model', (): typeof import('prosemirror-model') => ({
  ...jest.requireActual<typeof import('prosemirror-model')>('prosemirror-model'),
  ResolvedPos: jest.fn().mockImplementation((pos: number) => ({
    pos,
    node: jest.fn(() => ({ type: { name: 'cell' } })),
    parent: jest.fn(),
    before: jest.fn(),
    after: jest.fn(),
  })) as unknown as typeof import('prosemirror-model').ResolvedPos,
}));


describe('TableMergeCellsCommand', () => {
  let command: TableMergeCellsCommand;
  let mockState: EditorState;

  beforeEach(() => {
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

    // Mock the editor instance to check if the mergeCells method gets called
    command = new TableMergeCellsCommand();
    mockState = {
      doc: dummyDoc,
      schema: mySchema,
      selection: {},
      tr: {
        setSelection: jest.fn().mockReturnThis(),
      },
    } as unknown as EditorState;
  });

  it('should always return true for isEnabled', () => {
    // Test that isEnabled method always returns true
    expect(command.isEnabled(mockState)).toBe(true);
  });

  it('should return the result of mergeCells when execute is called', () => {
    // Mock the return value of mergeCells
    jest.spyOn(command, 'getEditor').mockReturnValue({
      commands: {
        mergeCells: () => {
          return true;
        },
      },
    } as unknown as Editor);

    // Define a simple schema that includes tables
    const schema = new Schema({
      nodes: {
        doc: {
          content: 'block+',
        },
        paragraph: {
          content: 'text*',
          group: 'block',
        },
        text: {
          inline: true,
        },
        table: {
          content: 'table_row+', // table can have one or more table_rows
          group: 'block', // Ensures table is a block-level node
          tableRole: 'table',
        },
        table_row: {
          content: 'table_cell+', // table_row must contain one or more table_cells
          tableRole: 'row',
        },
        table_cell: {
          content: 'text*', // table_cell can contain text or other inline nodes
          tableRole: 'cell',
        },
      },
      marks: {},
    });

    // Create a simple table with 2 rows and 3 columns
    const doc = schema.node('doc', null, [
      schema.node('table', null, [
        schema.node('table_row', null, [
          schema.node('table_cell', null, [schema.text('Cell 1')]),
          schema.node('table_cell', null, [schema.text('Cell 2')]),
          schema.node('table_cell', null, [schema.text('Cell 3')]),
        ]),
        schema.node('table_row', null, [
          schema.node('table_cell', null, [schema.text('Cell 4')]),
          schema.node('table_cell', null, [schema.text('Cell 5')]),
          schema.node('table_cell', null, [schema.text('Cell 6')]),
        ]),
      ]),
    ]);

    // Mock ResolvedPos instances for $anchorCell and $headCell
    const $anchorCell = new ResolvedPos(); // Example position for $anchorCell
    const $headCell = new ResolvedPos(); // Example position for $headCell

    // Mock the selection as an instance of CellSelection
    const selection = new CellSelection($anchorCell, $headCell);

    mockState = {
      doc: doc,
      schema: schema,
      selection: selection,
      tr: {
        setSelection: jest.fn().mockReturnThis(),
      },
    } as unknown as EditorState;

    // Call the execute method and check the return value
    const result = command.execute(mockState);

    // Verify that execute returns the expected value
    expect(result).toBe(true);
  });

  it('should return the result of mergeCells as false if it is not an instance of CellSelection', () => {
    // Mock the return value of mergeCells
    jest.spyOn(command, 'getEditor').mockReturnValue({
      commands: {
        mergeCells: () => {
          return true;
        },
      },
    } as unknown as Editor);

    // Define a simple schema that includes tables
    // Define a simple schema that includes tables
    const schema = new Schema({
      nodes: {
        doc: {
          content: 'block+',
        },
        paragraph: {
          content: 'text*',
          group: 'block',
        },
        text: {
          inline: true,
        },
        table: {
          content: 'table_row+', // table can have one or more table_rows
          group: 'block', // Ensures table is a block-level node
          tableRole: 'table',
        },
        table_row: {
          content: 'table_cell+', // table_row must contain one or more table_cells
          tableRole: 'row',
        },
        table_cell: {
          content: 'text*', // table_cell can contain text or other inline nodes
          tableRole: 'cell',
        },
      },
      marks: {},
    });

    // Create a simple table with 2 rows and 3 columns
    const doc = schema.node('doc', null, [
      schema.node('table', null, [
        schema.node('table_row', null, [
          schema.node('table_cell', null, [schema.text('Cell 1')]),
          schema.node('table_cell', null, [schema.text('Cell 2')]),
          schema.node('table_cell', null, [schema.text('Cell 3')]),
        ]),
        schema.node('table_row', null, [
          schema.node('table_cell', null, [schema.text('Cell 4')]),
          schema.node('table_cell', null, [schema.text('Cell 5')]),
          schema.node('table_cell', null, [schema.text('Cell 6')]),
        ]),
      ]),
    ]);

    const cellSelection = {} as CellSelection;
    mockState = {
      doc: doc,
      schema: schema,
      selection: cellSelection,
      tr: {
        setSelection: jest.fn().mockReturnThis(),
      },
    } as unknown as EditorState;

    // Call the execute method and check the return value
    const result = command.execute(mockState);

    // Verify that execute returns the expected value
    expect(result).toBe(false);
  });

  it('should call the getEditor method', () => {
    // Spy on the getEditor method to ensure it is called
    const getEditorSpy = jest.spyOn(command, 'getEditor');

    // Call the method
    command.getEditor();

    // Verify that getEditor was called
    expect(getEditorSpy).toHaveBeenCalled();
  });

  it('should handle waitForUserInput', async () => {
    // Test the behavior of waitForUserInput method
    const result = await command.waitForUserInput(mockState);
    expect(result).toBeNull(); // The mocked version returns null
  });

  it('should handle executeWithUserInput', () => {
    // Test the behavior of executeWithUserInput method
    const result = command.executeWithUserInput(mockState);
    expect(result).toBe(false); // The mocked version returns false
  });

  it('should handle cancel', () => {
    // Test the cancel method
    expect(() => command.cancel()).not.toThrow();
  });

  describe('executeCustom', () => {
    it('should return the given Transform', () => {
      const mockTransform = {} as Transform;
      const result = command.executeCustom(mockState, mockTransform, 0, 1);
      expect(result).toBe(mockTransform);
    });
  });
});
