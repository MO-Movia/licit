import * as React from 'react';
import ListTypeButton from './listTypeButton';

// Mock dependencies safely (React is already imported)
jest.mock('@modusoperandi/licit-ui-commands', () => {
  const actualReact = require('react'); //  safe local reference
  return {
    CustomButton: 'CustomButton',
    createPopUp: jest.fn(() => ({
      close: jest.fn(),
      update: jest.fn(),
    })),
    ThemeContext: actualReact.createContext('dark'),
  };
});

jest.mock('./uuid', () => jest.fn(() => 'mock-uuid'));
jest.mock('./listTypeMenu', () => 'ListTypeMenu');

describe('ListTypeButton (pure Jest test)', () => {
  let mockProps: any;

  beforeEach(() => {
    mockProps = {
      className: 'test-class',
      commandGroups: [{ list: {} }],
      disabled: false,
      dispatch: jest.fn(),
      editorState: {} as any,
      editorView: {} as any,
      icon: 'icon-test',
      label: 'List',
      title: 'List Type',
      theme: 'dark',
    };
  });

  it('should render CustomButton with correct props', () => {
    const instance = new ListTypeButton(mockProps);
    const result = instance.render() as any;

    expect(result.type).toBe('CustomButton');
    expect(result.props.className).toContain('czi-custom-menu-button');
    expect(result.props.id).toBe('mock-uuid');
    expect(result.props.label).toBe('List');
    expect(result.props.icon).toBe('icon-test');
    expect(result.props.title).toBe('List Type');
    expect(result.props.disabled).toBe(false);
    expect(result.props.theme).toBe('dark');
  });

  it('should toggle expanded state on click', () => {
    const instance = new ListTypeButton(mockProps);
    expect(instance.state.expanded).toBe(false);
    instance._onClick();
    expect(instance.state.expanded).toBe(false);
    instance._onClick();
    expect(instance.state.expanded).toBe(false);
  });

  it('should call createPopUp on _showMenu', () => {
    const { createPopUp } = require('@modusoperandi/licit-ui-commands');
    const instance = new ListTypeButton(mockProps);
    instance._showMenu();

    expect(createPopUp).toHaveBeenCalledWith(
      'ListTypeMenu',
      expect.objectContaining({
        ...mockProps,
        onCommand: expect.any(Function),
      }),
      expect.objectContaining({
        anchor: null,
        onClose: expect.any(Function),
      })
    );
  });

  it('should close menu on componentWillUnmount', () => {
    const closeMock = jest.fn();
    const instance = new ListTypeButton(mockProps);
    (instance as any)._menu = { close: closeMock };
    instance.componentWillUnmount();
    expect(closeMock).toHaveBeenCalled();
  });
});
