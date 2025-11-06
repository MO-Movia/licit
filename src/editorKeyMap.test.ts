/**
 * @jest-environment jsdom
 */

import {
  tooltip,
  findShortcutByKeymap,
  findKeymapByDescription,
  findShortcutByDescription,
  ALL_KEYS,
  KEY_SPLIT_LIST_ITEM,
} from './editorKeyMap'; // <-- adjust filename if needed

import browser from './browser';

// Mock browser detection
jest.mock('./browser', () => ({
  isMac: jest.fn(),
}));

describe('shortcut utility functions', () => {
  const mockKeymap = {
    description: 'Bold',
    mac: 'Cmd-Shift-B',
    windows: 'Ctrl-B',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------------------

  test('tooltip() returns null when no keymap is provided', () => {
    expect(tooltip()).toBeNull();
  });

  test('tooltip() formats Mac shortcuts with symbols', () => {
    (browser.isMac as jest.Mock).mockReturnValue(true);

    const result = tooltip(mockKeymap);

    expect(result).toBe('Bold (⌘-⇧-B)');
  });

  test('tooltip() returns windows shortcut text when not mac', () => {
    (browser.isMac as jest.Mock).mockReturnValue(false);

    const result = tooltip(mockKeymap);

    expect(result).toBe('Bold (Ctrl-B)');
  });

  // ------------------------------------------------------

  test('findShortcutByKeymap() returns mac shortcut on mac', () => {
    (browser.isMac as jest.Mock).mockReturnValue(true);

    expect(findShortcutByKeymap(mockKeymap)).toBe('Cmd-Shift-B');
  });

  test('findShortcutByKeymap() returns windows shortcut on windows', () => {
    (browser.isMac as jest.Mock).mockReturnValue(false);

    expect(findShortcutByKeymap(mockKeymap)).toBe('Ctrl-B');
  });

  // ------------------------------------------------------

  test('ALL_KEYS should include KEY_SPLIT_LIST_ITEM', () => {
    expect(ALL_KEYS).toContain(KEY_SPLIT_LIST_ITEM);
  });

  // ------------------------------------------------------

  test('findKeymapByDescription finds a keymap ignoring case', () => {
    const found = findKeymapByDescription('split LIST item');

    expect(found).toBe(KEY_SPLIT_LIST_ITEM);
  });

  test('findKeymapByDescription returns null if not found', () => {
    expect(findKeymapByDescription('NonExistent')).toBeUndefined();
  });

  // ------------------------------------------------------

  test('findShortcutByDescription returns the shortcut when found', () => {
    (browser.isMac as jest.Mock).mockReturnValue(false);

    const shortcut = findShortcutByDescription('Split list item');

    // Windows version created by makeKeyMapWithCommon
    expect(shortcut).toBe(KEY_SPLIT_LIST_ITEM.windows);
  });

  test('findShortcutByDescription returns null when no match', () => {
    expect(findShortcutByDescription('Foo')).toBeNull();
  });
});
