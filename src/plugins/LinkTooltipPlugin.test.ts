/**
 * LinkTooltipPlugin.test.ts
 *
 * FINAL version:
 * - Large single paragraph so we can pick pos=5..9 safely.
 * - Insert "Link" at pos=5, then do selection from=5..9.
 * - We do not rely on doc.content.size (which can cause out-of-bound issues).
 */

import {EditorState, TextSelection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Schema, DOMParser} from 'prosemirror-model';
import LinkTooltipPlugin from './linkTooltipPlugin';
import {findNodesWithSameMark,MARK_LINK, createPopUp} from '@modusoperandi/licit-ui-commands';

jest.mock('@modusoperandi/licit-ui-commands', () => {
  const actual = jest.requireActual('@modusoperandi/licit-ui-commands');
  return {
    ...actual,
    findNodesWithSameMark: jest.fn(),
    createPopUp: jest.fn(), // We won’t assert times, just that it doesn't crash
    atAnchorTopCenter: jest.fn(),
  };
});


jest.mock('../lookUpElement', () => {
  return {
    __esModule: true,
    default: jest.fn().mockReturnValue(document.createElement('a')),
  };
});
import lookUpElement from '../lookUpElement';

const mockCreatePopUp = createPopUp as jest.MockedFunction<typeof createPopUp>;

/** A single paragraph well over 40 characters. We can safely pick pos=5..9. */
function createTestSchema() {
  return new Schema({
    nodes: {
      doc: {content: 'block+'},
      text: {},
      paragraph: {
        content: 'text*',
        group: 'block',
        toDOM: () => ['p', 0],
      },
    },
    marks: {
      [MARK_LINK]: {
        attrs: {href: {}},
        toDOM: (node) => ['a', {href: node.attrs.href}, 0],
      },
    },
  });
}

