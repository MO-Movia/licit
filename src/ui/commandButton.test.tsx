import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CommandButton from './commandButton';
import { ThemeContext } from '@modusoperandi/licit-ui-commands';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import '@testing-library/jest-dom';

// Setup the editorState and editorView mocks
const mockEditorState = {} as EditorState;
const mockEditorView = {} as EditorView;

describe('CommandButton Component', () => {
  it('renders correctly with default props', () => {
    const command = {
        isEnabled: jest.fn().mockReturnValue(true),
        isActive: jest.fn().mockReturnValue(false),
        execute: jest.fn(),
        shouldRespondToUIEvent: jest.fn().mockReturnValue(true),
    } as unknown as UICommand;

    const { getByText } = render(
      <ThemeContext.Provider value="">
        <CommandButton
          command={command}
          dispatch={jest.fn()}
          editorState={mockEditorState}
          editorView={mockEditorView}
          label='Mock Button'
          title='Mock Button'
        />
      </ThemeContext.Provider>
    );

    expect(getByText('Mock Button')).toBeInTheDocument();
  });

  it('disables the button if the command is not enabled', () => {
    const command = {
        isEnabled: jest.fn().mockReturnValue(false),
        isActive: jest.fn().mockReturnValue(false),
        execute: jest.fn(),
        shouldRespondToUIEvent: jest.fn().mockReturnValue(true),
        disabled: true
    } as unknown as UICommand;

    const { getByText } = render(
      <ThemeContext.Provider value="light">
        <CommandButton
          command={command}
          dispatch={jest.fn()}
          editorState={mockEditorState}
          editorView={mockEditorView}
          disabled={true}
          label='Mock Button'
          title='Mock Button'
        />
      </ThemeContext.Provider>
    );

    expect(getByText('Mock Button')).toHaveClass("disabled");
  });

it('_onUIEnter shpuld call _execute', () => {
  const command = {
    isEnabled: jest.fn().mockReturnValue(true),
    isActive: jest.fn().mockReturnValue(false),
    execute: jest.fn(),
    shouldRespondToUIEvent: jest.fn().mockReturnValue(true),
} as unknown as UICommand;

const dispatch = jest.fn();

 let dummy =  new CommandButton({command,
    dispatch,
    editorState:mockEditorState,
    editorView:mockEditorView,
    label:'Mock Button',
    title:'Mock Button'});

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


  it('applies the correct className when "sub" prop is true', () => {
    const command = {
        isEnabled: jest.fn().mockReturnValue(true),
        isActive: jest.fn().mockReturnValue(false),
        execute: jest.fn(),
        shouldRespondToUIEvent: jest.fn().mockReturnValue(true),
    } as unknown as UICommand;

    const { container } = render(
      <ThemeContext.Provider value="light">
        <CommandButton
          className="test-class"
          sub={true}
          command={command}
          dispatch={jest.fn()}
          editorState={mockEditorState}
          editorView={mockEditorView}
          label='Mock Button'
          title='Mock Button'
        />
      </ThemeContext.Provider>
    );

    expect(container.firstChild).toHaveClass('czi-tooltip-surface');
  });
});
