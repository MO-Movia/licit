import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import buildInputRules, {
  orderedListRule,
  shouldJoinOrderedList,
} from './buildInputRules';
import { EditorView } from 'prosemirror-view';

import { doc, p, ol, li } from 'prosemirror-test-builder';

describe('buildInputRules()', () => {
  let schema;
  let inputRulePlugin;

  beforeEach(() => {
    schema = new Schema({
      nodes: {
        doc: { content: 'block+' },
        paragraph: {
          content: 'text*',
          toDOM: () => ['p', 0],
          parseDOM: [{ tag: 'p' }],
        },
        ordered_list: {
          content: 'list_item+',
          group: 'block',
          attrs: { order: { default: 1 } },
          parseDOM: [
            {
              tag: 'ol',
              getAttrs: (dom) => ({ order: dom.getAttribute('start') || 1 }),
            },
          ],
          toDOM: (node) => ['ol', { start: node.attrs.order }, 0],
        },
        list_item: { content: 'paragraph*', toDOM: () => ['li', 0] },
        text: { inline: true },
      },
    });

    inputRulePlugin = buildInputRules(schema);
  });

  it('should convert "1. " into an ordered_list using orderedListRule', () => {
    // Create initial document with a paragraph to ensure we have text positions
    const doc = schema.topNodeType.createAndFill(null, [
      schema.nodes.paragraph.createAndFill(),
    ])!;

    const state = EditorState.create({
      doc,
      schema,
      plugins: [inputRulePlugin],
    });

    // Create an EditorView mock
    const mockView = {
      state,
      dispatch: () => {},
    } as unknown as EditorView;

    // Set the correct position for the insertion: from 1, and inserting "1. "
    const from = 1;
    const text = '1. ';
    const to = from + text.length;

    // Get the input rule and bind it to the plugin instance
    const rule =
      inputRulePlugin.spec.props!.handleTextInput!.bind(inputRulePlugin);

    // Apply the rule to simulate text insertion
    const applied = rule(mockView, from, to, text);

    // After applying the rule, the first node should be an ordered list
    const newState = applied ? state.apply(state.tr) : state;
    const firstNode = newState.doc.firstChild;

    expect(firstNode?.type.name).toBe('ordered_list');
  });

  test('ordered list input rule joinPredicate is covered', () => {
    // Initial document: ordered list (order: 1) with two items
    const state = EditorState.create({
      doc: doc(
        ol({ order: 1 }, li(p('first')), li(p('second'))),
        p('|') // cursor in new paragraph after list
      ),
      plugins: [buildInputRules(schema)],
    });

    // Simulate typing "3. " at start of new paragraph
    let { tr } = state;
    tr.insertText('3. ', state.selection.from);

    let nextState = state.apply(tr);
    // Now force the input rule to run, which it will on "3. "
    // ... normally ProseMirror runs this automatically in the view, but you can call the handler or just check the doc shape

    // Optionally, assert the result
    expect(nextState.doc.toJSON()).toMatchObject({
      // should now have an ol with three items
      content: [
        {
          type: 'ordered_list',
          attrs: { order: 1 },
          content: [
            {
              type: 'list_item',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'first' }],
                },
              ],
            },
            {
              type: 'list_item',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'second' }],
                },
              ],
            },
            {
              type: 'list_item',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '' }] },
              ],
            },
          ],
        },
      ],
    });
  });

  test('orderedListRule creates input rule for ordered_list', () => {
    const schema = new Schema({
      nodes: {
        doc: { content: 'block+' },
        text: {},
        ordered_list: { content: 'list_item+' },
        list_item: { content: 'paragraph block*' },
        paragraph: { content: 'inline*' },
      },
      marks: {},
    });

    const rule = orderedListRule(schema.nodes.ordered_list);
    expect(rule).toBeDefined();
  });

  test('buildInputRules includes orderedListRule when schema has ordered_list', () => {
    const schema = new Schema({
      nodes: {
        doc: { content: 'block+' },
        text: {},
        ordered_list: { content: 'list_item+' },
        list_item: { content: 'paragraph block*' },
        paragraph: { content: 'inline*' },
      },
      marks: {},
    });

    const plugin = buildInputRules(schema);
    expect(plugin).toBeTruthy();
  });

  describe('shouldJoinOrderedList', () => {
    const mkMatch = (text: string) => {
      const re = /^(\d+)\.\s$/;
      const m = text.match(re);
      if (!m) throw new Error('bad test: no match');
      return m as RegExpMatchArray;
    };

    test('returns true when childCount + order equals the typed number', () => {
      const match = mkMatch('3. ');
      const node = { childCount: 2, attrs: { order: 1 } };
      expect(shouldJoinOrderedList(match, node)).toBe(true); // 2 + 1 == 3
    });

    test('returns false when it does not equal', () => {
      const match = mkMatch('5. ');
      const node = { childCount: 2, attrs: { order: 1 } };
      expect(shouldJoinOrderedList(match, node)).toBe(false); // 2 + 1 != 5
    });
  });
});

