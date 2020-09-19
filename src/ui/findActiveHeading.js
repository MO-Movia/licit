// @flow

import {EditorState} from 'prosemirror-state';
import {HEADING} from '../NodeNames';
import {findParentNodeOfType} from 'prosemirror-utils';
export const HEADING_NAME_DEFAULT = 'Normal'; 
// [FS] IRAD-1042 2020-09-15
// To find the selected heading

export function findActiveHeading(state: EditorState): number {
  const {schema, doc, selection, tr} = state;
  const markType = schema.nodes[HEADING];
  if (!markType) {
    return HEADING_NAME_DEFAULT;
  }
  
  const fn = markType ? findParentNodeOfType(markType) : null;
  const headingName =  fn(state.selection);
  // const level = headingName.node.attrs.level; 
  if (headingName && undefined!==headingName) {
    return headingName.node.attrs.level;
  }

  return 0;
}
