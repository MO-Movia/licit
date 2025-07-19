import { EditorState } from 'prosemirror-state';
import isEditorStateEmpty from './isEditorStateEmpty'; 
// Mocking ProseMirror's EditorState and Document
const createMockEditorState = (docContent: string, nodeSize: number) => {
  return {
    doc: {
      nodeSize,
      textContent: docContent,
      nodesBetween: jest.fn((from, to, callback) => {
        if (docContent && docContent !== ' ') {
          callback({ type: { isText: true }, textContent: docContent }, 0);
        }
      }),
    },
  } as unknown as EditorState;
};

describe('isEditorStateEmpty', () => {
  it('should return true for an empty document', () => {
    const editorState = createMockEditorState('', 2);
    expect(isEditorStateEmpty(editorState)).toBe(true);
  });

  it('should return true for a document with only a single space', () => {
    const editorState = createMockEditorState(' ', 2);
    expect(isEditorStateEmpty(editorState)).toBe(true);
  });

  it('should return true for a document with only a zero-width space', () => {
    const editorState = createMockEditorState('\u200b', 2); // ZERO_WIDTH_SPACE_CHAR
    expect(isEditorStateEmpty(editorState)).toBe(true);
  });

  it('should return false for a document with non-empty text', () => {
    const editorState = createMockEditorState('Hello World', 2);
    expect(isEditorStateEmpty(editorState)).toBe(false);
  });

  it('should return false for a document with an atomic node (like an image)', () => {
    const editorState = {
      doc: {
        nodeSize: 5,
        nodesBetween: jest.fn((from, to, callback) => {
          // Simulate an atomic node
          callback({ type: { isAtom: true } }, 0);
        }),
      },
    } as unknown as EditorState;
    expect(isEditorStateEmpty(editorState)).toBe(false);
  });

  it('should return false for a non-empty document with a node size larger than 10', () => {
    const editorState = createMockEditorState('Some content', 15);
    expect(isEditorStateEmpty(editorState)).toBe(false);
  });
});
