// @flow

import { Node, NodeType } from 'prosemirror-model';

// Commands that insert or replace block nodes must verify that the block
// containing the target position lives in a parent that accepts the node
// type before calling tr.insert / replaceSelection*. Inside a restrictive
// parent (e.g. enhanced_table_figure_notes), ProseMirror's replacement
// fitting moves an unsupported node outside the parent and splits the
// surrounding structure, which can produce malformed documents.
export function canNodeTypeReplaceBlockAt(
  doc: Node,
  pos: number,
  nodeType: NodeType
): boolean {
  const $pos = doc.resolve(pos);
  if ($pos.depth === 0) {
    return !!doc.contentMatchAt($pos.index()).matchType(nodeType);
  }
  if ($pos.parent.inlineContent) {
    // Inside a block: whether the block itself can be replaced in its parent.
    const depth = $pos.depth - 1;
    return $pos
      .node(depth)
      .canReplaceWith($pos.index(depth), $pos.index(depth) + 1, nodeType);
  }
  // At a boundary between children: the containing parent's content must
  // accept the type.
  return $pos.parent.canReplaceWith(
    $pos.index(),
    $pos.index() + 1,
    nodeType
  );
}
