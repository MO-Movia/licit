import * as React from 'react';
import CommandMenu from './commandMenu';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { EditorState } from 'prosemirror-state';
import { STRONG, TABLE_INSERT_TABLE } from '../editorCommands';
import { Arr } from './commandMenuButton';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

//  Create a concrete mock subclass to implement all abstract members
class MockCommand extends UICommand {
  executeCustomStyleForTable(_state: EditorState, tr: Transform): Transform {
    return tr;
  }
  waitForUserInput = jest.fn().mockResolvedValue(null);
  executeWithUserInput = jest.fn().mockReturnValue(true);
  cancel = jest.fn();
  executeCustom = jest.fn();

  isEnabled = jest.fn().mockReturnValue(true);
  isActive = jest.fn().mockReturnValue(false);
  shouldRespondToUIEvent = jest.fn().mockReturnValue(true);
  execute = jest.fn().mockReturnValue(true);
  renderLabel = jest.fn().mockReturnValue('MockLabel');
}

describe('CommandMenu', () => {
  let mockDispatch: jest.Mock;
  let mockEditorState: EditorState;
  let mockEditorView: EditorView;
  let mockOnCommand: jest.Mock;
  let commandGroups: Array<Arr>;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockOnCommand = jest.fn();

    mockEditorState = {
      selection: {
        node: null,
        anchor: 0,
        head: 0,
        from: 1,
        to: 2,
      },
      plugins: [],
      tr: {
        doc: {
          nodeAt: (_x: number) => ({ isAtom: true, isLeaf: true, isText: false }),
        },
      },
      schema: { marks: { 'mark-font-type': undefined } },
    } as unknown as EditorState;

    mockEditorView = {} as unknown as EditorView;

    UICommand.theme = 'dark';

    // Example commandGroups structure
    commandGroups = [
      { '[format_bold] Bold': STRONG },
      { 'Insert Table...': TABLE_INSERT_TABLE },
      {
        'My Menu': [
          {
            'Insert Table...': { ...TABLE_INSERT_TABLE, theme: 'dark' },
          },
        ] as unknown as UICommand,
      },
    ];
  });

  it('renders safely without throwing errors', () => {
    const instance = new CommandMenu({
      commandGroups,
      dispatch: mockDispatch,
      editorState: mockEditorState,
      editorView: mockEditorView,
      onCommand: mockOnCommand,
      theme: 'dark',
      title: 'Bold',
    });

    expect(() => {
      const rendered = instance.render();
      expect(rendered).toBeTruthy();
    }).not.toThrow();
  });

  it('_onUIEnter should call _execute when command responds', () => {
    const command = new MockCommand();
    const dispatch = jest.fn();

    const dummy = new CommandMenu({
      commandGroups,
      dispatch,
      editorState: mockEditorState,
      editorView: mockEditorView,
      title: 'Mock Button',
      onCommand: jest.fn(),
      theme: 'dark',
    });

    dummy._activeCommand = { cancel: jest.fn() } as unknown as UICommand;

    const mockEvent = {
      nativeEvent: {},
      currentTarget: {},
      target: {},
      bubbles: false,
      cancelable: false,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: false,
      preventDefault: jest.fn(),
      isDefaultPrevented: jest.fn(),
      stopPropagation: jest.fn(),
      isPropagationStopped: jest.fn(),
      persist: jest.fn(),
      timeStamp: 0,
      type: 'click',
    } as unknown as React.SyntheticEvent;

    dummy._onUIEnter(command, mockEvent);

    expect(command.execute).toHaveBeenCalledTimes(1);
  });
});