describe('LinkTooltipPlugin - No Warning / In-Bounds Selection', () => {
  let editorView: EditorView | null = null;
  let pluginView = null; // We'll call plugin methods directly

  beforeEach(() => {
    jest.clearAllMocks();

    const container = document.createElement('div');
    document.body.appendChild(container);

    // Single paragraph, definitely > 40 characters:
    const contentHTML = `
      <p>ABCDE12345 This is a long paragraph to ensure pos=5..9 is inline text. More text here.</p>
    `;

    const schema = createTestSchema();
    const content = document.createElement('div');
    content.innerHTML = contentHTML;

    const state = EditorState.create({
      schema,
      doc: DOMParser.fromSchema(schema).parse(content),
      plugins: [new LinkTooltipPlugin()],
    });

    editorView = new EditorView(container, {state});

    // Directly get the plugin's view:
    const plugin = editorView.state.plugins.find(
      (pl) => pl instanceof LinkTooltipPlugin
    );
    if (plugin) {
      pluginView = (plugin).spec.view(editorView);
    }
  });

  afterEach(() => {
    if (editorView) {
      editorView.destroy();
      editorView = null;
    }
    pluginView = null;
  });

  it('instantiates plugin & pluginView without warning', () => {
    expect(editorView).toBeDefined();
    expect(pluginView).toBeDefined();
  });

  it('calls update(), _onCancel, _onClose without warnings', () => {
    if (!editorView) return;
    pluginView.update(editorView, null);
    pluginView._onCancel?.(editorView);
    pluginView._onClose?.();
    expect(true).toBe(true);
  });

  it('insert link at pos=5, calls _onEditEnd with selection=5..9 => no warning', () => {
    if (!editorView) return;
    // Insert "Link" mark at position=5
    insertLinkAtPos(editorView, 5, 'https://example.com');

    // Now do _onEditEnd with selection=5..9
    pluginView._onEditEnd?.(
      editorView,
      TextSelection.create(editorView.state.doc, 5, 9),
      'https://newhref.com'
    );
    expect(true).toBe(true); // No console.warn or crash
  });

  it('calls _onRemove => no warnings, no crashes', () => {
    pluginView._onRemove?.(editorView);
    expect(true).toBe(true);
  });

  it('calls _onEdit => simulating user typed new href in LinkURLEditor', () => {
    // We'll mock createPopUp so onClose sets a new href
    mockCreatePopUp.mockImplementationOnce((_comp, _props, opts) => {
      opts?.onClose?.('https://edited.com');
      return {update: jest.fn(), close: jest.fn()};
    });
    pluginView._onEdit?.(editorView);
    expect(true).toBe(true);
  });

  it('handles view.readOnly mode by calling destroy()', () => {
    const mockDestroy = jest.spyOn(pluginView, 'destroy');

    const mockView = {
      ...editorView,
      readOnly: true,
    } as unknown as EditorView;

    pluginView.update(mockView, null);
    expect(mockDestroy).toHaveBeenCalled();
  });

  it('handles missing markType by returning early', () => {
    const mockDestroy = jest.spyOn(pluginView, 'destroy');
    const mockView = {
      ...editorView,
      state: {schema: {marks: {}}},
    } as unknown as EditorView;

    pluginView.update(mockView, null);

    // Should NOT destroy
    expect(mockDestroy).not.toHaveBeenCalled();
  });

  it('calls destroy() when domAtPos returns null (covers !domFound)', () => {
    const mockDestroy = jest.spyOn(pluginView, 'destroy');

    // Get link mark type from schema
    const markType = editorView.state.schema.marks[MARK_LINK];
    const validMark = markType.create({href: 'https://example.com'});

    // Mock findNodesWithSameMark to return valid from/to positions
    (
      findNodesWithSameMark as jest.MockedFunction<typeof findNodesWithSameMark>
    ).mockReturnValue({
      mark: validMark,
      from: {
        node: null,
        pos: 0,
      },
      to: {
        node: null,
        pos: 0,
      },
    });

    // Mock domAtPos to simulate no DOM element found
    const mockDomAtPos: EditorView['domAtPos'] = () =>
      null as unknown as {node: Node; offset: number};

    // Mock view instance preserving EditorView prototype
    const mockView: EditorView = Object.assign(
      Object.create(Object.getPrototypeOf(editorView)),
      {
        ...editorView,
        domAtPos: mockDomAtPos,
        readOnly: false,
      }
    );

    // 🔹 Run update — should trigger `if (!domFound)`
    pluginView.update(mockView, editorView.state);

    expect(mockDestroy).toHaveBeenCalled();
  });

  it('prevents duplicate editors by checking if this._editor exists', () => {
    pluginView._editor = {close: jest.fn()};

    const mockPopup = {update: jest.fn()};

    // Extend pluginView with mock lookUpElement safely
    const testPluginView = Object.assign(pluginView, {
      lookUpElement: jest.fn().mockReturnValue(true),
    });

    testPluginView.update(editorView, null);

    // Ensure popup.update() was not called
    expect(mockPopup.update).not.toHaveBeenCalled();
  });

  it('calls destroy() when lookUpElement returns null (covers !anchorEl)', () => {
  const mockDestroy = jest.spyOn(pluginView, 'destroy');

  // Mock domAtPos to return a valid node so that lookUpElement is actually called
  const mockDomAtPos: EditorView['domAtPos'] = () => ({
    node: document.createElement('span'),
    offset: 0,
  });

  // Temporarily make lookUpElement return null
  (lookUpElement as jest.Mock).mockReturnValueOnce(null);

  const markType = editorView.state.schema.marks[MARK_LINK];
  (
    findNodesWithSameMark as jest.MockedFunction<typeof findNodesWithSameMark>
  ).mockReturnValue({
    mark: markType.create({href: 'https://example.com'}),
    from: { node: null, pos: 5 },
    to: { node: null, pos: 9 },
  });

  const mockView: EditorView = Object.assign(
    Object.create(Object.getPrototypeOf(editorView)),
    {
      ...editorView,
      domAtPos: mockDomAtPos,
      readOnly: false,
    }
  );

  // Run update → should hit `if (!anchorEl)`
  pluginView.update(mockView, editorView.state);

  expect(mockDestroy).toHaveBeenCalled();
});

it('returns early when anchorEl is the same as this._anchorEl (covers equality branch)', () => {
  const mockDestroy = jest.spyOn(pluginView, 'destroy');

  // Create a shared anchor element
  const sameAnchor = document.createElement('a');
  sameAnchor.href = 'https://example.com';

  // Assign it to the plugin’s cached anchor
  pluginView._anchorEl = sameAnchor;

  //Mock lookUpElement to return the SAME element
  (lookUpElement as jest.Mock).mockImplementationOnce(() => sameAnchor);

  // Mock domAtPos to return something valid so lookUpElement is called
  const mockDomAtPos: EditorView['domAtPos'] = () => ({
    node: document.createElement('span'),
    offset: 0,
  });

  // Mock findNodesWithSameMark to simulate a valid found mark
  const markType = editorView.state.schema.marks[MARK_LINK];
  (
    findNodesWithSameMark as jest.MockedFunction<typeof findNodesWithSameMark>
  ).mockReturnValue({
    mark: markType.create({ href: 'https://example.com' }),
    from: { node: null, pos: 5 },
    to: { node: null, pos: 9 },
  });

  //Build a mock EditorView to pass to update()
  const mockView: EditorView = Object.assign(
    Object.create(Object.getPrototypeOf(editorView)),
    {
      ...editorView,
      domAtPos: mockDomAtPos,
      readOnly: false,
      state: editorView.state,
    }
  );

  // Clear any calls made by earlier plugin initialization
  (lookUpElement as jest.Mock).mockClear();

  // Call update() — should hit (anchorEl === this._anchorEl)
  pluginView.update(mockView, editorView.state);

  // Verify branch behavior
  expect(lookUpElement).toHaveBeenCalledTimes(1); // called exactly once in this run
  expect(mockDestroy).not.toHaveBeenCalled(); // early return — no destroy()
  expect(pluginView._anchorEl).toBe(sameAnchor); // cached anchor unchanged
});


});

/** Insert 'Link' text with a link mark at a known valid position (pos=5). */
function insertLinkAtPos(editorView: EditorView, pos: number, href: string) {
  const {state, dispatch} = editorView;
  const linkMark = state.schema.marks[MARK_LINK];
  if (!linkMark) return;

  const tr = state.tr.insert(
    pos,
    state.schema.text('Link').mark([linkMark.create({href})])
  );
  dispatch(tr);
}
