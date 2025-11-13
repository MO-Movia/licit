/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import * as React from 'react';
import {EditorState, TextSelection} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import TableInsertCommand from './tableInsertCommand';
import {Schema} from 'prosemirror-model';
import {Editor} from '@tiptap/react';

jest.mock('../ui/tableGridSizeEditor', () => {
  return jest.fn(() => '<div>Mocked Table Grid Size Editor</div>');
});

jest.mock('nullthrows', () => jest.fn(<T>(val: T) => val));

describe('TableInsertCommand', () => {
  let command;
  let editorState;
  let view;
  let dispatchMock;
  let viewMock;
  let closeMock;

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
        mySchema.node('paragraph', {marks: []}, [mySchema.text('List item 1')]),
      ]),
      mySchema.node('list_item', {marks: []}, [
        mySchema.node('paragraph', {marks: []}, [mySchema.text('List item 2')]),
      ]),
    ]),
    mySchema.node('blockquote', {marks: []}, [
      mySchema.node('paragraph', {marks: []}, [
        mySchema.text('This is a blockquote'),
      ]),
    ]),
  ]);

  beforeEach(() => {
    command = new TableInsertCommand();
    editorState = {
      doc: dummyDoc,
      selection: {
        from: 0,
        to: 0,
        $head: {
          depth: 1,
          node: jest.fn(() => ({type: {spec: {tableRole: ''}}})),
        },
      },
    };
    view = {};
    // Create a mock for close method
    closeMock = jest.fn();
  });

  it('should enable the command when the selection is valid', () => {
    editorState.selection = TextSelection.create(editorState.doc, 0, 0);

    const result = command.isEnabled(editorState);
    expect(result).toBe(true);
  });

  it('should disable the command if selection is inside a table', () => {
    editorState.selection = TextSelection.create(editorState.doc, 0, 0);
    editorState.selection.$head.depth = 1;
    editorState.selection.$head.node = jest.fn().mockReturnValueOnce({
      type: {spec: {tableRole: 'row'}},
    });
    const result = command.isEnabled(editorState);
    expect(result).toBe(false);
  });

  it('should return to if the target is not htnl element', () => {
    editorState.selection = {};

    const result = command.isEnabled(editorState);
    expect(result).toBe(false);
  });

  it('waitForUserInput should create a pop-up and resolve', async () => {
    const state = {
      plugins: [],
      selection: {from: 1, to: 2},
      schema: {marks: {'mark-text-color': 'mark-text-color'}},
      doc: {
        nodeAt: (_x) => {
          return {isAtom: true, isLeaf: true, isText: false};
        },
      },
      tr: {
        doc: {
          nodeAt: (_x) => {
            return {isAtom: true, isLeaf: true, isText: false, marks: []};
          },
        },
      },
    } as unknown as EditorState;

    // Mock DOM element to be returned by getElementById
    const mockElement = document.createElement('div');
    mockElement.id = 'parent-id';
    document.getElementById = jest.fn().mockReturnValue(mockElement);
    // Mock the offsetParent to simulate a parent element with an id
    Object.defineProperty(mockElement, 'offsetParent', {
      value: {id: 'parent-id'},
    });

    const _dispatch = jest.fn();
    const event_ = {
      currentTarget: mockElement,
    } as unknown as Event;

    const editorview = {} as unknown as EditorView;

    const result = command.waitForUserInput(
      state,
      _dispatch,
      editorview,
      event_
    );

    const onCloseCallback = command._popUp?.close;
    if (onCloseCallback) {
      onCloseCallback('mocked value');
    }

    await expect(result).resolves.toBe('mocked value');

    expect(result).toBeDefined();
  });

  it('waitForUserInput should resolve with undefined if _popUp is already set', async () => {
    const eventMock = {
      currentTarget: document.createElement('div') as unknown,
      type: 'mouseenter',
    } as React.SyntheticEvent;
    command._popUp = {close: closeMock};
    const result = await command.waitForUserInput(
      editorState,
      dispatchMock,
      viewMock,
      eventMock
    );
    expect(result).toBeUndefined();
  });

  it('should handle invalid target in waitForUserInput gracefully', async () => {
    const eventMock = {
      currentTarget: document.createElement('div') as unknown,
      type: 'mouseenter',
    } as React.SyntheticEvent;
    // Making the target null to simulate an invalid event
    eventMock.currentTarget = null;
    const result = await command.waitForUserInput(
      editorState,
      dispatchMock,
      viewMock,
      eventMock
    );
    expect(result).toBeUndefined();
  });

  it('should execute with user input', () => {
    const inputs = {rows: 3, cols: 3};
    const insertTableMock = jest.fn().mockReturnValue(true);

    // Mock the getEditor function to return a mock editor
    UICommand.prototype.editor = {
      view: {focus: () => {}, dispatch: () => {}},
      commands: {
        redo: jest.fn(),
        setCellAttribute: jest.fn(),
        insertTable: insertTableMock,
      },
    } as unknown as Editor;

    const result = command.executeWithUserInput(
      editorState,
      undefined,
      view,
      inputs
    );

    expect(result).toBe(true);
    expect(insertTableMock).toHaveBeenCalledWith({rows: 3, cols: 3});
  });

  it('should return false if no user input is provided', () => {
    const result = command.executeWithUserInput(editorState);
    expect(result).toBe(false);
  });

  it('should detect and handle a mouse enter event', () => {
    const mouseEnterEvent = new MouseEvent('mouseenter');
    const result = command.shouldRespondToUIEvent(mouseEnterEvent);
    expect(result).toBe(true);
  });

  it('should not respond to non-mouseenter events', () => {
    const clickEvent = new MouseEvent('click');
    const result = command.shouldRespondToUIEvent(clickEvent);
    expect(result).toBe(false);
  });

  it('should handle cancel', () => {
    const result = command.cancel();
    expect(result).toBeNull();
  });

  it('should handle executeCustomStyleForTable', () => {
  const mockState = {} as EditorState;
  const mockTransform = {} as Transform;  
  const result = command.executeCustomStyleForTable(mockState, mockTransform);  
  expect(result).toBe(mockTransform);
  });

  describe('executeCustom', () => {
    it('should return the given Transform', () => {
      const mockTransform = {} as Transform;
      const result = command.executeCustom(editorState, mockTransform, 0, 1);
      expect(result).toBe(mockTransform);
    });
  });
});
