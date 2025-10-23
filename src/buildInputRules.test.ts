import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import buildInputRules from './buildInputRules';
import { EditorView } from 'prosemirror-view';

describe('buildInputRules()', () => {
  let schema;
  let inputRulePlugin;

  beforeEach(() => {
    schema = new Schema({
      nodes: {
        doc: { content: 'block+' },
        paragraph: { content: 'text*', toDOM: () => ['p', 0], parseDOM: [{ tag: 'p' }] },
        ordered_list: {
          content: 'list_item+',
          group: 'block',
          attrs: { order: { default: 1 } },
          parseDOM: [{ tag: 'ol', getAttrs: (dom) => ({ order: dom.getAttribute('start') || 1 }) }],
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
      dispatch: () => { },
    } as unknown as EditorView;

    // Set the correct position for the insertion: from 1, and inserting "1. "
    const from = 1;
    const text = '1. ';
    const to = from + text.length;

    // Get the input rule and bind it to the plugin instance
    const rule = inputRulePlugin.spec.props!.handleTextInput!.bind(inputRulePlugin);

    // Apply the rule to simulate text insertion
    const applied = rule(mockView, from, to, text);

    // After applying the rule, the first node should be an ordered list
    const newState = applied ? state.apply(state.tr) : state;
    const firstNode = newState.doc.firstChild;

    expect(firstNode?.type.name).toBe('ordered_list');

  });
});

