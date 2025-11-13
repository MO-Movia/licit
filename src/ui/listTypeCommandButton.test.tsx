/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ListTypeCommandButton from './listTypeCommandButton';
import { ThemeContext } from '@modusoperandi/licit-ui-commands';
import { hasImageNode } from '../commands/listToggleCommand';
import ListTypeButton from './listTypeButton';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

//  Mock dependencies
jest.mock('../commands/listToggleCommand', () => ({
  ListToggleCommand: jest.fn().mockImplementation(() => ({ label: '' })),
  hasImageNode: jest.fn(),
}));

jest.mock('./listTypeButton', () => jest.fn(() => <div className="mock-list-type-button" />));

jest.mock('./icon', () => ({
  get: jest.fn(() => 'mock-icon'),
}));

describe('ListTypeCommandButton', () => {
  let container: HTMLDivElement;
  let mockDispatch: jest.Mock;
  let mockEditorState: EditorState;
  let mockEditorView: EditorView;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockDispatch = jest.fn();
    mockEditorState = {} as EditorState;
    mockEditorView = { disabled: false } as unknown as EditorView;
    (hasImageNode as jest.Mock).mockReturnValue(false);
    jest.clearAllMocks();
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
  });

  test('renders ListTypeButton with correct props', () => {
    const theme = 'light';

    const element = (
      <ThemeContext.Provider value={theme}>
        <ListTypeCommandButton
          dispatch={mockDispatch}
          editorState={mockEditorState}
          editorView={mockEditorView}
        />
      </ThemeContext.Provider>
    );

    ReactDOM.render(element, container);

    //  ListTypeButton should have been called with expected props
    expect(ListTypeButton).toHaveBeenCalledTimes(1);
    const props = (ListTypeButton as unknown as jest.Mock).mock.calls[0][0];

    expect(props.className).toBe('width-50 czi-icon format_list_numbered');
    expect(props.dispatch).toBe(mockDispatch);
    expect(props.editorState).toBe(mockEditorState);
    expect(props.editorView).toBe(mockEditorView);
    expect(props.icon).toBe('mock-icon');
    expect(props.theme).toBe(theme);
  });

  test('disables button when editorView.disabled is true', () => {
    const theme = 'dark';
    mockEditorView['disabled'] = true;

    ReactDOM.render(
      <ThemeContext.Provider value={theme}>
        <ListTypeCommandButton
          dispatch={mockDispatch}
          editorState={mockEditorState}
          editorView={mockEditorView}
        />
      </ThemeContext.Provider>,
      container
    );

    const props = (ListTypeButton as unknown as jest.Mock).mock.calls[0][0];
    expect(props.disabled).toBe(true);
  });

  test('disables button when hasImageNode returns true', () => {
    const theme = 'dark';
    (hasImageNode as jest.Mock).mockReturnValue(true);

    ReactDOM.render(
      <ThemeContext.Provider value={theme}>
        <ListTypeCommandButton
          dispatch={mockDispatch}
          editorState={mockEditorState}
          editorView={mockEditorView}
        />
      </ThemeContext.Provider>,
      container
    );

    const props = (ListTypeButton as unknown as jest.Mock).mock.calls[0][0];
    expect(props.disabled).toBe(true);
  });

  test('enabled when editorView.disabled is false and hasImageNode is false', () => {
    const theme = 'light';
    (hasImageNode as jest.Mock).mockReturnValue(false);
    mockEditorView['disabled'] = false;

    ReactDOM.render(
      <ThemeContext.Provider value={theme}>
        <ListTypeCommandButton
          dispatch={mockDispatch}
          editorState={mockEditorState}
          editorView={mockEditorView}
        />
      </ThemeContext.Provider>,
      container
    );

    const props = (ListTypeButton as unknown as jest.Mock).mock.calls[0][0];
    expect(props.disabled).toBe(false);
  });

  test('handles missing editorView gracefully', () => {
    const theme = 'light';

    ReactDOM.render(
      <ThemeContext.Provider value={theme}>
        <ListTypeCommandButton
          dispatch={mockDispatch}
          editorState={mockEditorState}
          editorView={undefined}
        />
      </ThemeContext.Provider>,
      container
    );

    const props = (ListTypeButton as unknown as jest.Mock).mock.calls[0][0];
    expect(props.disabled).toBe(false); // no editorView, defaults to false
  });

});
