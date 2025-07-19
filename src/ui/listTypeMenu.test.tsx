import { render, fireEvent, screen } from '@testing-library/react';
import ListTypeMenu from './listTypeMenu'; // Adjust according to your file structure
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import React from 'react';
import '@testing-library/jest-dom';

// Mock the necessary props
const mockDispatch = jest.fn();
const mockEditorState = {} as any; // mock EditorState if necessary
const mockEditorView = {} as any; // mock EditorView if necessary
const mockOnCommand = jest.fn();

const commandGroups = [
  {
    'command1': { label: 'Command 1', execute: jest.fn(() => true), cancel: jest.fn() },
    'command2': { label: 'Command 2', execute: jest.fn(() => true), cancel: jest.fn() },
  },
];

// Test suite
describe('ListTypeMenu', () => {
  it('should render buttons for each command in commandGroups', () => {
    render(
      <ListTypeMenu
        commandGroups={commandGroups}
        dispatch={mockDispatch}
        editorState={mockEditorState}
        editorView={mockEditorView}
        onCommand={mockOnCommand}
      />
    );

    // Check that buttons are rendered with correct labels
    expect(screen.getByText('Command 1')).toBeInTheDocument();
    expect(screen.getByText('Command 2')).toBeInTheDocument();
  });

  it('should call _onUIEnter and _execute when a button is clicked', () => {
    render(
      <ListTypeMenu
        commandGroups={commandGroups}
        dispatch={mockDispatch}
        editorState={mockEditorState}
        editorView={mockEditorView}
        onCommand={mockOnCommand}
      />
    );

    // Get button by its label and click it
    const commandButton = screen.getByText('Command 1');
    fireEvent.click(commandButton);

    // Verify that _onUIEnter is called and _execute method is triggered
    expect(commandButton).toBeInTheDocument();
    expect(commandGroups[0]['command1'].execute).toHaveBeenCalled();
    expect(mockOnCommand).toHaveBeenCalled();
  });

  it('should render buttons with correct className and theme', () => {
    const theme = 'dark'; // Example theme
    const { container } = render(
      <ListTypeMenu
        commandGroups={commandGroups}
        dispatch={mockDispatch}
        editorState={mockEditorState}
        editorView={mockEditorView}
        onCommand={mockOnCommand}
        theme={theme}
      />
    );

    // Check that button has the theme class as well
    const button = screen.getByText('Command 1');
    expect(button).toHaveClass(`buttonsize ${theme}`);
  });

});
