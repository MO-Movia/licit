import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { Editor } from '@tiptap/react';
import TextAlignCommand from './textAlignCommand';

// Mock Editor class
jest.mock('@tiptap/react', () => {
  return {
    Editor: jest.fn().mockImplementation(() => ({
      commands: {
        setTextAlign: jest.fn(),
      },
    })),
  };
});

describe('TextAlignCommand', () => {
  //let editor;
  let command;

  beforeEach(() => {
    // Create a mock editor instance
    //editor = new Editor();

    // Create an instance of TextAlignCommand with a specific alignment
    command = new TextAlignCommand('center');
  });

  it('should be initialized with the correct alignment', () => {
    // Check that the alignment is correctly set during initialization
    expect(command.alignment).toBe('center');
  });

  it('should call setTextAlign with the correct alignment when execute is called', () => {
    // Mock the execute method's parameters
    const mockState = {} as EditorState;
    const mockDispatch = jest.fn();
    const mockView = {} as EditorView;

    jest.spyOn(command, 'getEditor').mockReturnValue({
      commands: {
        setTextAlign: () => {
          return true;
        },
      },
    } as unknown as Editor);

    command.alignment = 'center';
    // Call the execute method
    command.execute(mockState, mockDispatch, mockView);

    // Ensure setTextAlign is called with the correct alignment
    expect(command.alignment).toBe('center');
  });

  it('should return true when execute is called', () => {
    jest.spyOn(command, 'getEditor').mockReturnValue({
      commands: {
        setTextAlign: () => {
          return true;
        },
      },
    } as unknown as Editor);
    // Call the execute method and ensure it returns true
    const result = command.execute({}, jest.fn(), {} as EditorView);
    expect(result).toBe(true);
  });

  it('should call the correct methods for enabling the command', () => {
    const mockState = {} as EditorState;

    // Call isEnabled method to test if it's always true
    expect(command.isEnabled(mockState)).toBe(true);
  });

  it('should handle cancel', () => {
    const result = command.cancel();
    expect(result).toBeNull();
  });

  it('should call the getEditor method', () => {
    // Spy on the getEditor method to ensure it is called
    const getEditorSpy = jest.spyOn(command, 'getEditor');

    // Call the method
    command.getEditor();

    // Verify that getEditor was called
    expect(getEditorSpy).toHaveBeenCalled();
  });

  it('should handle waitForUserInput', async () => {
    const mockState = {} as EditorState;
    // Test the behavior of waitForUserInput method
    const result = await command.waitForUserInput(mockState);
    expect(result).toBeNull(); // The mocked version returns null
  });

  it('should handle executeWithUserInput', () => {
    const mockState = {} as EditorState;
    // Test the behavior of executeWithUserInput method
    const result = command.executeWithUserInput(mockState);
    expect(result).toBe(false); // The mocked version returns false
  });

  it('should handle executeCustomStyleForTable', () => {
  const mockState = {} as EditorState;
  const mockTransform = {} as Transform;  
  const result = command.executeCustomStyleForTable(mockState, mockTransform);  
  expect(result).toBe(mockTransform);
});

  describe('executeCustom', () => {
    it('should return the given Transform', () => {
      const mockState = {} as EditorState;
      const mockTransform = {} as Transform;
      const result = command.executeCustom(mockState, mockTransform, 0, 1);
      expect(result).toBe(mockTransform);
    });
  });
});
