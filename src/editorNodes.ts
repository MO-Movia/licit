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

export function updateEditorNodes(
  specNodes: OrderedMap<NodeSpec>
): OrderedMap<NodeSpec> {
  specNodes = specNodes.addToEnd(BULLET_LIST, BulletListNodeSpec);
  specNodes = specNodes.addToEnd(ORDERED_LIST, OrderedListNodeSpec);
  specNodes = specNodes.addToEnd(LIST_ITEM, ListItemNodeSpec);
  return specNodes;
}
