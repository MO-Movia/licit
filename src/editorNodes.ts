/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { NodeSpec } from 'prosemirror-model';
import ListItemNodeSpec from './specs/listItemNodeSpec';
import {
  BULLET_LIST,
  LIST_ITEM,
  ORDERED_LIST,
} from '@modusoperandi/licit-ui-commands';
import OrderedListNodeSpec from './specs/orderedListNodeSpec';
import OrderedMap from 'orderedmap';
import BulletListNodeSpec from './specs/bulletListNodeSpec';
import LandscapeSectionNodeSpec from './specs/landscapeSectionNodeSpec';

const LANDSCAPE_SECTION = 'landscape_section';

export function updateEditorNodes(
  specNodes: OrderedMap<NodeSpec>
): OrderedMap<NodeSpec> {
  specNodes = specNodes.addToEnd(BULLET_LIST, BulletListNodeSpec);
  specNodes = specNodes.addToEnd(ORDERED_LIST, OrderedListNodeSpec);
  specNodes = specNodes.addToEnd(LIST_ITEM, ListItemNodeSpec);
  specNodes = specNodes.addToEnd(LANDSCAPE_SECTION, LandscapeSectionNodeSpec);
  return specNodes;
}
