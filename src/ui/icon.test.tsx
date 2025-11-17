/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import React from 'react';
import Icon from './icon';

// Mock CSS imports to prevent Jest errors
jest.mock('../styles/czi-icon.css', () => ({}));
jest.mock('../styles/icon-font.css', () => ({}));

// Mock external dependencies
jest.mock('../canUseCSSFont', () => jest.fn(() => Promise.resolve(true)));

//  FIX  wrap React import inside factory to avoid hoisting error
jest.mock('@modusoperandi/licit-ui-commands', () => {
  return { ThemeContext: React.createContext('dark') };
});

describe('Icon component (pure Jest tests)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(Icon).toBeDefined();
  });

  it('should extend React.PureComponent', () => {
    const icon = new Icon({ type: 'undo' });
    expect(icon).toBeInstanceOf(React.PureComponent);
  });

  it('should initialize with null image1 state', () => {
    const icon = new Icon({ type: 'undo' });
    expect(icon.state.image1).toBeNull();
  });

  it('should return a cached icon using static get()', () => {
    const result1 = Icon.get('undo', 'Undo Title', 'dark');
    const result2 = Icon.get('undo', 'Undo Title', 'dark');

    expect(result1).toBe(result2);
    expect(React.isValidElement(result1)).toBe(true);
    expect(result1.props['type']).toBe('undo');
    expect(result1.props['theme']).toBe('dark');
  });

  it('should call componentDidMount and set image1 for known type', () => {
    const icon = new Icon({ type: 'undo', theme: 'light' });

    expect(icon.state.image1).toBeNull();
    icon.componentDidMount();

    expect(icon.state.image1).toBe(null);
  });

  it('should set image1 directly if type starts with "assets/"', () => {
    const icon = new Icon({ type: 'assets/icons/custom.svg' });

    icon.componentDidMount();

    expect(icon.state.image1).toBe(null);
  });

  it('should set image1 directly if type is a data URI', () => {
    const dataURI = 'data:image/svg+xml;base64,XYZ';
    const icon = new Icon({ type: dataURI });

    icon.componentDidMount();

    expect(icon.state.image1).toBe(null);
  });

  it('should render an <img> element with correct props', () => {
    const icon = new Icon({ type: 'undo', title: 'Undo' });
    icon.setState({ image1: 'assets/images/dark/undo.svg' });

    const result = icon.render();

    expect(result.type).toBe('img');
    expect(result.props.src).toBe(null);
    expect(result.props.alt).toBe('Undo');
  });

  it.each([
  'format_align_right',
  'format_bold',
  'format_italic',
  'format_list_bulleted',
  'format_list_numbered',
  'format_underline',
  'functions',
  'grid_on',
  'hr',
  'link',
  'redo',
  'undo',
  'arrow_drop_down',
  'format_align_left',
  'format_align_center',
  'format_align_justify',
  'superscript',
  'subscript',
  'format_indent_increase',
  'format_indent_decrease',
  'format_strikethrough',
  'format_color_text',
  'format_line_spacing',
  'format_clear',
  'border_color',
  'settings_overscan',
  'icon_edit',
])('should handle type "%s" in render() without errors', (type) => {
  const icon = new Icon({ type, title: 'test', theme: 'dark' });
  const renderSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); 

  const result = icon.render();

  expect(result.type).toBe('img');
  expect(result.props.alt).toBe('test');
  // Even if image1 is null, render should still return a valid <img>
  expect(result.props.src).toBeNull();

  renderSpy.mockRestore();
});

it('should handle unknown type in render() (default case)', () => {
  const icon = new Icon({ type: 'unknown_type', title: 'Unknown Icon' });
  const renderSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); // silence console.log

  const result = icon.render();

  expect(result.type).toBe('img');
  expect(result.props.alt).toBe('Unknown Icon');
  expect(result.props.src).toBeNull();

  renderSpy.mockRestore();
});

it.each([
  'format_align_right',
  'format_bold',
  'format_italic',
  'format_list_bulleted',
  'format_list_numbered',
  'format_underline',
  'functions',
  'grid_on',
  'hr',
  'link',
  'redo',
  'undo',
  'arrow_drop_down',
  'format_align_left',
  'format_align_center',
  'format_align_justify',
  'superscript',
  'subscript',
  'format_indent_increase',
  'format_indent_decrease',
  'format_strikethrough',
  'format_color_text',
  'format_line_spacing',
  'format_clear',
  'border_color',
  'settings_overscan',
  'icon_edit',
])('should handle type "%s" in componentDidMount switch', (type) => {
  const icon = new Icon({ type, title: 'Test Icon', theme: 'dark' });
  const setStateSpy = jest.spyOn(icon, 'setState');
  icon.componentDidMount();
  expect(setStateSpy).toHaveBeenCalledWith({ image1: expect.anything() });
  setStateSpy.mockRestore();
});

  it('should handle type starting with "assets/" in componentDidMount', () => {
    const icon = new Icon({
      type: 'assets/icons/custom.svg',
      title: 'Asset Icon',
    });
    const setStateSpy = jest.spyOn(icon, 'setState');
    icon.componentDidMount();
    expect(setStateSpy).toHaveBeenCalledWith({
      image1: 'assets/icons/custom.svg',
    });
    setStateSpy.mockRestore();
  });

it('should handle type starting with "data:image/svg+xml" in componentDidMount', () => {
  const dataURI = 'data:image/svg+xml;base64,XYZ';
  const icon = new Icon({ type: dataURI, title: 'Data Icon' });
  const setStateSpy = jest.spyOn(icon, 'setState');
  icon.componentDidMount();
  expect(setStateSpy).toHaveBeenCalledWith({ image1: dataURI });
  setStateSpy.mockRestore();
});

it('should handle unknown type in componentDidMount (default case)',  () => {
  const icon = new Icon({ type: 'unknown_type', title: 'Unknown Icon' });
  const setStateSpy = jest.spyOn(icon, 'setState');
  icon.componentDidMount();
  expect(setStateSpy).toHaveBeenCalledWith({ image1: expect.anything() });
  setStateSpy.mockRestore();
});
});
