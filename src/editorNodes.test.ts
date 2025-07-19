import { NodeSpec } from 'prosemirror-model';
import OrderedMap from 'orderedmap';
import { updateEditorNodes } from './editorNodes';
import ListItemNodeSpec from './specs/listItemNodeSpec';
import OrderedListNodeSpec from './specs/orderedListNodeSpec';
import BulletListNodeSpec from './specs/bulletListNodeSpec';
import { BULLET_LIST, LIST_ITEM, ORDERED_LIST } from '@modusoperandi/licit-ui-commands';

jest.mock('./specs/listItemNodeSpec', () => ({}));
jest.mock('./specs/orderedListNodeSpec', () => ({}));
jest.mock('./specs/bulletListNodeSpec', () => ({}));

describe('updateEditorNodes', () => {
    let initialSpecNodes: OrderedMap<NodeSpec>;

    beforeEach(() => {
        initialSpecNodes = OrderedMap.from({
            paragraph: {},
            text: {},
        });
    });

    test('should add BULLET_LIST, ORDERED_LIST, and LIST_ITEM to OrderedMap', () => {
        const updatedNodes = updateEditorNodes(initialSpecNodes);

        expect(updatedNodes.size).toBe(5); // 2 initial nodes + 3 new ones
        expect(updatedNodes.get(BULLET_LIST)).toBe(BulletListNodeSpec);
        expect(updatedNodes.get(ORDERED_LIST)).toBe(OrderedListNodeSpec);
        expect(updatedNodes.get(LIST_ITEM)).toBe(ListItemNodeSpec);
    });

    test('should return a new OrderedMap instance', () => {
        const updatedNodes = updateEditorNodes(initialSpecNodes);

        expect(updatedNodes).not.toBe(initialSpecNodes); // Ensure immutability
    });
});
