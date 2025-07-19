import React from 'react';
import { render, screen } from '@testing-library/react';
import TableCellMenu from './TableCellMenu';
import { EditorState, PluginView } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import '@testing-library/jest-dom';

// Mock the CommandMenuButton and Icon components
jest.mock('./commandMenuButton', () => ({
  __esModule: true,
  default: ({ commandGroups, dispatch, editorState, editorView, icon, title }: any) => (
    <div data-testid="command-menu-button">
      {title}
    </div>
  ),
}));

jest.mock('./icon', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => 'mock-icon'),
  },
}));

// Define mock data for props
const mockEditorState = {} as EditorState;
const mockEditorView = {
  dispatch: jest.fn(),
} as unknown as EditorView;
const mockPluginView = {
  _menu: jest.fn(() => ['mock-group-1', 'mock-group-2']),
} as PluginView;
const mockActionNode = {} as Node;

describe('TableCellMenu', () => {
  it('should render the CommandMenuButton with correct props', () => {
    render(
      <TableCellMenu
        editorState={mockEditorState}
        editorView={mockEditorView}
        pluginView={mockPluginView}
        actionNode={mockActionNode}
      />
    );

    // Ensure the CommandMenuButton is rendered
    const buttonElement = screen.getByTestId('command-menu-button');
    expect(buttonElement).toHaveTextContent('Edit'); // Ensure the title is correct
    // Verify that the pluginView._menu function is called
    expect((mockPluginView as any)._menu).toHaveBeenCalledWith(mockEditorState, mockActionNode, expect.anything());
    
    // Verify the dispatch function is passed to the button
    expect(mockEditorView.dispatch).toBeDefined();
  });

  it('should use the default command groups if pluginView._menu is not present', () => {
    // Override the mockPluginView to not have _menu
    const mockPluginViewWithoutMenu = {} as PluginView;

    render(
      <TableCellMenu
        editorState={mockEditorState}
        editorView={mockEditorView}
        pluginView={mockPluginViewWithoutMenu}
        actionNode={mockActionNode}
      />
    );

    // Ensure the CommandMenuButton is rendered with the default command groups
    const buttonElement = screen.getByTestId('command-menu-button');
    expect(buttonElement).toHaveTextContent('Edit');
    
    // Verify _menu was not called
    expect((mockPluginViewWithoutMenu as any)._menu).toBeUndefined();
  });
});
