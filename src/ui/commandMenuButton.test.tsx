import { render, screen, fireEvent } from '@testing-library/react';
import CommandMenuButton from './commandMenuButton';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { EditorState } from 'prosemirror-state';
import { EditorViewEx } from '../constants';
import {createPopUp} from '@modusoperandi/licit-ui-commands';
import React from 'react';
import { STRONG, TABLE_INSERT_TABLE } from '../editorCommands';
import '@testing-library/jest-dom';

// Mocking the entire module
jest.mock('@modusoperandi/licit-ui-commands', () => ({
    ...jest.requireActual('@modusoperandi/licit-ui-commands'),
    createPopUp: jest.fn().mockReturnValue({ close: jest.fn(), update: jest.fn() }) 
  }));

describe('CommandMenuButton', () => {
    UICommand.theme = "dark";
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

  const mockProps = {
    commandGroups,
    dispatch: mockDispatch,
    editorState: mockEditorState,
    editorView: mockEditorView,
    label: 'Insert Table',
    title: 'Insert Table',
    theme: 'dark',
    disabled: false,
  };

  it('renders CommandMenuButton with correct props', () => {
    const {getByText} = render(<CommandMenuButton {...mockProps} />);
    expect(getByText("Insert Table")).toBeDefined();
  });

  it('should toggle the menu when clicked', () => {
  const {getByText} = render(<CommandMenuButton {...mockProps} />);
    
    const button = getByText('Insert Table');

    // Verify initial state (menu should not be expanded initially)
    expect(button).toHaveClass('czi-custom-menu-button');
    
  });

  it('_onClick called', () => {
    
    let button = new CommandMenuButton(mockProps);

    button._onClick();

    expect(createPopUp).toHaveBeenCalled()
  });

  it('menu should update if already open', () => {
    
    let button = new CommandMenuButton(mockProps);
    button._menu = { close: jest.fn(), update: jest.fn() };

    button._onClick();

    expect( button._menu).toBeDefined();
  });

  it('menu should close when expand is false', () => {
    
    let button = new CommandMenuButton(mockProps);
    button._menu = { close: jest.fn(), update: jest.fn() };
    button.state.expanded = true;

    button._onClick();

    expect(button._menu).toBeNull();
  });

  it('menu should close on _onCommand', () => {
    
    let button = new CommandMenuButton(mockProps);
    button._onCommand();
    expect(button._menu).toBeNull();
  });

  it('menu should close when _onClose called', () => {
    
    let button = new CommandMenuButton(mockProps);
    button._menu = { close: jest.fn(), update: jest.fn() };

    button._onClose();

    expect(button._menu).toBeNull();
  });
});

