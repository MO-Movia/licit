/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ListTypeMenu from './listTypeMenu';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

//  Mock uuid to return predictable IDs
jest.mock('./uuid', () => jest.fn(() => 'mock-uuid'));

//  Mock UICommand
const mockCommand = (label = 'CommandLabel') => ({
  label,
  execute: jest.fn(() => true),
  cancel: jest.fn(),
});

describe('ListTypeMenu', () => {
  let container: HTMLDivElement;
  let mockDispatch: jest.Mock;
  let mockEditorState: EditorState;
  let mockEditorView: EditorView;
  let mockOnCommand: jest.Mock;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockDispatch = jest.fn();
    mockEditorState = {} as unknown as EditorState;;
    mockEditorView = {} as unknown as EditorView;;
    mockOnCommand = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
  });

  test('renders buttons for each command in commandGroups', () => {
    const commandGroups = [
      { bold: mockCommand('Bold'), italic: mockCommand('Italic') },
      { underline: mockCommand('Underline') },
    ] as unknown as Array<UICommand>;

    const element = (
      <ListTypeMenu
        commandGroups={commandGroups}
        dispatch={mockDispatch}
        editorState={mockEditorState}
        editorView={mockEditorView}
        onCommand={mockOnCommand}
        theme="light"
      />
    );

    ReactDOM.render(element, container);

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3);
    expect(buttons[0].textContent).toBe('Bold');
    expect(buttons[1].textContent).toBe('Italic');
    expect(buttons[2].textContent).toBe('Underline');
  });

  test('applies correct class names with theme', () => {
    const commandGroups = [{ bullet: mockCommand('Bullet') }] as unknown as Array<UICommand>;
    ReactDOM.render(
      <ListTypeMenu
        commandGroups={commandGroups}
        dispatch={mockDispatch}
        editorState={mockEditorState}
        editorView={mockEditorView}
        onCommand={mockOnCommand}
        theme="dark"
      />,
      container
    );

    const div = container.querySelector('div');
    expect(div).toBeTruthy();
    expect(div?.className).toContain('ol-container dark');

    const button = container.querySelector('button');
    expect(button?.className).toContain('buttonsize dark');
  });

  test('_onUIEnter calls cancel on previous command and executes new one', () => {
    const firstCommand = mockCommand('First');
    const secondCommand = mockCommand('Second');

    const instance = new ListTypeMenu({
      commandGroups: [{ first: firstCommand, second: secondCommand }],
      dispatch: mockDispatch,
      editorState: mockEditorState,
      editorView: mockEditorView,
      onCommand: mockOnCommand,
    } as unknown as ListTypeMenu);

    const event = {} as React.SyntheticEvent;

    // First click
    instance._onUIEnter(firstCommand as unknown as UICommand, event);
    expect(firstCommand.execute).toHaveBeenCalledTimes(1);

    // Second click triggers cancel of previous command
    instance._onUIEnter(secondCommand as unknown as UICommand, event);
    expect(firstCommand.cancel).toHaveBeenCalledTimes(1);
    expect(secondCommand.execute).toHaveBeenCalledTimes(1);
  });

  test('_execute calls command.execute and onCommand when successful', () => {
    const command = mockCommand('ListCmd');
    const instance = new ListTypeMenu({
      commandGroups: [{ cmd: command }],
      dispatch: mockDispatch,
      editorState: mockEditorState,
      editorView: mockEditorView,
      onCommand: mockOnCommand,
    } as unknown as UICommand);

    const event = {} as React.SyntheticEvent;
    instance._execute(command as unknown as UICommand, event);

    expect(command.execute).toHaveBeenCalledWith(
      mockEditorState,
      mockDispatch,
      mockEditorView,
      event
    );
    expect(mockOnCommand).toHaveBeenCalled();
  });

  test('_execute does not call onCommand when command.execute returns false', () => {
    const command = mockCommand('NoRun');
    command.execute.mockReturnValueOnce(false);

    const instance = new ListTypeMenu({
      commandGroups: [{ cmd: command }],
      dispatch: mockDispatch,
      editorState: mockEditorState,
      editorView: mockEditorView,
      onCommand: mockOnCommand,
    } as unknown as UICommand);

    const event = {} as React.SyntheticEvent;
    instance._execute(command as unknown as UICommand, event);

    expect(command.execute).toHaveBeenCalled();
    expect(mockOnCommand).not.toHaveBeenCalled();
  });

});
