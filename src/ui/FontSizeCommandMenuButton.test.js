import * as React from 'react';

import { FontSizeCommand } from '@modusoperandi/licit-ui-commands';
import CommandMenuButton from './CommandMenuButton.js';
import FontSizeCommandMenuButton, {
  parseFontSizeInput,
} from './FontSizeCommandMenuButton.js';
import findActiveFontSize from './findActiveFontSize.js';

jest.mock('@modusoperandi/licit-ui-commands', () => ({
  FontSizeCommand: jest.fn().mockImplementation((pt) => ({
    execute: jest.fn(() => true),
    pt,
  })),
}));

jest.mock('./CommandMenuButton.js', () => {
  return jest.fn(() => null);
});

jest.mock('./findActiveFontSize.js', () => jest.fn());

describe('FontSizeCommandMenuButton', () => {
  let dispatch;
  let editorState;
  let editorView;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = jest.fn();
    editorState = {};
    editorView = { disabled: false, focus: jest.fn() };
    findActiveFontSize.mockReturnValue('12');
  });

  function getRenderedControls(instance) {
    const wrapper = instance.render();
    const [input, menu] = React.Children.toArray(wrapper.props.children);
    return { input, menu, wrapper };
  }

  it('renders the active size in an editable decimal input', () => {
    const instance = new FontSizeCommandMenuButton({
      dispatch,
      editorState,
      editorView,
    });

    const { input, menu, wrapper } = getRenderedControls(instance);

    expect(wrapper.props.className).toBe('width-30 czi-font-size-control');
    expect(input.type).toBe('input');
    expect(input.props.inputMode).toBe('decimal');
    expect(input.props.value).toBe('12');
    expect(menu.type).toBe(CommandMenuButton);
  });

  it('parses only positive decimal values', () => {
    expect(parseFontSizeInput('10.7')).toBe(10.7);
    expect(parseFontSizeInput(' 11.25 ')).toBe(11.25);
    expect(parseFontSizeInput('0')).toBeNull();
    expect(parseFontSizeInput('-1')).toBeNull();
    expect(parseFontSizeInput('10pt')).toBeNull();
  });

  it('applies a decimal size and restores editor focus', () => {
    const instance = new FontSizeCommandMenuButton({
      dispatch,
      editorState,
      editorView,
    });
    instance.state = {
      inputValue: '10.7',
      invalid: false,
      isEditing: true,
    };

    instance._applyInputValue();

    expect(FontSizeCommand).toHaveBeenCalledWith(10.7);
    const command = FontSizeCommand.mock.results[0].value;
    expect(command.execute).toHaveBeenCalledWith(editorState, dispatch);
    expect(editorView.focus).toHaveBeenCalled();
  });

  it('marks invalid input without executing a command', () => {
    const instance = new FontSizeCommandMenuButton({
      dispatch,
      editorState,
      editorView,
    });
    instance.state = {
      inputValue: 'invalid',
      invalid: false,
      isEditing: true,
    };
    const setState = jest.spyOn(instance, 'setState');

    instance._applyInputValue();

    expect(FontSizeCommand).not.toHaveBeenCalled();
    expect(setState).toHaveBeenCalledWith({ invalid: true });
  });
});
