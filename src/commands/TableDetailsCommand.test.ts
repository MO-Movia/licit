/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorState, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import TableDetailsCommand from './TableDetailsCommand';
import { createPopUp } from '@modusoperandi/licit-ui-commands';

jest.mock('@modusoperandi/licit-ui-commands', () => ({
  createPopUp: jest.fn(),
}));

describe('TableDetailsCommand', () => {
  let command: TableDetailsCommand;
  let mockSchema: Schema;
  let mockState: EditorState;
  let mockView: EditorView;
  let mockDispatch: jest.Mock<void, [Transform]>;

  beforeEach(() => {
    command = new TableDetailsCommand();
    mockDispatch = jest.fn<void, [Transform]>();

    // Create a basic schema with table node
    mockSchema = new Schema({
      nodes: {
        doc: { content: 'block+' },
        text: { group: 'inline' },
        paragraph: { content: 'inline*', group: 'block' },
        table: {
          attrs: {
            noOfColumns: {default: null},
            tableHeight: {default: null},
          },
          content: 'table_row+',
          group: 'block',
        },
        table_row: {
          attrs: {
            rowHeight: {default: null},
            rowWidth: {default: null},
          },
          content: 'table_cell+',
        },
        table_cell: {
          attrs: {
            cellWidth: {default: null},
            cellStyle: {default: null},
            fontSize: {default: null},
            letterSpacing: {default: null},
            marginTop: {default: null},
            MarginBottom: {default: null},
          },
          content: 'paragraph+',
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return false when view is not provided', () => {
      const result = command.execute(mockState, mockDispatch, undefined as unknown as EditorView);
      expect(result).toBe(false);
    });

    it('should return false when table node is not found', () => {
      const doc = mockSchema.node('doc', null, [
        mockSchema.node('paragraph', null, [mockSchema.text('test')]),
      ]);

      mockState = EditorState.create({
        doc,
        schema: mockSchema,
      });

      mockView = {
        state: mockState,
        domAtPos: jest.fn(),
      } as unknown as EditorView;

      const result =  command.execute(mockState, mockDispatch, mockView);
      expect(result).toBe(false);
    });

    it('should return false when table DOM is not found', () => {
      const tableCell = mockSchema.node('table_cell', null, [
        mockSchema.node('paragraph', null, [mockSchema.text('cell')]),
      ]);
      const tableRow = mockSchema.node('table_row', null, [tableCell]);
      const table = mockSchema.node('table', null, [tableRow]);
      const doc = mockSchema.node('doc', null, [table]);

      mockState = EditorState.create({
        doc,
        schema: mockSchema,
      });

      mockView = {
        state: mockState,
        domAtPos: jest.fn().mockReturnValue({ node: document.createElement('div') }),
      } as unknown as EditorView;

      jest.spyOn(command, 'findTableDOM').mockReturnValue(null);

      const result = command.execute(mockState, mockDispatch, mockView);
      expect(result).toBe(false);
    });

    it('should create popup with table details when table is found', () => {
      const tableCell = mockSchema.node('table_cell', null, [
        mockSchema.node('paragraph', null, [mockSchema.text('cell')]),
      ]);
      const tableRow = mockSchema.node('table_row', null, [tableCell]);
      const table = mockSchema.node('table', null, [tableRow]);
      const doc = mockSchema.node('doc', null, [table]);

      mockState = EditorState.create({
        doc,
        schema: mockSchema,
      });

      const mockTableDOM = document.createElement('table');
      Object.defineProperty(mockTableDOM, 'getBoundingClientRect', {
        value: jest.fn().mockReturnValue({
          width: 500.7,
          height: 300.3,
        }),
      });

      mockView = {
        state: mockState,
        domAtPos: jest.fn().mockReturnValue({ node: mockTableDOM }),
      } as unknown as EditorView;

      jest.spyOn(command, 'findTableDOM').mockReturnValue(mockTableDOM);
      jest.spyOn(command, 'getSelectedCellDOM').mockReturnValue(null);

      const mockPopUp = { close: jest.fn() };
      (createPopUp as jest.Mock).mockReturnValue(mockPopUp);

      const promise = command.execute(mockState, mockDispatch, mockView);

      expect(createPopUp).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          table: expect.objectContaining({
            width: 501,
            height: 300,
          }),
          cell: null,
        }),
        expect.objectContaining({
          modal: true,
        })
      );

      // Trigger onClose
      const onClose = (createPopUp as jest.Mock).mock.calls[0][2].onClose;
      onClose(undefined);

      expect(promise).toBeTruthy();
    });

it('should include cell details when cell is selected', () => {
  const tableCell = mockSchema.node('table_cell', null, [
    mockSchema.node('paragraph', null, [mockSchema.text('cell')]),
  ]);
  const tableRow = mockSchema.node('table_row', null, [tableCell]);
  const table = mockSchema.node('table', null, [tableRow]);
  const doc = mockSchema.node('doc', null, [table]);

  mockState = EditorState.create({
    doc,
    schema: mockSchema,
  });

  const mockTableDOM = document.createElement('table');
  Object.defineProperty(mockTableDOM, 'getBoundingClientRect', {
    value: jest.fn().mockReturnValue({
      width: 500,
      height: 300,
    }),
  });

  const mockCellDOM = document.createElement('td');
  Object.defineProperty(mockCellDOM, 'getBoundingClientRect', {
    value: jest.fn().mockReturnValue({
      width: 100.4,
      height: 50.6,
    }),
  });

  mockView = {
    state: mockState,
    domAtPos: jest.fn().mockReturnValue({ node: mockTableDOM }),
  } as unknown as EditorView;

  jest.spyOn(command, 'findTableDOM').mockReturnValue(mockTableDOM);
  jest.spyOn(command, 'getSelectedCellDOM').mockReturnValue(mockCellDOM);

  const mockPopUp = { close: jest.fn() };
  (createPopUp as jest.Mock).mockReturnValue(mockPopUp);

  command.execute(mockState, mockDispatch, mockView);
  expect(createPopUp).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      cell: expect.objectContaining({
        width: 100,
        height: 51,
      }),
    }),
    expect.anything()
  );
});
  });

  describe('isActive', () => {
    it('should always return false', () => {
      expect(command.isActive(mockState)).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('should return false when not inside a table', () => {
      const doc = mockSchema.node('doc', null, [
        mockSchema.node('paragraph', null, [mockSchema.text('test')]),
      ]);

      mockState = EditorState.create({
        doc,
        schema: mockSchema,
      });

      expect(command.isEnabled(mockState)).toBe(false);
    });

    it('should return true when inside a table', () => {
      const tableCell = mockSchema.node('table_cell', null, [
        mockSchema.node('paragraph', null, [mockSchema.text('cell')]),
      ]);
      const tableRow = mockSchema.node('table_row', null, [tableCell]);
      const table = mockSchema.node('table', null, [tableRow]);
      const doc = mockSchema.node('doc', null, [table]);

      mockState = EditorState.create({
        doc,
        schema: mockSchema,
        selection: TextSelection.create(doc, 2),
      });

      expect(command.isEnabled(mockState)).toBe(true);
    });
  });

  describe('findTableDOM', () => {
    it('should return null when DOM node is not an HTMLElement', () => {
      mockView = {
        domAtPos: jest.fn().mockReturnValue({ node: document.createTextNode('text') }),
      } as unknown as EditorView;

      const result = command.findTableDOM(mockView, 0);
      expect(result).toBeNull();
    });

    it('should return table element when found', () => {
      const table = document.createElement('table');
      const td = document.createElement('td');
      table.appendChild(td);

      mockView = {
        domAtPos: jest.fn().mockReturnValue({ node: td }),
      } as unknown as EditorView;

      const result = command.findTableDOM(mockView, 0);
      expect(result).toBe(table);
    });

    it('should return null when table is not found in ancestors', () => {
      const div = document.createElement('div');

      mockView = {
        domAtPos: jest.fn().mockReturnValue({ node: div }),
      } as unknown as EditorView;

      const result = command.findTableDOM(mockView, 0);
      expect(result).toBeNull();
    });
  });

  describe('getSelectedCellDOM', () => {
    it('should return null when selection is not TextSelection', () => {
      mockState = {
        selection: {} as TextSelection,
      } as unknown as EditorState;

      mockView = {
        state: mockState,
      } as EditorView;

      const result = command.getSelectedCellDOM(mockView);
      expect(result).toBeNull();
    });

    it('should return cell element when text node is selected', () => {
      const td = document.createElement('td');
      const textNode = document.createTextNode('text');
      td.appendChild(textNode);

      const doc = mockSchema.node('doc', null, [
        mockSchema.node('paragraph', null, [mockSchema.text('test')]),
      ]);

      mockState = EditorState.create({
        doc,
        schema: mockSchema,
      });

      mockView = {
        state: mockState,
        domAtPos: jest.fn().mockReturnValue({ node: textNode }),
      } as unknown as EditorView;

      const result = command.getSelectedCellDOM(mockView);
      expect(result).toBe(td);
    });

    it('should return cell element when HTML element is selected', () => {
      const td = document.createElement('td');
      const span = document.createElement('span');
      td.appendChild(span);

      const doc = mockSchema.node('doc', null, [
        mockSchema.node('paragraph', null, [mockSchema.text('test')]),
      ]);

      mockState = EditorState.create({
        doc,
        schema: mockSchema,
      });

      mockView = {
        state: mockState,
        domAtPos: jest.fn().mockReturnValue({ node: span }),
      } as unknown as EditorView;

      const result = command.getSelectedCellDOM(mockView);
      expect(result).toBe(td);
    });

    it('should return th element when header cell is selected', () => {
      const th = document.createElement('th');
      const textNode = document.createTextNode('header');
      th.appendChild(textNode);

      const doc = mockSchema.node('doc', null, [
        mockSchema.node('paragraph', null, [mockSchema.text('test')]),
      ]);

      mockState = EditorState.create({
        doc,
        schema: mockSchema,
      });

      mockView = {
        state: mockState,
        domAtPos: jest.fn().mockReturnValue({ node: textNode }),
      } as unknown as EditorView;

      const result = command.getSelectedCellDOM(mockView);
      expect(result).toBe(th);
    });

    it('should return null when node is null', () => {
      const doc = mockSchema.node('doc', null, [
        mockSchema.node('paragraph', null, [mockSchema.text('test')]),
      ]);

      mockState = EditorState.create({
        doc,
        schema: mockSchema,
      });

      mockView = {
        state: mockState,
        domAtPos: jest.fn().mockReturnValue({ node: null }),
      } as unknown as EditorView;

      const result = command.getSelectedCellDOM(mockView);
      expect(result).toBeNull();
    });

    it('should return null when no cell ancestor is found', () => {
      const div = document.createElement('div');

      const doc = mockSchema.node('doc', null, [
        mockSchema.node('paragraph', null, [mockSchema.text('test')]),
      ]);

      mockState = EditorState.create({
        doc,
        schema: mockSchema,
      });

      mockView = {
        state: mockState,
        domAtPos: jest.fn().mockReturnValue({ node: div }),
      } as unknown as EditorView;

      const result = command.getSelectedCellDOM(mockView);
      expect(result).toBeNull();
    });
  });

  describe('cancel', () => {
    it('should close popup if it exists', () => {
      const mockPopUp = { close: jest.fn() };
      command._popUp = mockPopUp;

      command.cancel();

      expect(mockPopUp.close).toHaveBeenCalledWith(undefined);
    });

    it('should not error when popup does not exist', () => {
      command._popUp = null;

      expect(() => command.cancel()).not.toThrow();
    });
  });

  describe('executeCustom', () => {
    it('should return transform unchanged', () => {
      const mockTr = {} as Transform;
      const result = command.executeCustom(mockState, mockTr, 0, 0);
      expect(result).toBe(mockTr);
    });
  });

  describe('executeCustomStyleForTable', () => {
    it('should return transform unchanged', () => {
      const mockTr = {} as Transform;
      const result = command.executeCustomStyleForTable(mockState, mockTr);
      expect(result).toBe(mockTr);
    });
  });

  describe('waitForUserInput', () => {
    it('should resolve with undefined', async () => {
      const result = await command.waitForUserInput(
        mockState,
        mockDispatch,
        mockView,
        {} as React.SyntheticEvent
      );
      expect(result).toBeUndefined();
    });
  });

  describe('executeWithUserInput', () => {
    it('should return false', () => {
      const result = command.executeWithUserInput(
        mockState,
        mockDispatch,
        mockView,
        'input'
      );
      expect(result).toBe(false);
    });
  });

  describe('applyAttributeInputs', () => {
    it('should update table row and cell attributes', () => {
      const tableCell = mockSchema.node('table_cell', null, [
        mockSchema.node('paragraph', null, [mockSchema.text('cell')]),
      ]);
      const tableRow = mockSchema.node('table_row', null, [tableCell]);
      const table = mockSchema.node('table', null, [tableRow]);
      const doc = mockSchema.node('doc', null, [table]);

      mockState = EditorState.create({
        doc,
        schema: mockSchema,
        selection: TextSelection.create(doc, 4),
      });

      const dispatch = jest.fn();
      const focus = jest.fn();
      mockView = {
        state: mockState,
        dispatch,
        focus,
      } as unknown as EditorView;

      const tableRef = command.getParentNodeRef(mockState.selection, mockSchema.nodes.table);
      const rowRef = command.getParentNodeRef(mockState.selection, mockSchema.nodes.table_row);
      const cellRef = command.getParentNodeRef(mockState.selection, mockSchema.nodes.table_cell);

      command.applyAttributeInputs(
        mockView,
        {
          table: tableRef,
          row: rowRef,
          cell: cellRef,
        },
        {
          noOfColumns: '5',
          tableHeight: '300px',
          rowHeight: '50px',
          rowWidth: '600px',
          cellWidth: '120px',
          cellStyle: 'padding: 8px;',
          fontSize: '14px',
          letterSpacing: '1px',
          marginTop: '2px',
          MarginBottom: '3px',
        }
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(focus).toHaveBeenCalledTimes(1);

      const tr = dispatch.mock.calls[0][0];
      const updatedTable = tr.doc.firstChild;
      const updatedRow = updatedTable?.firstChild;
      const updatedCell = updatedRow?.firstChild;

      expect(updatedTable?.attrs.noOfColumns).toBe(5);
      expect(updatedTable?.attrs.tableHeight).toBe('300px');
      expect(updatedRow?.attrs.rowHeight).toBe('50px');
      expect(updatedRow?.attrs.rowWidth).toBe('600px');
      expect(updatedCell?.attrs.cellWidth).toBe('120px');
      expect(updatedCell?.attrs.cellStyle).toBe('padding: 8px;');
      expect(updatedCell?.attrs.fontSize).toBe('14px');
      expect(updatedCell?.attrs.letterSpacing).toBe('1px');
      expect(updatedCell?.attrs.marginTop).toBe('2px');
      expect(updatedCell?.attrs.MarginBottom).toBe('3px');
    });
  });
});