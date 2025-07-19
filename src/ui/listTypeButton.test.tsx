import { render, fireEvent, screen } from '@testing-library/react';
import ListTypeButton from './listTypeButton';
import { ThemeContext } from '@modusoperandi/licit-ui-commands'; // Import your ThemeContext or mock it
import React from 'react';
import '@testing-library/jest-dom';
import { EditorState } from 'prosemirror-state';
import { EditorViewEx } from '../constants';
import { TABLE_INSERT_TABLE } from '../editorCommands';
import {createPopUp} from '@modusoperandi/licit-ui-commands';

jest.mock('./uuid', () => jest.fn(() => '1234-uuid'));
// Mocking the entire module
jest.mock('@modusoperandi/licit-ui-commands', () => ({
    ...jest.requireActual('@modusoperandi/licit-ui-commands'),
    createPopUp: jest.fn().mockReturnValue({ close: jest.fn(), update: jest.fn() }) 
  }));

describe('ListTypeButton', () => {
  const mockDispatch = jest.fn();

  const mockEditorState = {
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
  } as unknown as EditorState;

const mockEditorView = {} as EditorViewEx;

const commandGroups = [
  {
    'Insert Table...': TABLE_INSERT_TABLE,
  },
];
  
  const defaultProps = {
    dispatch: mockDispatch,
    editorState: mockEditorState,
    editorView: mockEditorView,
    commandGroups: commandGroups,
    disabled: false,
    theme: 'light', // Set default theme if needed
    label: 'My Button',
    className: 'test'
  };

  it('should render the button with the correct label', () => {
    render(<ListTypeButton {...defaultProps} />);
    
    expect(screen.getByText('My Button')).toBeInTheDocument();
  });

  it('menu should expand onclick', () => {

    let testView = new ListTypeButton(defaultProps);
    testView._onClick();
    
    expect(createPopUp).toHaveBeenCalled()
  });

  it('menu should close when expand is false', () => {
    
    let button = new ListTypeButton(defaultProps);
    (button._menu as any) = { close: jest.fn(), update: jest.fn() };
    button.state.expanded = true;

    button._onClick();

    expect(button._menu).toBeNull();
  });

  it('menu should close on _onCommand', () => {
    
    let button = new ListTypeButton(defaultProps);
    button._onCommand();
    expect(button._menu).toBeNull();
  });

  it('menu should close when _onClose called', () => {
    
    let button = new ListTypeButton(defaultProps);
    (button._menu as any) = { close: jest.fn(), update: jest.fn() };

    button._onClose();

    expect(button._menu).toBeNull();
  });
});
