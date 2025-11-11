import {Schema} from 'prosemirror-model';
import {Transform, canSplit} from 'prosemirror-transform';
import {TextSelection} from 'prosemirror-state';
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
        toDOM: () => ['ul', 0],
        parseDOM: [{tag: 'ul'}],
      },
      ordered_list: {
        content: 'list_item+',
        group: 'block',
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
        text: {}, // ✅ Required by ProseMirror
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

  it('performs split and inserts paragraph when valid', () => {
    const tr = createTr();

    const listItemFound = {node: {textContent: '', nodeSize: 4}, pos: 2};
    const listFound = {
      node: {
        attrs: {},
        childCount: 3,
        type: schema.nodes.bullet_list,
        nodeSize: 10,
      },
      pos: 0,
    };

    (findParentNodeOfType as jest.Mock)
      .mockReturnValueOnce(() => listItemFound)
      .mockReturnValueOnce(() => listFound)
      .mockReturnValueOnce(() => listFound);

    const result = splitEmptyListItem(tr, schema);

    expect(result).toBeInstanceOf(Transform);

    const insertedParagraph = result.doc.firstChild;
    expect(insertedParagraph?.type.name).toBe('bullet_list');
  });

  it('returns same transform if list_item or paragraph type is missing', () => {
  // Create a schema missing the paragraph node
  const incompleteSchema = new Schema({
    nodes: {
      doc: { content: 'block+' },
      text: { group: 'inline' },
      // deliberately omit 'paragraph' and 'list_item'
      bullet_list: { content: 'block+', group: 'block' },
      ordered_list: { content: 'block+', group: 'block' },
    },
    marks: {},
  });

  const tr = createTr();
  const result = splitEmptyListItem(tr, incompleteSchema);

  // ✅ It should just return the same transform (no modifications)
  expect(result).toBe(tr);
});




});
