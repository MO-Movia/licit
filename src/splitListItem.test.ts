/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {Schema} from 'prosemirror-model';
import {Transform, canSplit} from 'prosemirror-transform';
import {NodeSelection, TextSelection} from 'prosemirror-state';
import splitListItem, {splitEmptyListItem} from './splitListItem';
import {findParentNodeOfType} from 'prosemirror-utils';
import * as ProsemirrorTransform from 'prosemirror-transform';

jest.mock('prosemirror-transform', (): typeof ProsemirrorTransform => {
    const actual = jest.requireActual<typeof ProsemirrorTransform>('prosemirror-transform');

  return {
    ...actual,
    canSplit: jest.fn(() => true) as typeof ProsemirrorTransform.canSplit,
  };
});

// Mock findParentNodeOfType to allow control over return values
jest.mock('prosemirror-utils', () => ({
  findParentNodeOfType: jest.fn(() => jest.fn()),
}));

describe('splitListItem', () => {
  const schema = new Schema({
    nodes: {
      doc: {content: 'block+'},
      paragraph: {
        content: 'text*',
        group: 'block',
        toDOM: () => ['p', 0],
        parseDOM: [{tag: 'p'}],
      },
      text: {group: 'inline'},
      bullet_list: {
        content: 'list_item+',
        group: 'block',
        toDOM: () => ['ul', 0],
        parseDOM: [{tag: 'ul'}],
      },
      list_item: {
        content: 'paragraph block*',
        toDOM: () => ['li', 0],
        parseDOM: [{tag: 'li'}],
      },
    },
    marks: {},
  });

  const createTransformWithSelection = (): Transform => {
    const paragraph = schema.nodes.paragraph.create(null, schema.text('abc'));
    const listItem = schema.nodes.list_item.create(null, paragraph);
    const bulletList = schema.nodes.bullet_list.create(null, listItem);
    const doc = schema.nodes.doc.create(null, bulletList);
    const tr = new Transform(doc);

    // Create a real selection (no casting)
    const selection = TextSelection.create(tr.doc, 2, 2);
    (tr as Transform & {selection: TextSelection}).selection = selection;

    return tr;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (canSplit as jest.Mock).mockReturnValue(true);
  });

  it('returns tr unchanged when nodeType not found', () => {
    // Create a fake schema that excludes list_item and bullet_list (since it depends on list_item)
    const fakeNodes = schema.spec.nodes
      .remove('list_item')
      .remove('bullet_list');

    const fakeSchema = new Schema({
      nodes: fakeNodes,
      marks: schema.spec.marks,
    });

    const paragraph = schema.nodes.paragraph.create(null, schema.text('abc'));
    const tr = new Transform(schema.nodes.doc.create(null, paragraph));

    const result = splitListItem(tr, fakeSchema);
    expect(result).toBe(tr);
  });

  it('returns same Transform when selection missing', () => {
    const doc = schema.topNodeType.createAndFill();
    const tr = new Transform(doc);
    const result = splitListItem(tr, schema);
    expect(result).toBe(tr);
  });

  it('returns same Transform when grandParent.type !== nodeType', () => {
    const doc = schema.topNodeType.createAndFill();
    const tr = new Transform(doc);
    const selection = TextSelection.create(tr.doc, 1, 1);
    (tr as Transform & {selection: TextSelection}).selection = selection;
    const result = splitListItem(tr, schema);
    expect(result).toBe(tr);
  });

  it('returns same Transform when canSplit returns false', () => {
    (canSplit as jest.Mock).mockReturnValueOnce(false);
    const tr = createTransformWithSelection();
    const result = splitListItem(tr, schema);
    expect(result).toBeInstanceOf(Transform);
  });

   it('returns same Transform when node is block (NodeSelection)', () => {
    const paragraph = schema.nodes.paragraph.create(null, schema.text('test'));
    const doc = schema.nodes.doc.create(null, paragraph);
    const tr = new Transform(doc);
    const nodeSelection = NodeSelection.create(tr.doc, 0);
    (tr as Transform & {selection: NodeSelection}).selection = nodeSelection;
    const result = splitListItem(tr, schema);
    expect(result).toBe(tr);
  });

  it('returns same Transform when $from.depth < 2', () => {
    const paragraph = schema.nodes.paragraph.create(null, schema.text('test'));
    const doc = schema.nodes.doc.create(null, paragraph);
    const tr = new Transform(doc);
    const selection = TextSelection.create(tr.doc, 1);
    (tr as Transform & {selection: TextSelection}).selection = selection;
    const result = splitListItem(tr, schema);
    expect(result).toBe(tr);
  });

  it('returns same Transform when !$from.sameParent($to)', () => {
    const p1 = schema.nodes.paragraph.create(null, schema.text('first'));
    const p2 = schema.nodes.paragraph.create(null, schema.text('second'));
    const listItem1 = schema.nodes.list_item.create(null, p1);
    const listItem2 = schema.nodes.list_item.create(null, p2);
    const bulletList = schema.nodes.bullet_list.create(null, [listItem1, listItem2]);
    const doc = schema.nodes.doc.create(null, bulletList);
    const tr = new Transform(doc);
    // Selection spans across two list items
    const selection = TextSelection.create(tr.doc, 2, 8);
    (tr as Transform & {selection: TextSelection}).selection = selection;
    const result = splitListItem(tr, schema);
    expect(result).toBe(tr);
  });

  it('performs split when at end of parent and nextType exists', () => {
    const paragraph = schema.nodes.paragraph.create(null, schema.text('abc'));
    const listItem = schema.nodes.list_item.create(null, paragraph);
    const bulletList = schema.nodes.bullet_list.create(null, listItem);
    const doc = schema.nodes.doc.create(null, bulletList);
    const tr = new Transform(doc);
    // Position at end of paragraph content
    const selection = TextSelection.create(tr.doc, 5, 5);
    (tr as Transform & {selection: TextSelection}).selection = selection;
    
    const result = splitListItem(tr, schema);
    expect(result).toBeInstanceOf(Transform);
  });

  it('performs split with delete when $from.pos !== $to.pos', () => {
    const paragraph = schema.nodes.paragraph.create(null, schema.text('abc'));
    const listItem = schema.nodes.list_item.create(null, paragraph);
    const bulletList = schema.nodes.bullet_list.create(null, listItem);
    const doc = schema.nodes.doc.create(null, bulletList);
    const tr = new Transform(doc);
    // Selection with range
    const selection = TextSelection.create(tr.doc, 2, 4);
    (tr as Transform & {selection: TextSelection}).selection = selection;
    
    const result = splitListItem(tr, schema);
    expect(result).toBeInstanceOf(Transform);
  });
  
});

