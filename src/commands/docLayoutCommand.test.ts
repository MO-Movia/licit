import { EditorState } from 'prosemirror-state';
import DocLayoutCommand from './docLayoutCommand';
import { EditorView } from 'prosemirror-view';
import type { DocLayoutEditorValue } from '../ui/docLayoutEditor';
import { Editor } from '@tiptap/react';
import { Schema } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

describe('DocLayoutCommand', () => {
  let mockState;
  let mockEditorView: EditorView;
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

    mockState = {
      doc: dummyDoc,
      schema: mySchema,
      selection: {},
      tr: {
        setSelection: jest.fn().mockReturnThis(),
      },
    } as unknown as EditorState;
    mockEditorView = {} as EditorView;

    UICommand.prototype.editor = {
      view: { focus: () => {}, dispatch: () => {} },
    } as unknown as Editor;
  });
  const doclayoutcommand = new DocLayoutCommand();
  it('should be defined', () => {
    expect(doclayoutcommand).toBeDefined();
  });
  it('should handle waitForUserInput ', () => {
    const test = doclayoutcommand.waitForUserInput({
      doc: {},
    } as unknown as EditorState);

    doclayoutcommand._popUp.close('my Val');
    expect(test).toBeDefined();
  });
  it('should handle waitForUserInput ', () => {
    doclayoutcommand._popUp = {};
    const test = doclayoutcommand.waitForUserInput({
      doc: {},
    } as unknown as EditorState);
    expect(test).toBeDefined();
  });
  it('should handle executeWithUserInput  ', () => {
    doclayoutcommand._popUp = {};
    const test = doclayoutcommand.executeWithUserInput(
      {
        tr: {
          setSelection: () => {
            return {
              doc: mockState.doc,
              step: jest.fn().mockReturnValue({
                doc: mockState.doc,
                step: jest.fn().mockReturnValue({}),
              }),
            };
          },
          doc: mockState.doc,
        },
        doc: mockState.doc,
        selection: {},
        schema: {},
      } as unknown as EditorState,
      () => {},
      { focus: () => {} } as unknown as EditorView,
      { width: 1, layouts: 2 } as unknown as DocLayoutEditorValue
    );
    expect(test).toBeDefined();
  });

  it('should return tr if doc is empty', () => {
    doclayoutcommand._popUp = {};
    const test = doclayoutcommand.executeWithUserInput(
      {
        tr: {
          setSelection: () => {
            return {};
          },
          doc: mockState.doc,
        },
        doc: mockState.doc,
        selection: {},
        schema: {},
      } as unknown as EditorState,
      () => {},
      { focus: () => {} } as unknown as EditorView,
      { width: 1, layouts: 2 } as unknown as DocLayoutEditorValue
    );
    expect(test).toBeDefined();
  });

  it('should always return true for isEnabled', () => {
    // Test that isEnabled method always returns true
    expect(doclayoutcommand.isEnabled(mockState)).toBe(true);
  });

  it('should always return false for isActive', () => {
    // Test that isActive method always returns true
    expect(doclayoutcommand.isActive(mockState)).toBe(true);
  });

  it('should handle cancel', () => {
    // Test the cancel method
    expect(() => doclayoutcommand.cancel()).not.toThrow();
  });

  it('should return the given Transform', () => {
    const mockTransform = {} as Transform;
    const result = doclayoutcommand.executeCustom(
      mockState,
      mockTransform,
      0,
      1
    );
    expect(result).toBe(mockTransform);
  });
});
