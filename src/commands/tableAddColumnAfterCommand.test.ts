/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { Editor } from '@tiptap/react';
import TableAddColumnAfterCommand from './tableAddColumnAfterCommand';
import { Schema } from 'prosemirror-model';

// Mock Editor (used by TableAddColumnAfterCommand)
jest.mock('@tiptap/react', () => {
  return {
    Editor: jest.fn().mockImplementation(() => ({
      commands: {
        addColumnAfter: jest.fn(),
      },
    })),
  };
});

describe('TableAddColumnAfterCommand', () => {
  let command: TableAddColumnAfterCommand;
  let mockState: EditorState;

  beforeEach(() => {
    // Mock state and selection
    const mySchema = new Schema({
      nodes: {
        doc: {
          attrs: { lineSpacing: { default: 'test' } },
          content: 'block+',
        },
        paragraph: {
          attrs: { lineSpacing: { default: 'test' } },
          content: 'text*',
          group: 'block',
        },
        heading: {
          attrs: { lineSpacing: { default: 'test' } },
          content: 'text*',
          group: 'block',
          defining: true,
        },
        bullet_list: {
          content: 'list_item+',
          group: 'block',
        },
        list_item: {
          attrs: { lineSpacing: { default: 'test' } },
          content: 'paragraph',
          defining: true,
        },
        blockquote: {
          attrs: { lineSpacing: { default: 'test' } },
          content: 'block+',
          group: 'block',
        },
        text: {
          inline: true,
        },
      },
    });
    const dummyDoc = mySchema.node('doc', null, [
      mySchema.node('heading', { marks: [] }, [mySchema.text('Heading 1')]),
      mySchema.node('paragraph', { marks: [] }, [
        mySchema.text('This is a paragraph'),
      ]),
      mySchema.node('bullet_list', { marks: [] }, [
        mySchema.node('list_item', { marks: [] }, [
          mySchema.node('paragraph', { marks: [] }, [
            mySchema.text('List item 1'),
          ]),
        ]),
        mySchema.node('list_item', { marks: [] }, [
          mySchema.node('paragraph', { marks: [] }, [
            mySchema.text('List item 2'),
          ]),
        ]),
      ]),
      mySchema.node('blockquote', { marks: [] }, [
        mySchema.node('paragraph', { marks: [] }, [
          mySchema.text('This is a blockquote'),
        ]),
      ]),
    ]);

    // Mock the editor instance to check if the addColumnAfter method gets called
    command = new TableAddColumnAfterCommand();
    mockState = {
      doc: dummyDoc,
      schema: mySchema,
      selection: {},
      tr: {
        setSelection: jest.fn().mockReturnThis(),
      },
    } as unknown as EditorState;
  });

  it('should return true when selection is inside a table', () => {
  const mockState = {
    selection: {
      $from: {
        depth: 3,
        node: (depth: number) =>
          depth === 1
            ? { type: { name: 'table' } }
            : { type: { name: 'paragraph' } },
      },
    },
  };

  expect(command.isEnabled(mockState as unknown as EditorState)).toBe(true);
});

  it('should call addColumnAfter when execute is called', () => {
    // Mock the addColumnAfter command method
    const addColumnAfterMock = jest
      .spyOn(command, 'getEditor')
      .mockReturnValue({
        commands: {
          addColumnAfter: () => {
            return true;
          },
        },
      } as unknown as Editor);

    // Call the execute method
    command.execute(mockState);

    // Verify that addColumnAfter was called
    expect(addColumnAfterMock).toHaveBeenCalled();
  });

  it('should return the result of addColumnAfter when execute is called', () => {
    // Mock the return value of addColumnAfter
    jest.spyOn(command, 'getEditor').mockReturnValue({
      commands: {
        addColumnAfter: () => {
          return true;
        },
      },
    } as unknown as Editor);

    // Call the execute method and check the return value
    const result = command.execute(mockState);

    // Verify that execute returns the expected value
    expect(result).toBe(true);
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
    // Test the behavior of waitForUserInput method
    const result = await command.waitForUserInput(mockState);
    expect(result).toBeNull(); // The mocked version returns null
  });

  it('should handle executeWithUserInput', () => {
    // Test the behavior of executeWithUserInput method
    const result = command.executeWithUserInput(mockState);
    expect(result).toBe(false); // The mocked version returns false
  });

  it('should handle cancel', () => {
    // Test the cancel method
    expect(() => command.cancel()).not.toThrow();
  });

  describe('executeCustom', () => {
    it('should return the given Transform', () => {
      const mockTransform = {} as Transform;
      const result = command.executeCustom(mockState, mockTransform, 0, 1);
      expect(result).toBe(mockTransform);
    });
  });
});
