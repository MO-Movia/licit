/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import * as React from 'react';
import CommandMenuButton from './commandMenuButton';
import { EditorState } from 'prosemirror-state';
import { CustomButton, createPopUp } from '@modusoperandi/licit-ui-commands';
import { EditorView } from 'prosemirror-view';

//  Mock Dependencies
jest.mock('@modusoperandi/licit-ui-commands', () => ({
  CustomButton: (props: React.JSX.Element) => React.createElement('button', props),
  createPopUp: jest.fn(() => ({ close: jest.fn(), update: jest.fn() })),
  atAnchorRight: jest.fn(),
  ThemeContext: React.createContext('light'),
}));

jest.mock('@modusoperandi/licit-doc-attrs-step', () => ({
  UICommand: { theme: 'light' },
}));

jest.mock('../constants', () => ({
  EditorViewEx: jest.fn(),
}));

jest.mock('./editorToolbarConfig', () => ({
  isExpandButton: jest.fn(() => false),
}));

jest.mock('./uuid', () => jest.fn(() => 'mock-uuid'));

jest.mock('./commandMenu', () => 'CommandMenu');
  
const mockCommand = {
  isEnabled: jest.fn(() => true),
};

const mockCommandGroups = [
  { Bold: mockCommand },
];

const mockProps = {
  commandGroups: mockCommandGroups,
  dispatch: jest.fn(),
  editorState: {} as EditorState,
  editorView: {} as EditorView,
  title: 'Bold Menu',
  label: 'Bold',
  className: 'test-btn',
};

describe('CommandMenuButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    const element = React.createElement(CommandMenuButton, mockProps);
    expect(element).toBeTruthy();
  });

  test('initial state should not be expanded', () => {
    const instance = new (CommandMenuButton as  unknown as typeof CommandMenuButton)(mockProps);
    expect(instance.state.expanded).toBe(false);
  });

  test('should toggle expanded state on click', () => {
  const instance = new (CommandMenuButton as  unknown as typeof CommandMenuButton)(mockProps);
  const setStateSpy = jest.spyOn(instance, 'setState');

  // Simulate first click (expands)
  instance._onClick();
  expect(setStateSpy).toHaveBeenNthCalledWith(1, { expanded: true });

  // Manually reflect the state change (React would normally do this)
  instance.state.expanded = true;

  // Simulate second click (collapses)
  instance._onClick();
  expect(setStateSpy).toHaveBeenNthCalledWith(2, { expanded: false });
});

  test('should call createPopUp when _showMenu is triggered', () => {
    const instance = new (CommandMenuButton as unknown as typeof CommandMenuButton)(mockProps);
    instance._showMenu();

    expect(createPopUp).toHaveBeenCalled();
  });

  test('should close popup on _hideMenu', () => {
    const closeMock = jest.fn();
    const instance = new (CommandMenuButton as unknown as typeof CommandMenuButton)(mockProps);
    instance._menu = { close: closeMock };
    instance._hideMenu();

    expect(closeMock).toHaveBeenCalled();
    expect(instance._menu).toBeNull();
  });

  test('should set expanded to false on _onCommand', () => {
    const instance = new (CommandMenuButton as unknown as typeof CommandMenuButton)(mockProps);
    instance.setState({ expanded: true });
    instance._onCommand();
    expect(instance.state.expanded).toBe(false);
  });

  test('should nullify menu on _onClose', () => {
    const instance = new (CommandMenuButton as unknown as typeof CommandMenuButton)(mockProps);
    instance._menu = { dummy: true };
    instance._onClose();
    expect(instance._menu).toBeNull();
    expect(instance.state.expanded).toBe(false);
  });

  test('should set _menu to null on unmount', () => {
    const instance = new (CommandMenuButton as unknown as typeof CommandMenuButton)(mockProps);
    const hideMenuSpy = jest.spyOn(instance, '_hideMenu');
    instance.componentWillUnmount();
    expect(hideMenuSpy).toHaveBeenCalled();
  });

test('should pass correct theme to CustomButton', () => {
  const instance = new (CommandMenuButton as unknown as typeof CommandMenuButton)(mockProps);
  const rendered = instance.render();

  // The rendered element is a React element of type 'button' (CustomButton mock)
  expect(rendered.type).toBe(CustomButton);

  // Props passed to CustomButton should include theme derived from UICommand.theme
  expect(rendered.props['theme']).toBe('light');
  expect(rendered.props['className']).toContain('czi-custom-menu-button');
  expect(rendered.props['label']).toBe('Bold');
});


});

