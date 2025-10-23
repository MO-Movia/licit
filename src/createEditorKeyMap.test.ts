import createEditorKeyMap from './createEditorKeyMap';
import * as EditorCommands from './editorCommands';
import * as EditorKeyMap from './editorKeyMap';

jest.mock('./editorCommands', () => ({
  LIST_SPLIT: {
    execute: jest.fn(),
  },
}));

jest.mock('./editorKeyMap', () => ({
  KEY_SPLIT_LIST_ITEM: {
    common: 'Enter', // Assuming 'Enter' is the key mapping for splitting the list item.
  },
}));

describe('createEditorKeyMap', () => {
  it('should return the correct key map with the proper function bound', () => {
    // Arrange: mock any function calls or values if necessary
    const mockExecute = EditorCommands.LIST_SPLIT.execute;

    // Act: create the key map by calling the function
    const keyMap = createEditorKeyMap();

    // Assert: Check if the key map contains the correct mapping
    expect(keyMap).toHaveProperty(EditorKeyMap.KEY_SPLIT_LIST_ITEM.common);
    expect(keyMap[EditorKeyMap.KEY_SPLIT_LIST_ITEM.common]).toBe(mockExecute);

    // Optional: You can also test that `execute` is a mock function
    expect(mockExecute).toHaveBeenCalledTimes(0); // Ensure it hasn't been called yet
  });
});
