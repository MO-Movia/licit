import { EditorState } from 'prosemirror-state';
import isEditorStateEmpty from './isEditorStateEmpty';

// Define the Zero-Width Space character
const ZERO_WIDTH_SPACE_CHAR = '\u200b';

// Helper to create a basic mock EditorState for simple text content
const createMockEditorState = (docContent: string, nodeSize: number): EditorState => {
  return {
    doc: {
      nodeSize,
      textContent: docContent,
      // Default mock for nodesBetween, can be overridden for specific tests
      // Not used for the nodeSize < 2 branch.
      nodesBetween: jest.fn((from, to, callback) => {
        // If content is present, simulate a single text node for simple cases
        if (docContent && docContent !== ' ' && docContent !== ZERO_WIDTH_SPACE_CHAR) {
          callback({ type: { isText: true } }, 0);
        }
      }),
    },
  } as unknown as EditorState;
};

describe('isEditorStateEmpty', () => {

  // --- Branch 1: nodeSize < 2 (Explicitly Covered) ---

  it('should return true when nodeSize is 1 and textContent is empty', () => {
    // Tests the `!text` condition when nodeSize < 2.
    const editorState = createMockEditorState('', 1);
    expect(isEditorStateEmpty(editorState)).toBe(true);
  });

  it('should return true when nodeSize is 1 and textContent is a single space', () => {
    // Tests the `text === ' '` condition when nodeSize < 2.
    const editorState = createMockEditorState(' ', 1);
    expect(isEditorStateEmpty(editorState)).toBe(true);
  });

  it('should return false when nodeSize is 1 and textContent is not empty or a space', () => {
    // Ensures the < 2 branch correctly returns false for content.
    const editorState = createMockEditorState('H', 1);
    expect(isEditorStateEmpty(editorState)).toBe(false);
  });

  // --- Branch 2: 2 <= nodeSize < 10 (Iteration check) ---

  it('should return true for an empty document using the nodesBetween logic (nodeSize = 5)', () => {
    const editorState = createMockEditorState('', 5);
    // In this branch, doc.nodesBetween should be called but the inner logic will find doc.textContent is empty.
    expect(isEditorStateEmpty(editorState)).toBe(true);
  });

  it('should return true for a document with only a zero-width space (nodeSize = 5)', () => {
    // Mock for the zero-width space text node
    const editorState = {
      doc: {
        nodeSize: 5,
        textContent: ZERO_WIDTH_SPACE_CHAR,
        nodesBetween: jest.fn((from, to, callback) => {
          // Simulate text node
          callback({ type: { isText: true } }, 0);
        }),
      },
    } as unknown as EditorState;
    expect(isEditorStateEmpty(editorState)).toBe(true);
    expect(editorState.doc.nodesBetween).toHaveBeenCalled();
  });

  it('should return false for a document with non-empty text (nodeSize = 5)', () => {
    const editorState = createMockEditorState('Hello', 5);
    // The mock simulates a text node, leading to isEmpty becoming false.
    expect(isEditorStateEmpty(editorState)).toBe(false);
  });

  it('should return false for a document with an atomic node (e.g., Image) (nodeSize = 5)', () => {
    const editorState = {
      doc: {
        nodeSize: 5,
        textContent: '', // Ensure text content doesn't falsely pass the check
        nodesBetween: jest.fn((from, to, callback) => {
          // Simulate an atomic node (isAtom: true)
          callback({ type: { isAtom: true, isText: false } }, 0);
        }),
      },
    } as unknown as EditorState;
    expect(isEditorStateEmpty(editorState)).toBe(false);
    expect(editorState.doc.nodesBetween).toHaveBeenCalled();
  });

  // --- Branch 3: nodeSize >= 10 (Early exit) ---

  it('should return false for a document with a node size of exactly 10', () => {
    // Tests the exact boundary condition for the final 'else' block.
    const editorState = createMockEditorState('Some content', 10);
    expect(isEditorStateEmpty(editorState)).toBe(false);
  });

  it('should return false for a non-empty document with a node size larger than 10', () => {
    const editorState = createMockEditorState('Some content', 15);
    expect(isEditorStateEmpty(editorState)).toBe(false);
  });
});