import * as React from 'react';
import * as ReactDOM from 'react-dom';
import CommandButton from './commandButton';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { CustomButton, ThemeContext } from '@modusoperandi/licit-ui-commands';
import cx from 'classnames';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

// Mock dependencies
jest.mock('@modusoperandi/licit-ui-commands', () => ({
  CustomButton: jest.fn(() => React.createElement('button')),
  ThemeContext: React.createContext('light'),
}));

jest.mock('classnames', () => jest.fn((...args) => args.join(' ')));

describe('CommandButton', () => {
  let container: HTMLDivElement;
  let mockEditorState: EditorState;
  let mockEditorView: EditorView;
  let mockDispatch: jest.Mock;
  let mockCommand: UICommand;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    mockEditorState = { doc: {} } as EditorState;
    mockEditorView = { someProp: true } as unknown as EditorView;
    mockDispatch = jest.fn();

    mockCommand = {
      isEnabled: jest.fn(() => true),
      isActive: jest.fn(() => false),
      execute: jest.fn(),
      shouldRespondToUIEvent: jest.fn(() => true),
    } as unknown as UICommand;

    jest.clearAllMocks();
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
  });

  test('renders CustomButton with correct props and theme', () => {
    const element = (
      <ThemeContext.Provider value="light">
        <CommandButton
          className="test-class"
          command={mockCommand}
          dispatch={mockDispatch}
          editorState={mockEditorState}
          editorView={mockEditorView}
          icon="mock-icon"
          label="mock-label"
          title="Mock Title"
        />
      </ThemeContext.Provider>
    );

    ReactDOM.render(element, container);

    // Verify CustomButton was called correctly
    expect(CustomButton).toHaveBeenCalledWith(
      expect.objectContaining({
        active: false,
        className: 'test-class',
        disabled: false,
        icon: 'mock-icon',
        label: 'mock-label',
        theme: 'light',
        title: 'Mock Title',
        value: mockCommand,
      }),
      {}
    );

    // Verify theme was applied
    expect(UICommand.theme).toBe('light');
  });

  test('disables button when command is not enabled', () => {
    (mockCommand.isEnabled as jest.Mock).mockReturnValue(false);

    const element = (
      <ThemeContext.Provider value="dark">
        <CommandButton
          className="test-disabled"
          command={mockCommand}
          dispatch={mockDispatch}
          editorState={mockEditorState}
          editorView={mockEditorView}
        />
      </ThemeContext.Provider>
    );

    ReactDOM.render(element, container);

    expect(CustomButton).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: true,
        theme: 'dark',
      }),
      {}
    );
  });

  test('applies submenu class when sub is true', () => {
    const element = (
      <ThemeContext.Provider value="light">
        <CommandButton
          className="base"
          command={mockCommand}
          dispatch={mockDispatch}
          editorState={mockEditorState}
          editorView={mockEditorView}
          sub={true}
        />
      </ThemeContext.Provider>
    );

    ReactDOM.render(element, container);

    expect(cx).toHaveBeenCalledWith('base', { 'czi-custom-submenu-button': true });
  });

  test('calls command.execute when _onUIEnter triggered and should respond', () => {
    const wrapper = new CommandButton({
      command: mockCommand,
      dispatch: mockDispatch,
      editorState: mockEditorState,
      editorView: mockEditorView,
    } as CommandButton['props']);

    const mockEvent = { preventDefault: jest.fn() } as unknown as React.SyntheticEvent<HTMLButtonElement, Event>;

    wrapper._onUIEnter(mockCommand, mockEvent);

    expect(mockCommand.shouldRespondToUIEvent).toHaveBeenCalledWith(mockEvent);
    expect(mockCommand.execute).toHaveBeenCalledWith(
      mockEditorState,
      mockDispatch,
      mockEditorView,
      mockEvent
    );
  });

  test('does not execute if shouldRespondToUIEvent returns false', () => {
    (mockCommand.shouldRespondToUIEvent as jest.Mock).mockReturnValue(false);

    const wrapper = new CommandButton({
      command: mockCommand,
      dispatch: mockDispatch,
      editorState: mockEditorState,
      editorView: mockEditorView,
    } as CommandButton['props']);

    const mockEvent = { preventDefault: jest.fn() } as unknown as React.SyntheticEvent<HTMLButtonElement, Event>;

    wrapper._onUIEnter(mockCommand, mockEvent);

    expect(mockCommand.execute).not.toHaveBeenCalled();
  });
});
