import * as React from 'react';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { Editor } from '@tiptap/react';
import TableColorCommand from './tableColorCommand';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

// Mock licit-ui-commands dependencies
jest.mock('@modusoperandi/licit-ui-commands', () => ({
  createPopUp: jest.fn().mockImplementation((_Component, _props, options) => {
    // Simulate popup object with a working close()
    return { close: jest.fn(() => options?.onClose && options.onClose('mocked value')) };
  }),
  atAnchorRight: jest.fn(),
  RuntimeService: { Runtime: 'mockRuntime' },
}));

// Mock color-picker import
jest.mock('@modusoperandi/color-picker', () => ({
  ColorEditor: jest.fn(),
}));

describe('TableColorCommand', () => {
  let command: TableColorCommand;
  let mockState: EditorState;
  let mockTransform: Transform;
  let dispatchMock: jest.Mock;
  let viewMock: EditorView;
  let setCellAttributeMock: jest.Mock;

  beforeEach(() => {
    mockState = {} as EditorState;
    mockTransform = {} as Transform;
    dispatchMock = jest.fn();
    viewMock = {} as EditorView;

    // Safe override to inject mock commands into UICommand.editor
    setCellAttributeMock = jest.fn();
    (UICommand.prototype as any).editor = {
      commands: { setCellAttribute: setCellAttributeMock },
      view: { focus: jest.fn(), dispatch: jest.fn() },
    } as unknown as Editor;

    command = new TableColorCommand('backgroundColor');
  });

  //Basic Behavior
  it('should initialize with the given attribute', () => {
    expect(command.attribute).toBe('backgroundColor');
  });

  it('should return the same transform in executeCustom', () => {
    const result = command.executeCustom(mockState, mockTransform, 0, 0);
    expect(result).toBe(mockTransform);
  });

  //Event Handling
  it('should respond only to mouseenter events', () => {
    const enterEvent = { type: 'mouseenter' } as React.SyntheticEvent;
    const clickEvent = { type: 'click' } as React.SyntheticEvent;

    expect(command.shouldRespondToUIEvent(enterEvent)).toBe(true);
    expect(command.shouldRespondToUIEvent(clickEvent)).toBe(false);
  });

  // Enable/Disable Logic
  it('isEnabled should always return true', () => {
    expect(command.isEnabled(mockState)).toBe(true);
  });

  it('should return false when hex is undefined', () => {
    const result = command.executeWithUserInput(mockState, dispatchMock, viewMock, undefined);
    expect(result).toBe(false);
  });

  it('should handle invalid event target gracefully', async () => {
    const badEvent = { currentTarget: null } as unknown as React.SyntheticEvent;
    const result = await command.waitForUserInput(mockState, dispatchMock, viewMock, badEvent);
    expect(result).toBeUndefined();
  });

  it('should return editor from UICommand.prototype', () => {
  // Define a minimal mock editor object consistent with the Editor type
  const mockEditor: Editor = {
    view: { focus: jest.fn(), dispatch: jest.fn() } as unknown as Editor['view'],
    commands: {} as Editor['commands'],
  } as Editor;

  Object.defineProperty(UICommand.prototype, 'editor', {
    value: mockEditor,
    writable: true,
  });

  const result = command.getEditor();

  expect(result).toBe(mockEditor);
});
});
