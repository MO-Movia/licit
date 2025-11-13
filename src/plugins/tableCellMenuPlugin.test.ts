/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Schema} from 'prosemirror-model';

import TableCellMenuPlugin from './tableCellMenuPlugin';
import findActionableCell from '../findActionableCell';
import {createPopUp} from '@modusoperandi/licit-ui-commands';
import isElementFullyVisible from '../isElementFullyVisible';

// Mock dependencies
jest.mock('../findActionableCell', () => jest.fn());
jest.mock('@modusoperandi/licit-ui-commands', () => ({
  ...jest.requireActual<typeof import('@modusoperandi/licit-ui-commands')>(
    '@modusoperandi/licit-ui-commands'
  ),
  createPopUp: jest.fn(),
}));
jest.mock('../isElementFullyVisible', () => jest.fn());

describe('TableCellMenuPlugin', () => {
  let plugin: TableCellMenuPlugin;
  let editorView: EditorView;
  let state: EditorState;

  beforeEach(() => {
    plugin = new TableCellMenuPlugin();

    // Mock state and selection
    const mySchema = new Schema({
      nodes: {
        doc: {
          attrs: {lineSpacing: {default: 'test'}},
          content: 'block+',
        },
        paragraph: {
          attrs: {lineSpacing: {default: 'test'}},
          content: 'text*',
          group: 'block',
        },
        heading: {
          attrs: {lineSpacing: {default: 'test'}},
          content: 'text*',
          group: 'block',
          defining: true,
        },
        bullet_list: {
          content: 'list_item+',
          group: 'block',
        },
        list_item: {
          attrs: {lineSpacing: {default: 'test'}},
          content: 'paragraph',
          defining: true,
        },
        blockquote: {
          attrs: {lineSpacing: {default: 'test'}},
          content: 'block+',
          group: 'block',
        },
        text: {
          inline: true,
        },
      },
    });
    const dummyDoc = mySchema.node('doc', null, [
      mySchema.node('heading', {marks: []}, [mySchema.text('Heading 1')]),
      mySchema.node('paragraph', {marks: []}, [
        mySchema.text('This is a paragraph'),
      ]),
      mySchema.node('bullet_list', {marks: []}, [
        mySchema.node('list_item', {marks: []}, [
          mySchema.node('paragraph', {marks: []}, [
            mySchema.text('List item 1'),
          ]),
        ]),
        mySchema.node('list_item', {marks: []}, [
          mySchema.node('paragraph', {marks: []}, [
            mySchema.text('List item 2'),
          ]),
        ]),
      ]),
      mySchema.node('blockquote', {marks: []}, [
        mySchema.node('paragraph', {marks: []}, [
          mySchema.text('This is a blockquote'),
        ]),
      ]),
    ]);

    // Mock ProseMirror editor state
    state = {
      doc: dummyDoc,
      schema: mySchema,
      selection: {},
      tr: {
        setSelection: jest.fn().mockReturnThis(),
      },
    } as unknown as EditorState;
    editorView = {
      state,
      readOnly: false,
      disabled: false,
      dispatch: jest.fn(),
      domAtPos: jest.fn().mockReturnValue({node: document.createElement('td')}),
    } as unknown as EditorView;
  });

  it('should create a new plugin instance', () => {
    expect(plugin).toBeInstanceOf(TableCellMenuPlugin);
  });

  it('should not create popup when no actionable cell is found', () => {
    (findActionableCell as jest.Mock).mockReturnValue(null);

    const tooltipView = plugin.spec.view(editorView);
    tooltipView.update(editorView, state);

    expect(findActionableCell).toHaveBeenCalledWith(state);
    expect(createPopUp).not.toHaveBeenCalled();
  });

  it('should call destroy if domFound  is null', () => {
    (findActionableCell as jest.Mock).mockReturnValue({pos: 10});
    (createPopUp as jest.Mock).mockReturnValue({
      close: jest.fn(),
      update: jest.fn(),
    });
    const mockPopup = {close: jest.fn()};

    const tooltipView = plugin.spec.view(editorView);
    editorView.domAtPos = jest.fn().mockReturnValue(null);
    (tooltipView as unknown as {_popUp: {close: jest.Mock}})._popUp = mockPopup;
    tooltipView.update(editorView, state);
    expect(findActionableCell).toHaveBeenCalledWith(state);
    expect(createPopUp).not.toHaveBeenCalled();
    expect(mockPopup.close).toHaveBeenCalled();
  });

  it('should create popup when actionable cell is found and visible', () => {
    (findActionableCell as jest.Mock).mockReturnValue({pos: 10});
    (isElementFullyVisible as jest.Mock).mockReturnValue(true);
    (createPopUp as jest.Mock).mockReturnValue({
      close: jest.fn(),
      update: jest.fn(),
    });

    const tooltipView = plugin.spec.view(editorView);
    tooltipView.update(editorView, state);

    expect(createPopUp).toHaveBeenCalled();
  });

  it('should close existing popup if cell is not fully visible', () => {
    (findActionableCell as jest.Mock).mockReturnValue({pos: 10});
    (isElementFullyVisible as jest.Mock).mockReturnValue(false);

    const tooltipView = plugin.spec.view(editorView);
    tooltipView.update(editorView, state);

    expect(createPopUp).not.toHaveBeenCalled();
  });

  it('should handle _onScroll when popup is null', () => {
    const tooltipView = plugin.spec.view(editorView);

    // Set up state where _popUp is null
    (tooltipView as unknown as {_popUp: null})._popUp = null;
    (tooltipView as unknown as {_cellElement: HTMLElement})._cellElement =
      document.createElement('td');

    // Call _onScroll directly
    const onScroll = (tooltipView as unknown as {_onScroll: () => void})
      ._onScroll;

    // Should return early without errors
    expect(() => onScroll()).not.toThrow();
  });

  it('should handle _onScroll when cellElement is null', () => {
    const tooltipView = plugin.spec.view(editorView);

    const mockPopup = {close: jest.fn(), update: jest.fn()};
    (tooltipView as unknown as {_popUp: typeof mockPopup})._popUp = mockPopup;
    (tooltipView as unknown as {_cellElement: null})._cellElement = null;

    // Call _onScroll directly
    const onScroll = (tooltipView as unknown as {_onScroll: () => void})
      ._onScroll;

    // Should return early without errors
    expect(() => onScroll()).not.toThrow();
  });

  it('should handle _onClose when scrollHandle is null', () => {
    const tooltipView = plugin.spec.view(editorView);

    const mockPopup = {close: jest.fn(), update: jest.fn()};
    (tooltipView as unknown as {_popUp: typeof mockPopup})._popUp = mockPopup;
    (tooltipView as unknown as {_scrollHandle: null})._scrollHandle = null;

    // Call _onClose directly
    const onClose = (tooltipView as unknown as {_onClose: () => void})._onClose;

    // Should not throw when scrollHandle is null
    expect(() => onClose()).not.toThrow();
    expect((tooltipView as unknown as {_popUp: null})._popUp).toBeNull();
  });
});
