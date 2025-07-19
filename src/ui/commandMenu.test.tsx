import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import CommandMenu from './commandMenu';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { EditorState } from 'prosemirror-state';
import { COMMAND_GROUPS} from './editorToolbarConfig';
import { Arr } from './commandMenuButton';
import { STRONG, TABLE_INSERT_TABLE } from '../editorCommands';

jest.mock('@modusoperandi/licit-doc-attrs-step'); // Mock UICommand

describe('CommandMenu', () => {
  let mockDispatch: jest.Mock;
  let mockEditorState: EditorState;
  let mockEditorView: any;
  let mockOnCommand: jest.Mock;
  let commandGroups: Array<Arr>;


  beforeEach(() => {
    // Create mock dispatch function
    mockDispatch = jest.fn();
    mockOnCommand = jest.fn();

    // Mock editorState and editorView
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
            nodeAt: (_x) => {
              return {isAtom: true, isLeaf: true, isText: false};
            },
          },
        },
        schema: {marks: {'mark-font-type': undefined}},
      } as unknown as EditorState; // You can mock specific properties if needed
    mockEditorView = {} as any;  // Same for editorView

    UICommand.theme = "dark";
 commandGroups = [{
        '[format_bold] Bold': STRONG 
      },
      {
        'Insert Table...': TABLE_INSERT_TABLE,
      },
      {
        'My Menu': [{
            'Insert Table...': {...TABLE_INSERT_TABLE, theme: "dark"},
          }] as unknown as UICommand,
      },
    ];

  });

  it('renders command buttons based on commandGroups prop', () => {

let menu = render(
    <CommandMenu
      commandGroups={commandGroups}
      dispatch={mockDispatch}
      editorState={mockEditorState}
      editorView={mockEditorView}
      onCommand={mockOnCommand}
      theme='dark'
      title='Bold'
    />
  );
    expect(menu).toBeDefined();
  });

  it('_onUIEnter shpuld call _execute', () => {
    const command = {
      isEnabled: jest.fn().mockReturnValue(true),
      isActive: jest.fn().mockReturnValue(false),
      execute: jest.fn().mockReturnValue(true),
      shouldRespondToUIEvent: jest.fn().mockReturnValue(true),
  } as unknown as UICommand;
  
  const dispatch = jest.fn();
  
   let dummy =  new CommandMenu({commandGroups,
      dispatch,
      editorState:mockEditorState,
      editorView:mockEditorView,
      title:'Mock Button',
      onCommand: jest.fn()
    });

    dummy._activeCommand = { cancel: jest.fn() } as unknown as UICommand;
  
      dummy._onUIEnter(command, {
        nativeEvent: undefined,
        currentTarget: undefined,
        target: undefined,
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        preventDefault: function (): void {
          throw new Error('Function not implemented.');
        },
        isDefaultPrevented: function (): boolean {
          throw new Error('Function not implemented.');
        },
        stopPropagation: function (): void {
          throw new Error('Function not implemented.');
        },
        isPropagationStopped: function (): boolean {
          throw new Error('Function not implemented.');
        },
        persist: function (): void {
          throw new Error('Function not implemented.');
        },
        timeStamp: 0,
        type: ''
      })
  
      expect(command.execute).toHaveBeenCalledTimes(1);
  });

 /* it('should not call _execute if command is disabled', () => {
    const mockCommand = {
        isEnabled: jest.fn().mockReturnValue(true),
        isActive: jest.fn().mockReturnValue(false),
        execute: jest.fn(),
        shouldRespondToUIEvent: jest.fn().mockReturnValue(true),
    } as unknown as UICommand;

    const { getByText } = render(
      <CommandMenu
      commandGroups={commandGroups}
        dispatch={mockDispatch}
        editorState={mockEditorState}
        editorView={mockEditorView}
        onCommand={mockOnCommand}
        theme='dark'
      />
    );

    // Simulate a button click
    const button = getByText('Bold');
    fireEvent.click(button);

    // Check that _execute was not called since command is disabled
    expect(mockCommand.execute).not.toHaveBeenCalled();
    expect(mockOnCommand).not.toHaveBeenCalled();
  });

  it('should call _onUIEnter when the command item is clicked', () => {
    const mockCommand = UICommand;
    const _onUIEnterSpy = jest.spyOn(CommandMenu.prototype, '_onUIEnter');

    const { getByText } = render(
      <CommandMenu
      commandGroups={commandGroups}
        dispatch={mockDispatch}
        editorState={mockEditorState}
        editorView={mockEditorView}
        onCommand={mockOnCommand}
        theme='dark'
      />
    );

    // Simulate a button click
    const button = getByText('Bold');
    fireEvent.click(button);

    // Check that _onUIEnter was called with the correct arguments
    expect(_onUIEnterSpy).toHaveBeenCalledWith(mockCommand, expect.anything());
  });*/
});
