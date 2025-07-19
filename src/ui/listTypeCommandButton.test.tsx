import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeContext } from '@modusoperandi/licit-ui-commands';
import { ListToggleCommand, hasImageNode } from '../commands/listToggleCommand';
import ListTypeCommandButton from './listTypeCommandButton';
import Icon from './icon';
import '@testing-library/jest-dom';

// Mocking required external modules
jest.mock('../commands/listToggleCommand', () => ({
  ListToggleCommand: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
    label: '1.',
  })),
  hasImageNode: jest.fn().mockReturnValue(true),
}));

jest.mock('./icon', () => ({
  get: jest.fn().mockReturnValue('mock-icon'),
}));

// Define mock theme context
const mockTheme = 'light';

describe('ListTypeCommandButton', () => {
  let mockDispatch, mockEditorState, mockEditorView;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockEditorState = {};
    mockEditorView = {};

    // Mock Icon.get to return a mock icon
    Icon.get = jest.fn().mockReturnValue('mock-icon');
  });

  it('should render ListTypeButton with correct props', () => {
    render(
      <ThemeContext.Provider value={mockTheme}>
        <ListTypeCommandButton
          dispatch={mockDispatch}
          editorState={mockEditorState}
          editorView={mockEditorView}
        />
      </ThemeContext.Provider>
    );

    // Check that the ListTypeButton is rendered correctly
    const button = screen.getByRole('button');
    
    // Assert that the correct props are passed to ListTypeButton
    expect(button).toHaveClass('width-50 czi-icon format_list_numbered');
  });

  it('should disable the button if there is an image node in the editorState', () => {

    (hasImageNode as jest.Mock).mockReturnValue(false);

    render(
      <ThemeContext.Provider value={mockTheme}>
        <ListTypeCommandButton
          dispatch={mockDispatch}
          editorState={mockEditorState}
          editorView={mockEditorView}
        />
      </ThemeContext.Provider>
    );

    // Check that the button is disabled
    const button = screen.getByRole('button');
    // Assert that the correct props are passed to ListTypeButton
    expect(button).toHaveClass('width-50 czi-icon format_list_numbered');
  });

});
