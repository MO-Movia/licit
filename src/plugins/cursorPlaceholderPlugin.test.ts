import { EditorState, PluginKey, TextSelection } from 'prosemirror-state';
import { Schema, DOMParser } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import CursorPlaceholderPlugin, {
  showCursorPlaceholder,
  hideCursorPlaceholder,
  findCursorPlaceholderPos,
  resetSingletonInstance,
} from './CursorPlaceholderPlugin';
import { SPEC } from './CursorPlaceholderPlugin'; // Ensure SPEC is exported

describe('CursorPlaceholderPlugin', () => {
  let state;
  let view;
  let plugin;

  const createEditorState = () => {
    const doc = basicSchema.node('doc', null, [
      basicSchema.node('paragraph', null, basicSchema.text('Hello World')),
    ]);

    return EditorState.create({
      doc,
      schema: basicSchema,
      plugins: [new CursorPlaceholderPlugin()],
    });
  };

  beforeEach(() => {
    resetSingletonInstance();

    const div = document.createElement('div');
    document.body.appendChild(div);

    state = createEditorState();

    view = new EditorView(div, {
      state,
    });

    // Use PluginKey from SPEC
    plugin = SPEC.key;
  });

  afterEach(() => {
    view.destroy();
  });

  test('should initialize with an empty DecorationSet', () => {
    const pluginState = plugin.getState(view.state);
    expect(pluginState).not.toBeUndefined();
    expect(pluginState).toBeInstanceOf(Object);
    expect(pluginState.find().length).toBe(0);
  });

  test('should add a cursor placeholder', () => {
    const tr = showCursorPlaceholder(view.state);
    view.dispatch(tr);

    const pos = findCursorPlaceholderPos(view.state);
    expect(pos).not.toBeNull();

    const pluginState = plugin.getState(view.state);
    const decorations = pluginState.find();
    expect(decorations.length).toBe(1);
    expect(decorations[0].spec.id.name).toBe('CursorPlaceholderPlugin');
  });

  test('should remove a cursor placeholder', () => {
    let tr = showCursorPlaceholder(view.state);
    view.dispatch(tr);

    tr = hideCursorPlaceholder(view.state);
    view.dispatch(tr);

    const pos = findCursorPlaceholderPos(view.state);
    expect(pos).toBeNull();

    const pluginState = plugin.getState(view.state);
    const decorations = pluginState.find();
    expect(decorations.length).toBe(0);
  });

  test('should not add a placeholder if one already exists', () => {
    let tr = showCursorPlaceholder(view.state);
    view.dispatch(tr);

    const initialPos = findCursorPlaceholderPos(view.state);
    expect(initialPos).not.toBeNull();

    // Attempt to add another placeholder
    tr = showCursorPlaceholder(view.state);
    view.dispatch(tr);

    const finalPos = findCursorPlaceholderPos(view.state);
    expect(finalPos).toBe(initialPos);

    const pluginState = plugin.getState(view.state);
    const decorations = pluginState.find();
    expect(decorations.length).toBe(1);
  });

  test('should handle selection changes correctly', () => {
    const { doc } = view.state;
    const tr = view.state.tr.setSelection(TextSelection.create(doc, 1, 1));
    view.dispatch(tr);

    const newTr = showCursorPlaceholder(view.state);
    view.dispatch(newTr);

    const pos = findCursorPlaceholderPos(view.state);
    expect(pos).not.toBeNull();
  });

  test('should return null if singletonInstance is not initialized', () => {
    /*const originalInstance = new CursorPlaceholderPlugin();
    const plugin = originalInstance['key'];

    // Simulate no instance by removing the plugin
    const tr = view.state.tr.setMeta(plugin, null);*/
    resetSingletonInstance(); // Ensure singletonInstance is null
    const pos = findCursorPlaceholderPos(view.state);

    expect(pos).toBeNull();
  });
  test('should replace selection with placeholder if selection is not empty', () => {
    const { doc } = view.state;
    // Find valid paragraph node
    const paragraph = doc.firstChild;
    expect(paragraph.type.name).toBe('paragraph');

    // Calculate safe range within paragraph
    const endPos = Math.min(5, paragraph.content.size);
    const tr = view.state.tr.setSelection(TextSelection.create(doc, 1, endPos)); // Non-empty selection
    view.dispatch(tr);

    const newTr = showCursorPlaceholder(view.state);
    expect(newTr.steps.length).toBeGreaterThan(0); // Ensure transformation happened
  });
  test('should return transaction if plugin is not initialized or selection is missing', () => {
    resetSingletonInstance(); // Simulate missing plugin instance
    const tr = showCursorPlaceholder(view.state);
    expect(tr).toStrictEqual(view.state.tr); // Deep equality check, Should return the original transaction
  });
});
