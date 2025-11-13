/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TableCellMenu from './tableCellMenu';
import CommandMenuButton from './commandMenuButton';
import Icon from './icon';
import { TABLE_COMMANDS_GROUP } from './editorToolbarConfig';
import { EditorState, PluginView } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

// Mock dependencies
jest.mock('./commandMenuButton', () => jest.fn(() => React.createElement('button')));
jest.mock('./icon', () => ({
  get: jest.fn(() => 'mock-icon'),
}));

describe('TableCellMenu', () => {
  let container: HTMLDivElement;
  let mockEditorState: EditorState;
  let mockEditorView: EditorView;
  let mockPluginView: PluginView;
  let mockActionNode: Node;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    mockEditorState = { doc: {} } as EditorState;
    mockEditorView = { dispatch: jest.fn() } as unknown as EditorView;
    mockActionNode = document.createElement('div');
    mockPluginView = {} as PluginView;

    jest.clearAllMocks();
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
  });

  test('renders with TABLE_COMMANDS_GROUP when pluginView._menu is not defined', () => {
    const element = React.createElement(TableCellMenu, {
      editorState: mockEditorState,
      editorView: mockEditorView,
      pluginView: mockPluginView,
      actionNode: mockActionNode,
    });

    ReactDOM.render(element, container);

    expect(CommandMenuButton).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'czi-table-cell-menu',
        commandGroups: TABLE_COMMANDS_GROUP,
        dispatch: mockEditorView.dispatch,
        editorState: mockEditorState,
        editorView: mockEditorView,
        icon: 'mock-icon',
        title: 'Edit',
      }),
      {}
    );

    expect(Icon.get).toHaveBeenCalledWith('icon_edit');
  });

  test('uses pluginView._menu return value if defined', () => {
    const mockCmdGroups = [{ label: 'CustomCmd' }];
    mockPluginView['_menu'] = jest.fn(() => mockCmdGroups);

    const element = React.createElement(TableCellMenu, {
      editorState: mockEditorState,
      editorView: mockEditorView,
      pluginView: mockPluginView,
      actionNode: mockActionNode,
    });

    ReactDOM.render(element, container);

    expect(mockPluginView['_menu']).toHaveBeenCalledWith(
      mockEditorState,
      mockActionNode,
      TABLE_COMMANDS_GROUP
    );

    expect(CommandMenuButton).toHaveBeenCalledWith(
      expect.objectContaining({
        commandGroups: mockCmdGroups,
      }),
      {}
    );
  });
});
