import HardBreakNodeSpec from './hardBreakNodeSpec';
import { Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

describe('HardBreakNodeSpec', () => {
  it('should have correct properties', () => {
    const nodeSpec: NodeSpec = HardBreakNodeSpec;

    // Check the properties of the node spec
    expect(nodeSpec.inline).toBe(true);
    expect(nodeSpec.group).toBe('inline');
    expect(nodeSpec.selectable).toBe(false);
    expect(nodeSpec.parseDOM).toEqual([{ tag: 'br' }]);
  });

  it('toDOM should return correct DOM structure', () => {
    const nodeSpec: NodeSpec = HardBreakNodeSpec;

    // Create a mock node (no specific properties needed for this it)
    const mockNode = {} as unknown as ProseMirrorNode;

    // Check the output of the toDOM method
    expect(nodeSpec.toDOM(mockNode)).toEqual(['br']);
  });

  it('parseDOM should parse <br> correctly', () => {
    const nodeSpec: NodeSpec = HardBreakNodeSpec;

    // Check that parseDOM correctly identifies <br> tags
    const parseDOM = nodeSpec.parseDOM;
    expect(parseDOM).toHaveLength(1);
    expect(parseDOM[0].tag).toBe('br');
  });
});
