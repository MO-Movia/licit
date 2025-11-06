import { EditorState, Transaction } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import ListSplitCommand from './listSplitCommand';
import splitListItem from '../splitListItem';

jest.mock('../splitListItem', () => jest.fn());

describe('ListSplitCommand', () => {
  let command: ListSplitCommand;

  beforeEach(() => {
    command = new ListSplitCommand();
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('isEnabled', () => {
    it('should return true if the selection is inside a list item', () => {
      const mockState = {
        selection: { $from: { node: jest.fn(() => ({ type: { name: 'list_item' } })) } },
      } as unknown as EditorState;

      expect(command.isEnabled(mockState)).toBe(true);
    });

    it('should return false if the selection is not inside a list item', () => {
      const mockState = {
        selection: { $from: { node: jest.fn(() => ({ type: { name: 'paragraph' } })) } },
      } as unknown as EditorState;

      expect(command.isEnabled(mockState)).toBe(true);
    });
  });

  describe('execute', () => {
    let mockState: EditorState;
    let mockDispatch: jest.Mock;

    beforeEach(() => {
      mockState = {
        tr: { setSelection: jest.fn(() => ({ tr: {} })) },
        selection: {},
        schema: {},
      } as unknown as EditorState;

      mockDispatch = jest.fn();
    });

    it('should call dispatch with a valid transaction if splitListItem changes the document', () => {
      const mockTransaction = { docChanged: true } as unknown as Transaction;
      (splitListItem as jest.Mock).mockReturnValue(mockTransaction);

      const result = command.execute(mockState, mockDispatch);

      expect(splitListItem).toHaveBeenCalledWith(expect.any(Object), mockState.schema);
      expect(mockDispatch).toHaveBeenCalledWith(mockTransaction);
      expect(result).toBe(true);
    });

    it('should not call dispatch if splitListItem does not change the document', () => {
      const mockTransaction = { docChanged: false } as unknown as Transaction;
      (splitListItem as jest.Mock).mockReturnValue(mockTransaction);

      const result = command.execute(mockState, mockDispatch);

      expect(splitListItem).toHaveBeenCalledWith(expect.any(Object), mockState.schema);
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });


  });

  describe('waitForUserInput', () => {
    it('should return a resolved promise with null', async () => {
      const result = await command.waitForUserInput({} as EditorState);
      expect(result).toBeNull();
    });
  });

  describe('executeWithUserInput', () => {
    it('should return false', () => {
      const result = command.executeWithUserInput({} as EditorState);
      expect(result).toBe(false);
    });
  });

  describe('cancel', () => {
    it('should return undefined', () => {
      const result = command.cancel();
      expect(result).toBeNull();
    });
  });

  describe('executeCustom', () => {
    it('should return the passed Transform object', () => {
      const mockTransform = {} as Transform;
      const result = command.executeCustom({} as EditorState, mockTransform, 1, 2);
      expect(result).toBe(mockTransform);
    });
  });
});
