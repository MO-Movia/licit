import { EditorState } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import EditorPageLayoutPlugin from './editorPageLayoutPlugin';
import { ATTRIBUTE_LAYOUT, LAYOUT } from '../constants';


// Custom schema with doc attributes for width, padding, and layout
const customSchema = new Schema({
  nodes: {
    doc: {
      content: 'block+',
      attrs: {
        width: { default: null },
        padding: { default: null },
        layout: { default: null },
      },
    },
    paragraph: {
      content: 'inline*',
      group: 'block',
      toDOM: () => ['p', 0],
      parseDOM: [{ tag: 'p' }],
    },
    text: {
      group: 'inline',
    },
  },
});


describe('EditorPageLayoutPlugin', () => {
  let plugin;
  let state: EditorState;
  let createDoc;

  beforeEach(() => {
    plugin = new EditorPageLayoutPlugin();

    // Helper to create a valid doc with attributes and a paragraph
    createDoc = (attrs) =>
      customSchema.node('doc', attrs, [customSchema.node('paragraph')]);

    // Initialize the state with the plugin
    state = EditorState.create({
      schema: customSchema,
      doc: createDoc({}),
      plugins: [plugin],
    });
  });

  test('should apply default attributes when no width or padding is provided', () => {
    const attributes = plugin.props.attributes(state);
    expect(attributes).toEqual({
      class: 'czi-prosemirror-editor',
      style: '',
    });
  });

  test('should apply custom width and padding correctly', () => {
    const customState = EditorState.create({
      schema: customSchema,
      doc: createDoc({ width: 800, padding: 20 }),
      plugins: [plugin],
    });

    const attributes = plugin.props.attributes(customState);
    expect(attributes).toEqual({
      class: 'czi-prosemirror-editor',
      style: 'width: 800pt;padding-left: 20pt;padding-right: 20pt;',
    });
  });

  test('should apply US letter landscape layout for width around 11 inches', () => {
    const customState = EditorState.create({
      schema: customSchema,
      doc: createDoc({ width: 792 }), // 11 inches * 72 points
      plugins: [plugin],
    });

    const attributes = plugin.props.attributes(customState);
    expect(attributes[ATTRIBUTE_LAYOUT]).toBe(LAYOUT.US_LETTER_LANDSCAPE);
  });

  test('should apply A4 portrait layout for width around 21 cm', () => {
    const customState = EditorState.create({
      schema: customSchema,
      doc: createDoc({ width: 595 }), // Approx 21 cm in points
      plugins: [plugin],
    });

    const attributes = plugin.props.attributes(customState);
    expect(attributes[ATTRIBUTE_LAYOUT]).toBe(LAYOUT.A4_PORTRAIT);
  });

  test('should apply custom width style when no predefined layout matches', () => {
    const customState = EditorState.create({
      schema: customSchema,
      doc: createDoc({ width: 1000 }), // Uncommon width
      plugins: [plugin],
    });

    const attributes = plugin.props.attributes(customState);
    expect(attributes.style).toContain('width: 1000pt;');
  });
});
