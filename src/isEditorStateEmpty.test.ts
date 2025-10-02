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

  it('returns true when nodeSize < 10 and content is only a single space', () => {
    // nodesBetween won't invoke the callback in our mock for a single space,
    // so isEmpty stays true inside the <10 branch.
    const editorState = createMockEditorState(' ', 5);
    expect(isEditorStateEmpty(editorState)).toBe(true);
  });

  it('returns true when nodeSize < 10 and content is only ZERO-WIDTH SPACE', () => {
    // nodesBetween callback runs with isText=true; text check should treat ZWSP as empty
    const editorState = createMockEditorState('\u200b', 5);
    expect(isEditorStateEmpty(editorState)).toBe(true);
  });

  it('returns false when nodeSize < 10 and content has non-empty text', () => {
    // nodesBetween callback runs with isText=true; text check should set isEmpty=false
    const editorState = createMockEditorState('Hello', 5);
    expect(isEditorStateEmpty(editorState)).toBe(false);
  });

  // --- Cover nodeSize < 2 path (both outcomes) ---
  it('nodeSize < 2: returns true for single space', () => {
    const editorState = {
      doc: { nodeSize: 1, textContent: ' ' },
    } as unknown as EditorState;
    expect(isEditorStateEmpty(editorState)).toBe(true);
  });

  it('nodeSize < 2: returns false for non-empty text', () => {
    const editorState = {
      doc: { nodeSize: 1, textContent: 'X' },
    } as unknown as EditorState;
    expect(isEditorStateEmpty(editorState)).toBe(false);
  });

  // --- Cover non-text/non-atom node path under <10 (else-if false branch) ---
  it('nodeSize < 10: non-text & non-atom node keeps isEmpty true', () => {
    const editorState = {
      doc: {
        nodeSize: 5,
        textContent: '', // not used in this branch
        nodesBetween: jest.fn((from, to, cb) => {
          cb({ type: { isText: false, isAtom: false } }, 0); // neither text nor atom
        }),
      },
    } as unknown as EditorState;
    expect(isEditorStateEmpty(editorState)).toBe(true);
  });

  // --- Cover "!text" arm of the OR in the text check ---
  it('nodeSize < 10: treats undefined text as empty (!text branch)', () => {
    const editorState = {
      doc: {
        nodeSize: 5,
        // no textContent property => undefined
        nodesBetween: jest.fn((from, to, cb) => {
          cb({ type: { isText: true } }, 0);
        }),
      },
    } as unknown as EditorState;
    expect(isEditorStateEmpty(editorState)).toBe(true);
  });

  // --- Cover the false branch of "if (isEmpty)" by invoking callback twice ---
  it('nodeSize < 10: second nodesBetween call hits (isEmpty === false) branch', () => {
    const editorState = {
      doc: {
        nodeSize: 5,
        textContent: 'Hello', // first call will set isEmpty = false
        nodesBetween: jest.fn((from, to, cb) => {
          cb({ type: { isText: true } }, 0); // sets isEmpty = false
          cb({ type: { isText: true } }, 1); // executes with isEmpty === false
        }),
      },
    } as unknown as EditorState;
    expect(isEditorStateEmpty(editorState)).toBe(false);
  });
});
