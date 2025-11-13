/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { Mark, MarkType, Node } from 'prosemirror-model';

export default function findActiveMark(
  doc: Node,
  from: number,
  to: number,
  markType: MarkType
): Mark | null {
  let ii = from;
  if (doc.nodeSize <= 2) {
    return null;
  }
  const finder = (mark) => mark.type === markType;
  to = Math.min(to, doc.nodeSize - 2);

  while (ii <= to) {
    const node = doc.nodeAt(ii);
    if (!node?.marks) {
      ii++;
      continue;
    }
    const mark = node.marks.find(finder);
    if (mark) {
      return mark;
    }
    ii++;
  }
  return null;
}