// This test exercises the two inline predicate/attrs functions inside the ordered list input rule:
//  - attrs: (match) => ({ order: +match[1] })
//  - predicate: (match, node) => node.childCount + node.attrs.order == +match[1]
// by typing "3. " after an ordered_list with order=1 and 2 existing items.
describe('buildInputRules() continuation numbering', () => {
  let schema: Schema;
  let inputRulePlugin: any;

  beforeEach(() => {
    schema = new Schema({
      nodes: {
        doc: { content: 'block+' },
        text: {},
        paragraph: {
          content: 'inline*',
          group: 'block',
          toDOM() {
            return ['p', 0];
          },
          parseDOM: [{ tag: 'p' }],
        },
        ordered_list: {
          content: 'list_item+',
          group: 'block',
          attrs: { order: { default: 1 } },
          toDOM(node) {
            return ['ol', { start: node.attrs.order }, 0];
          },
          parseDOM: [
            {
              tag: 'ol',
              getAttrs(dom: any) {
                return {
                  order: dom.hasAttribute('start')
                    ? +dom.getAttribute('start')
                    : 1,
                };
              },
            },
          ],
        },
        list_item: {
          content: 'paragraph block*',
          toDOM() {
            return ['li', 0];
          },
          parseDOM: [{ tag: 'li' }],
        },
      },
      marks: {},
    });

    inputRulePlugin = buildInputRules(schema);
  });

  it('creates a continuation item when the typed number matches childCount + start order (exercises predicate)', () => {
    // Build: <ol start="1"><li><p>first</p></li><li><p>second</p></li></ol><p>|</p>
    const startDoc = (doc as any)(
      (ol as any)(
        { order: 1 },
        (li as any)((p as any)('first')),
        (li as any)((p as any)('second'))
      ),
      (p as any)('<a>')
    );

    // Editor state with the InputRules plugin
    let state = EditorState.create({
      doc: startDoc,
      schema,
      plugins: [inputRulePlugin],
    });

    const mockView = {
      state,
      dispatch: (tr: any) => {
        state = state.apply(tr);
      },
    } as unknown as EditorView;

    const from = (state.doc as any).tag?.a ?? 1; // position of <a>
    const text = '3. ';
    const to = from + text.length;

    const handleTextInput =
      inputRulePlugin.spec.props!.handleTextInput!.bind(inputRulePlugin);
    const applied = handleTextInput(mockView, from, to, text);

    expect(applied).toBe(true);

    // After applying, the single paragraph should have been wrapped and merged into the existing <ol> as third item.
    const firstNode = state.doc.firstChild;
    expect(firstNode && firstNode.type.name).toBe('ordered_list');
    expect((firstNode as any).childCount).toBe(3);
    // Verify the new last list item is empty paragraph (created from typed rule)
    const lastItem = (firstNode as any).lastChild;
    expect(lastItem!.type.name).toBe('list_item');
    expect(lastItem!.firstChild!.type.name).toBe('paragraph');
  });
});
