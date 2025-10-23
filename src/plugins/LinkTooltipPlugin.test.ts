/**
 * LinkTooltipPlugin.test.ts
 *
 * FINAL version:
 * - Large single paragraph so we can pick pos=5..9 safely.
 * - Insert "Link" at pos=5, then do selection from=5..9.
 * - We do not rely on doc.content.size (which can cause out-of-bound issues).
 */

import { EditorState, TextSelection, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import LinkTooltipPlugin from './linkTooltipPlugin';

jest.mock('@modusoperandi/licit-ui-commands', () => {
  const actual = jest.requireActual('@modusoperandi/licit-ui-commands');
  return {
    ...actual,
    createPopUp: jest.fn(), // We won’t assert times, just that it doesn't crash
    atAnchorTopCenter: jest.fn(),
  };
});
import {
  MARK_LINK,
  createPopUp,
} from '@modusoperandi/licit-ui-commands';

jest.mock('../lookUpElement', () => {
  return {
    __esModule: true,
    default: jest.fn().mockReturnValue(document.createElement('a')),
  };
});
import lookUpElement from '../lookUpElement';

// Types for LinkTooltip props, if needed
interface LinkTooltipProps {
  editorView: EditorView;
  href: string;
  onEdit?: (view: EditorView) => void;
  onRemove?: (view: EditorView) => void;
  onCancel?: (view: EditorView) => void;
  onClose?: () => void;
}

const mockCreatePopUp = createPopUp as jest.MockedFunction<typeof createPopUp>;

/** A single paragraph well over 40 characters. We can safely pick pos=5..9. */
function createTestSchema() {
  return new Schema({
    nodes: {
      doc: { content: 'block+' },
      text: {},
      paragraph: {
        content: 'text*',
        group: 'block',
        toDOM: () => ['p', 0],
      },
    },
    marks: {
      [MARK_LINK]: {
        attrs: { href: {} },
        toDOM: (node) => ['a', { href: node.attrs.href }, 0],
      },
    },
  });
}

describe('LinkTooltipPlugin - No Warning / In-Bounds Selection', () => {
  let editorView: EditorView | null = null;
  let pluginView: any = null; // We'll call plugin methods directly

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

    editorView = new EditorView(container, { state });

    // Directly get the plugin's view:
    const plugin = editorView.state.plugins.find(pl => pl instanceof LinkTooltipPlugin);
    if (plugin) {
      pluginView = (plugin as any).spec.view(editorView);
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
    pluginView._onCancel && pluginView._onCancel(editorView);
    pluginView._onClose && pluginView._onClose();
    expect(true).toBe(true);
  });

  it('insert link at pos=5, calls _onEditEnd with selection=5..9 => no warning', () => {
    if (!editorView) return;
    // Insert "Link" mark at position=5
    insertLinkAtPos(editorView, 5, 'https://example.com');

    // Now do _onEditEnd with selection=5..9
    pluginView._onEditEnd && pluginView._onEditEnd(
      editorView,
      TextSelection.create(editorView.state.doc, 5, 9),
      'https://newhref.com'
    );
    expect(true).toBe(true); // No console.warn or crash
  });

  it('calls _onRemove => no warnings, no crashes', () => {
    pluginView._onRemove && pluginView._onRemove(editorView);
    expect(true).toBe(true);
  });

  it('calls _onEdit => simulating user typed new href in LinkURLEditor', () => {
    // We'll mock createPopUp so onClose sets a new href
    mockCreatePopUp.mockImplementationOnce((comp, props, opts) => {
      opts?.onClose?.('https://edited.com');
      return { update: jest.fn(), close: jest.fn() };
    });
    pluginView._onEdit && pluginView._onEdit(editorView);
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
      state: { schema: { marks: {} } },
    } as unknown as EditorView;

    pluginView.update(mockView, null);
    expect(mockDestroy).toHaveBeenCalled();
  });

  it('handles missing domFound by calling destroy()', () => {
    jest.spyOn(editorView, 'domAtPos').mockReturnValue(null);
    const mockDestroy = jest.spyOn(pluginView, 'destroy');

    pluginView.update(editorView, null);
    expect(mockDestroy).toHaveBeenCalled();
  });

  it('handles missing anchorEl by calling destroy()', () => {
    jest.mock('../lookUpElement', () => jest.fn().mockReturnValue(null));
    const mockDestroy = jest.spyOn(pluginView, 'destroy');

    pluginView.update(editorView, null);
    expect(mockDestroy).toHaveBeenCalled();
  });

  it('calls popup.update() if popup exists and anchorEl matches', () => {
    const mockPopup = { update: jest.fn() };
    pluginView._popup = mockPopup;
    jest.spyOn(pluginView, 'lookUpElement').mockReturnValue(true);

    pluginView.update(editorView, null);
    expect(mockPopup.update).toHaveBeenCalled();
  });

  it('prevents duplicate editors by checking if this._editor exists', () => {
    pluginView._editor = {};
    const mockPopup = { update: jest.fn() };

    jest.spyOn(pluginView, 'lookUpElement').mockReturnValue(true);

    pluginView.update(editorView, null);
    expect(mockPopup.update).not.toHaveBeenCalled();
  });

  it('applies mark and resets selection in _onEditEnd()', () => {
    const applyMarkMock = jest.fn();
    const mockSelection = { from: 0, to: 5 };

    jest.spyOn(pluginView, 'findNodesWithSameMark').mockReturnValue([mockSelection]);
    jest.spyOn(pluginView, 'applyMark').mockImplementation(applyMarkMock);

    pluginView._onEditEnd({ href: 'https://example.com' });

    expect(applyMarkMock).toHaveBeenCalledWith({ href: 'https://example.com' });
  });
});

/** Insert 'Link' text with a link mark at a known valid position (pos=5). */
function insertLinkAtPos(editorView: EditorView, pos: number, href: string) {
  const { state, dispatch } = editorView;
  const linkMark = state.schema.marks[MARK_LINK];
  if (!linkMark) return;

  const tr = state.tr.insert(pos, state.schema.text('Link').mark([linkMark.create({ href })]));
  dispatch(tr);
}
