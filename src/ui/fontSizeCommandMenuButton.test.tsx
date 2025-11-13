/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorState } from 'prosemirror-state';
import FontSizeCommandMenuButton, { FONT_PT_SIZES } from './fontSizeCommandMenuButton';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import findActiveFontSize from '../findActiveFontSize';
import { EditorView } from 'prosemirror-view';

//  Fix: define mock *inside* jest.mock() so it's not hoisted before initialization
jest.mock('./commandMenuButton', () => {
  const MockCommandMenuButton = jest.fn(() => null);
  return {
    __esModule: true,
    default: MockCommandMenuButton,
  };
});

//  Mock findActiveFontSize
jest.mock('../findActiveFontSize', () => jest.fn());

describe('FontSizeCommandMenuButton (pure Jest)', () => {
  let dispatch: jest.Mock;
  let editorState: EditorState;
  let editorView: EditorView;

  beforeEach(() => {
    jest.clearAllMocks();
    UICommand.theme = 'dark';
    dispatch = jest.fn();
    editorState = {} as EditorState;
    editorView = { disabled: false } as unknown as EditorView;
  });

  it('should call findActiveFontSize with editorState', () => {
    const fontSize = 12;
    (findActiveFontSize as jest.Mock).mockReturnValue(fontSize);

    const element = new FontSizeCommandMenuButton({
      dispatch,
      editorState,
      editorView,
    } as unknown as FontSizeCommandMenuButton['props']);

    element.render();

    expect(findActiveFontSize).toHaveBeenCalledWith(editorState);
  });

  it('should define all FONT_PT_SIZES correctly', () => {
    expect(Array.isArray(FONT_PT_SIZES)).toBe(true);
    expect(FONT_PT_SIZES.length).toBeGreaterThan(5);
    expect(FONT_PT_SIZES).toContain(12);
    expect(FONT_PT_SIZES).toContain(72);
  });
});