describe('splitEmptyListItem', () => {
  const schema = new Schema({
    nodes: {
      doc: {content: 'block+'},
      paragraph: {
        content: 'text*',
        group: 'block',
        toDOM: () => ['p', 0],
        parseDOM: [{tag: 'p'}],
      },
      text: {group: 'inline'},
      bullet_list: {
        content: 'list_item+',
        group: 'block',
        attrs: {name: {default: null}, counterReset: {default: null}, following: {default: null}},
        toDOM: () => ['ul', 0],
        parseDOM: [{tag: 'ul'}],
      },
      ordered_list: {
        content: 'list_item+',
        group: 'block',
        attrs: {name: {default: null}, counterReset: {default: null}, following: {default: null}},
        toDOM: () => ['ol', 0],
        parseDOM: [{tag: 'ol'}],
      },
      list_item: {
        content: 'paragraph block*',
        toDOM: () => ['li', 0],
        parseDOM: [{tag: 'li'}],
      },
    },
    marks: {},
  });

  const createTr = (): Transform => {
    const paragraph = schema.nodes.paragraph.create(null, schema.text('abc'));
    const listItem = schema.nodes.list_item.create(null, paragraph);
    const bulletList = schema.nodes.bullet_list.create(null, listItem);
    const doc = schema.nodes.doc.create(null, bulletList);
    const tr = new Transform(doc);
    const selection = TextSelection.create(tr.doc, 2);
    (tr as Transform & {selection: TextSelection}).selection = selection;
    return tr;
  };

  beforeEach(() => jest.clearAllMocks());

  it('returns same transform if required node types missing', () => {
    const fakeSchema = new Schema({
      nodes: {
        doc: {content: 'block+'},
        paragraph: {content: 'text*', group: 'block'},
        text: {}, // Required by ProseMirror
        bullet_list: {content: 'list_item+', group: 'block'},
        ordered_list: {content: 'list_item+', group: 'block'},
        list_item: {content: 'paragraph block*'},
      },
    });
    const tr = createTr();
    const result = splitEmptyListItem(tr, fakeSchema);
    expect(result).toBe(tr);
  });

  it('returns same transform if not inside list item', () => {
    const tr = createTr();
    (findParentNodeOfType as jest.Mock).mockReturnValueOnce(() => null);
    const result = splitEmptyListItem(tr, schema);
    expect(result).toBe(tr);
  });

  it('returns same transform if list item not empty', () => {
    const tr = createTr();
    (findParentNodeOfType as jest.Mock).mockReturnValueOnce(() => ({
      node: {textContent: 'not empty'},
    }));
    const result = splitEmptyListItem(tr, schema);
    expect(result).toBe(tr);
  });

  it('returns same transform if list not found', () => {
    const tr = createTr();
    (findParentNodeOfType as jest.Mock)
      .mockReturnValueOnce(() => ({node: {textContent: ''}}))
      .mockReturnValueOnce(() => null)
      .mockReturnValueOnce(() => null);

    const result = splitEmptyListItem(tr, schema);
    expect(result).toBe(tr);
  });  

it('returns same transform if list has fewer than 3 children', () => {
    // Create a list with only 2 items
    const p1 = schema.nodes.paragraph.create(null, schema.text('first'));
    const p2 = schema.nodes.paragraph.create();
    const listItem1 = schema.nodes.list_item.create(null, p1);
    const listItem2 = schema.nodes.list_item.create(null, p2);
    const bulletList = schema.nodes.bullet_list.create(null, [listItem1, listItem2]);
    const doc = schema.nodes.doc.create(null, bulletList);
    const tr = new Transform(doc);
    const selection = TextSelection.create(tr.doc, 8);
    (tr as Transform & {selection: TextSelection}).selection = selection;
    
    const listItemFound = {node: listItem2, pos: 7};
    const listFound = {node: bulletList, pos: 0};
    
    (findParentNodeOfType as jest.Mock)
      .mockReturnValueOnce(() => listItemFound)
      .mockReturnValueOnce(() => listFound);
    const result = splitEmptyListItem(tr, schema);
    expect(result).toBe(tr);
  });

    it('returns same transform if listItemIndex < 1', () => {
    // Create a list with 3 items, cursor in first item
    const p1 = schema.nodes.paragraph.create();
    const p2 = schema.nodes.paragraph.create(null, schema.text('second'));
    const p3 = schema.nodes.paragraph.create(null, schema.text('third'));
    const listItem1 = schema.nodes.list_item.create(null, p1);
    const listItem2 = schema.nodes.list_item.create(null, p2);
    const listItem3 = schema.nodes.list_item.create(null, p3);
    const bulletList = schema.nodes.bullet_list.create(null, [listItem1, listItem2, listItem3]);
    const doc = schema.nodes.doc.create(null, bulletList);
    const tr = new Transform(doc);
    const selection = TextSelection.create(tr.doc, 2);
    (tr as Transform & {selection: TextSelection}).selection = selection;
    
    const listItemFound = {node: listItem1, pos: 1};
    const listFound = {node: bulletList, pos: 0};
    
    (findParentNodeOfType as jest.Mock)
      .mockReturnValueOnce(() => listItemFound)
      .mockReturnValueOnce(() => listFound);
    const result = splitEmptyListItem(tr, schema);
    expect(result).toBe(tr);
  });

   it('returns same transform if listItemIndex >= childCount - 1', () => {
    // Create a list with 3 items, cursor in last item
    const p1 = schema.nodes.paragraph.create(null, schema.text('first'));
    const p2 = schema.nodes.paragraph.create(null, schema.text('second'));
    const p3 = schema.nodes.paragraph.create();
    const listItem1 = schema.nodes.list_item.create(null, p1);
    const listItem2 = schema.nodes.list_item.create(null, p2);
    const listItem3 = schema.nodes.list_item.create(null, p3);
    const bulletList = schema.nodes.bullet_list.create(null, [listItem1, listItem2, listItem3]);
    const doc = schema.nodes.doc.create(null, bulletList);
    const tr = new Transform(doc);
    const selection = TextSelection.create(tr.doc, 17);
    (tr as Transform & {selection: TextSelection}).selection = selection;
    
    const listItemFound = {node: listItem3, pos: 16};
    const listFound = {node: bulletList, pos: 0};
    
    (findParentNodeOfType as jest.Mock)
      .mockReturnValueOnce(() => listItemFound)
      .mockReturnValueOnce(() => listFound);
    const result = splitEmptyListItem(tr, schema);
    expect(result).toBe(tr);
  });

  it('generates new name when list has no name attribute', () => {
    // Create a list with 3 items, middle one is empty
    const p1 = schema.nodes.paragraph.create(null, schema.text('first'));
    const p2 = schema.nodes.paragraph.create();
    const p3 = schema.nodes.paragraph.create(null, schema.text('third'));
    const listItem1 = schema.nodes.list_item.create(null, p1);
    const listItem2 = schema.nodes.list_item.create(null, p2);
    const listItem3 = schema.nodes.list_item.create(null, p3);
    const bulletList = schema.nodes.bullet_list.create({name: null}, [listItem1, listItem2, listItem3]);
    const doc = schema.nodes.doc.create(null, bulletList);
    const tr = new Transform(doc);
    const selection = TextSelection.create(tr.doc, 10);
    (tr as Transform & {selection: TextSelection}).selection = selection;
    
    // Mock setSelection to avoid "not a function" error
    (tr as Transform & {setSelection: (sel: TextSelection) => Transform}).setSelection = jest.fn((sel) => {
      (tr as Transform & {selection: TextSelection}).selection = sel;
      return tr;
    });
    
    const listItemFound = {node: listItem2, pos: 9};
    const listFound = {node: bulletList, pos: 0};
    
    (findParentNodeOfType as jest.Mock)
      .mockReturnValueOnce(() => listItemFound)
      .mockReturnValueOnce(() => listFound);
    const result = splitEmptyListItem(tr, schema);
    expect(result).toBeInstanceOf(Transform);
  });

  it('uses existing name when list has name attribute', () => {
    // Create a list with 3 items, middle one is empty
    const p1 = schema.nodes.paragraph.create(null, schema.text('first'));
    const p2 = schema.nodes.paragraph.create();
    const p3 = schema.nodes.paragraph.create(null, schema.text('third'));
    const listItem1 = schema.nodes.list_item.create(null, p1);
    const listItem2 = schema.nodes.list_item.create(null, p2);
    const listItem3 = schema.nodes.list_item.create(null, p3);
    const bulletList = schema.nodes.bullet_list.create({name: 'existing-name'}, [listItem1, listItem2, listItem3]);
    const doc = schema.nodes.doc.create(null, bulletList);
    const tr = new Transform(doc);
    const selection = TextSelection.create(tr.doc, 10);
    (tr as Transform & {selection: TextSelection}).selection = selection;
    
    // Mock setSelection to avoid "not a function" error
    (tr as Transform & {setSelection: (sel: TextSelection) => Transform}).setSelection = jest.fn((sel) => {
      (tr as Transform & {selection: TextSelection}).selection = sel;
      return tr;
    });
    
    const listItemFound = {node: listItem2, pos: 9};
    const listFound = {node: bulletList, pos: 0};
    
    (findParentNodeOfType as jest.Mock)
      .mockReturnValueOnce(() => listItemFound)
      .mockReturnValueOnce(() => listFound);
    const result = splitEmptyListItem(tr, schema);
    expect(result).toBeInstanceOf(Transform);
  });

  it('sets counterReset and following for ordered lists', () => {
    // Create an ordered list with 3 items, middle one is empty
    const p1 = schema.nodes.paragraph.create(null, schema.text('first'));
    const p2 = schema.nodes.paragraph.create();
    const p3 = schema.nodes.paragraph.create(null, schema.text('third'));
    const listItem1 = schema.nodes.list_item.create(null, p1);
    const listItem2 = schema.nodes.list_item.create(null, p2);
    const listItem3 = schema.nodes.list_item.create(null, p3);
    const orderedList = schema.nodes.ordered_list.create({name: 'test-name'}, [listItem1, listItem2, listItem3]);
    const doc = schema.nodes.doc.create(null, orderedList);
    const tr = new Transform(doc);
    const selection = TextSelection.create(tr.doc, 10);
    (tr as Transform & {selection: TextSelection}).selection = selection;
    
    // Mock setSelection to avoid "not a function" error
    (tr as Transform & {setSelection: (sel: TextSelection) => Transform}).setSelection = jest.fn((sel) => {
      (tr as Transform & {selection: TextSelection}).selection = sel;
      return tr;
    });
    
    const listItemFound = {node: listItem2, pos: 9};
    const listFound = {node: orderedList, pos: 0};
    
    (findParentNodeOfType as jest.Mock)
      .mockReturnValueOnce(() => listItemFound)
      .mockReturnValueOnce(() => null)
      .mockReturnValueOnce(() => listFound);
    const result = splitEmptyListItem(tr, schema);
    expect(result).toBeInstanceOf(Transform);
  });

  it('performs split and inserts paragraph when valid', () => {
    // Create a list with 3 items, middle one is empty
    const p1 = schema.nodes.paragraph.create(null, schema.text('first'));
    const p2 = schema.nodes.paragraph.create();
    const p3 = schema.nodes.paragraph.create(null, schema.text('third'));
    const listItem1 = schema.nodes.list_item.create(null, p1);
    const listItem2 = schema.nodes.list_item.create(null, p2);
    const listItem3 = schema.nodes.list_item.create(null, p3);
    const bulletList = schema.nodes.bullet_list.create({}, [listItem1, listItem2, listItem3]);
    const doc = schema.nodes.doc.create(null, bulletList);
    const tr = new Transform(doc);
    const selection = TextSelection.create(tr.doc, 10);
    (tr as Transform & {selection: TextSelection}).selection = selection;
    
    // Mock setSelection to avoid "not a function" error
    (tr as Transform & {setSelection: (sel: TextSelection) => Transform}).setSelection = jest.fn((sel) => {
      (tr as Transform & {selection: TextSelection}).selection = sel;
      return tr;
    });
    
    const listItemFound = {node: listItem2, pos: 9};
    const listFound = {node: bulletList, pos: 0};
    
    (findParentNodeOfType as jest.Mock)
      .mockReturnValueOnce(() => listItemFound)
      .mockReturnValueOnce(() => listFound);
    const result = splitEmptyListItem(tr, schema);
    expect(result).toBeInstanceOf(Transform);
    // After the split, we should have a paragraph inserted
    expect(result.doc.childCount).toBeGreaterThan(1);
  });

});
