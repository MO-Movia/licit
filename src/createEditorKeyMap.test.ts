/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import createEditorKeyMap from './createEditorKeyMap';
import * as EditorCommands from './editorCommands';
import * as EditorKeyMap from './editorKeyMap';

jest.mock('./editorCommands', () => ({
  LIST_SPLIT: {
    execute: jest.fn(),
  },
  STRONG: {
    execute: jest.fn(),
  },
  EM: {
    execute: jest.fn(),
  },
  UNDERLINE: {
    execute: jest.fn(),
  },
  STRIKE: {
    execute: jest.fn(),
  },
}));

jest.mock('./editorKeyMap', () => ({
  KEY_SPLIT_LIST_ITEM: {
    common: 'Enter',
  },
  KEY_TOGGLE_BOLD: {
    common: 'Ctrl-B',
  },
  KEY_TOGGLE_ITALIC: {
    common: 'Ctrl-I',
  },
  KEY_TOGGLE_UNDERLINE: {
    common: 'Ctrl-U',
  },
  KEY_TOGGLE_STRIKETHROUGH: {
    common: 'Ctrl-Shift-S',
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

  it('should map bold toggle command correctly', () => {
    const mockExecute = EditorCommands.STRONG.execute;
    const keyMap = createEditorKeyMap();

    expect(keyMap).toHaveProperty(EditorKeyMap.KEY_TOGGLE_BOLD.common);
    expect(keyMap[EditorKeyMap.KEY_TOGGLE_BOLD.common]).toBe(mockExecute);
    expect(mockExecute).toHaveBeenCalledTimes(0);
  });

  it('should map italic toggle command correctly', () => {
    const mockExecute = EditorCommands.EM.execute;
    const keyMap = createEditorKeyMap();

    expect(keyMap).toHaveProperty(EditorKeyMap.KEY_TOGGLE_ITALIC.common);
    expect(keyMap[EditorKeyMap.KEY_TOGGLE_ITALIC.common]).toBe(mockExecute);
    expect(mockExecute).toHaveBeenCalledTimes(0);
  });

  it('should map underline toggle command correctly', () => {
    const mockExecute = EditorCommands.UNDERLINE.execute;
    const keyMap = createEditorKeyMap();

    expect(keyMap).toHaveProperty(EditorKeyMap.KEY_TOGGLE_UNDERLINE.common);
    expect(keyMap[EditorKeyMap.KEY_TOGGLE_UNDERLINE.common]).toBe(mockExecute);
    expect(mockExecute).toHaveBeenCalledTimes(0);
  });

  it('should map strikethrough toggle command correctly', () => {
    const mockExecute = EditorCommands.STRIKE.execute;
    const keyMap = createEditorKeyMap();

    expect(keyMap).toHaveProperty(EditorKeyMap.KEY_TOGGLE_STRIKETHROUGH.common);
    expect(keyMap[EditorKeyMap.KEY_TOGGLE_STRIKETHROUGH.common]).toBe(mockExecute);
    expect(mockExecute).toHaveBeenCalledTimes(0);
  });
});