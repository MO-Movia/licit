/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { Node, MarkType, Mark } from 'prosemirror-model';
import findActiveMark from './findActiveMark';

// Mock data for ProseMirror Node and Mark
const createMockNode = (marks: Mark[] = [], size: number = 1) => ({
  nodeSize: size,
  marks,
  nodeAt: jest.fn(function (pos: number) {
    return pos < size ? this as unknown as Node : null; // Returns null when position is out of range
  }),
}) as unknown as Node;

const createMockMark = (type: string) => ({
  type: { name: type } as MarkType,
}) as Mark;

describe('findActiveMark', () => {
  it('should return the active mark when it exists within the specified range', () => {
    const markType = 'bold';
    const mark = createMockMark(markType);
    const node = createMockNode([mark], 3);
    const doc = node; // Simulating a simple document with one node

    const result = findActiveMark(doc, 0, 1, mark.type);
    expect(result).toEqual(mark); // The mark should be found
  });

  it('should return null when no mark is found within the specified range', () => {
    const markType = 'italic';
    const mark = createMockMark('bold');
    const node = createMockNode([mark], 2);
    const doc = node; // Simulating a simple document with one node

    const result = findActiveMark(doc, 0, 1, { name: markType } as MarkType);
    expect(result).toBeNull(); // No matching mark should be found
  });

  it('should return null when document is empty', () => {
    const doc = createMockNode([], 0); // Empty node (empty document)

    const result = findActiveMark(doc, 0, 1, { name: 'bold' } as MarkType);
    expect(result).toBeNull(); // No marks should be found in an empty document
  });

  it('should handle edge case where node has no marks', () => {
    const node = createMockNode([], 2); // Node with no marks
    const doc = node; // Simulating a simple document with one node

    const result = findActiveMark(doc, 0, 1, { name: 'bold' } as MarkType);
    expect(result).toBeNull(); // No marks should be found in a node without marks
  });

  it('should return the correct mark when multiple marks are present', () => {
    const boldMark = createMockMark('bold');
    const italicMark = createMockMark('italic');
    const node = createMockNode([boldMark, italicMark], 3);
    const doc = node; // Simulating a simple document with one node

    const result = findActiveMark(doc, 0, 1, boldMark.type);
    expect(result).toEqual(boldMark); // The bold mark should be returned
  });

  it('should correctly handle multiple nodes', () => {
    const boldMark = createMockMark('bold');
    const italicMark = createMockMark('italic');
    const node1 = createMockNode([boldMark], 1);
    const node2 = createMockNode([italicMark], 2);
    const doc = {
      nodeAt: jest.fn((pos: number) => {
        if (pos === 0) return node1;
        if (pos === 1) return node2;
        return null;
      }),
      nodeSize: 3,
    } as unknown as Node;

    const result = findActiveMark(doc, 0, 2, italicMark.type);
    expect(result).toEqual(italicMark); // The italic mark in node2 should be returned
  });

  it('should handle an invalid range gracefully', () => {
    const boldMark = createMockMark('bold');
    const node = createMockNode([boldMark], 2);
    const doc = node; // Simulating a simple document with one node

    const result = findActiveMark(doc, 2, 3, boldMark.type); // Out-of-range query
    expect(result).toBeNull(); // No mark should be found out of range
  });

  it('skips positions when nodeAt returns null', () => {
  // nodeSize > 2 so function doesn't return early
  const doc = {
    nodeSize: 5,
    nodeAt: jest.fn().mockReturnValue(null), // always returns null -> triggers !node branch
  } as unknown as Node;

  const result = findActiveMark(doc, 0, 2, { name: 'bold' } as MarkType);
  expect(result).toBeNull();
  expect(doc.nodeAt).toHaveBeenCalled(); // optional: ensures the loop actually called nodeAt
});

 it('skips nodes that do not have marks (node.marks is falsy)', () => {
    // ?? Define minimal mock interfaces instead of `any`
    interface MockNode {
      nodeSize: number;
      marks?: unknown[];
    }

    const nodeWithoutMarks: MockNode = {
      nodeSize: 1,
      // intentionally no 'marks'
    };

    const doc = {
      nodeSize: 4,
      nodeAt: jest.fn((pos: number): MockNode | null =>
        pos === 0 ? nodeWithoutMarks : null
      ),
    };

    // ? Cast to Node only once (to satisfy function signature)
    const result = findActiveMark(
      doc as unknown as Node,
      0,
      1,
      { name: 'bold' } as unknown as MarkType
    );

    expect(result).toBeNull();
    expect(doc.nodeAt).toHaveBeenCalledWith(0);
  });
});
