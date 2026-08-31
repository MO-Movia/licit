
import { FontSizeCommand } from '@modusoperandi/licit-ui-commands';
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

  it('parses only positive decimal values', () => {
    expect(parseFontSizeInput('10.7')).toBe(10.7);
    expect(parseFontSizeInput(' 11.25 ')).toBe(11.25);
    expect(parseFontSizeInput('0')).toBeNull();
    expect(parseFontSizeInput('-1')).toBeNull();
    expect(parseFontSizeInput('10pt')).toBeNull();
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
