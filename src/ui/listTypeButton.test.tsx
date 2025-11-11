import { EditorState } from 'prosemirror-state';
import ListTypeButton from './listTypeButton';
import { EditorView } from 'prosemirror-view';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { createPopUp } from '@modusoperandi/licit-ui-commands';
// Mock dependencies safely (React is already imported)
jest.mock('@modusoperandi/licit-ui-commands', () => {
  const React = jest.requireActual('react');

  return {
    CustomButton: 'CustomButton',
    createPopUp: jest.fn(() => ({
      close: jest.fn(),
      update: jest.fn(),
    })),
    ThemeContext: React.createContext('dark'),
  };
});

jest.mock('./uuid', () => jest.fn(() => 'mock-uuid'));
jest.mock('./listTypeMenu', () => 'ListTypeMenu');

describe('ListTypeButton (pure Jest test)', () => {
  let mockProps: ListTypeButton['props'];

  beforeEach(() => {
    mockProps = {
      className: 'test-class',
      commandGroups: [{ list: {} }] as unknown as Array<UICommand>,
      disabled: false,
      dispatch: jest.fn(),
      editorState: {} as EditorState,
      editorView: {} as EditorView,
      icon: 'icon-test',
      label: 'List',
      title: 'List Type',
      theme: 'dark',
    };
  });

  it('should render CustomButton with correct props', () => {
    const instance = new ListTypeButton(mockProps);
    const result = instance.render() as unknown as ListTypeButton;

    expect(result['type']).toBe('CustomButton');
    expect(result.props.className).toContain('czi-custom-menu-button');
    expect(result.props['id']).toBe('mock-uuid');
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
    (instance as unknown as ListTypeButton)._menu = { close: closeMock };
    instance.componentWillUnmount();
    expect(closeMock).toHaveBeenCalled();
  });

  it('should handle _onCommand by collapsing and hiding menu', () => {
    const instance = new ListTypeButton(mockProps);
    instance.setState({ expanded: true });
    
    const hideMenuSpy = jest.spyOn(instance, '_hideMenu');
    
    instance._onCommand();
    
    expect(instance.state.expanded).toBe(false);
    expect(hideMenuSpy).toHaveBeenCalled();
    
    hideMenuSpy.mockRestore();
  });

  it('should handle _onClose when menu exists', () => {
    const instance = new ListTypeButton(mockProps);
    instance.setState({ expanded: true });
    (instance as unknown as ListTypeButton)._menu = { 
      close: jest.fn(),
      update: jest.fn() 
    };
    
    instance._onClose();
    
    expect(instance.state.expanded).toBe(false);
    expect((instance as unknown as ListTypeButton)._menu).toBeNull();
  });

  it('should handle _onClose when menu does not exist', () => {
    const instance = new ListTypeButton(mockProps);
    instance.setState({ expanded: true });
    (instance as unknown as ListTypeButton)._menu = null;
    
    // Should not throw error
    instance._onClose();
    
    expect(instance.state.expanded).toBe(false); // State unchanged
  });
  
});
