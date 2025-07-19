import * as React from 'react';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import TableColorCommand from './tableColorCommand';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { EditorView } from 'prosemirror-view';
import { Editor } from '@tiptap/react';
import '@testing-library/jest-dom';

/*jest.mock('@modusoperandi/licit-ui-commands', () => ({
  createPopUp: jest.fn().mockImplementation((Component, props, options) => {
    return { close: jest.fn(), update: jest.fn() };
  }),
  ColorEditor: jest.fn().mockReturnValue('<div> Color Editor</div>'),
  atAnchorRight: jest.fn(),
}));*/

describe('TableColorCommand', () => {
  let command;
  let stateMock;
  let trMock;
  let fromMock;
  let toMock;
  let eventMock;
  let dispatchMock;
  let viewMock;
  let closeMock;

  beforeEach(() => {
    stateMock = {} as EditorState;
    trMock = {} as Transform;
    fromMock = 0;
    toMock = 0;

    eventMock = {
      currentTarget: document.createElement('div') as unknown,
      type: 'mouseenter',
    } as React.SyntheticEvent;

    // Create a mock for close method
    closeMock = jest.fn();

    // Mock the getEditor method and setCellAttribute command
    command = new TableColorCommand('backgroundColor');
    UICommand.prototype.editor = {
      view: { focus: () => {}, dispatch: () => {} },
      commands: { redo: jest.fn(), setCellAttribute: jest.fn() },
    } as unknown as Editor;
  });

  it('should call the getEditor method', () => {
    // Call the method
    let result = command.getEditor();

    // Verify that getEditor was called
    expect(result).toHaveProperty('view');
  });

  it('should correctly initialize the attribute in the constructor', () => {
    expect(command.attribute).toBe('backgroundColor');
  });

  it('should respond to mouse enter event', () => {
    const result = command.shouldRespondToUIEvent(eventMock);
    expect(result).toBe(true);
  });

  it('should not respond to other events', () => {
    eventMock.type = 'click'; // Changing the event type to something else
    const result = command.shouldRespondToUIEvent(eventMock);
    expect(result).toBe(false);
  });

  it('isEnabled should return true', () => {
    const result = command.isEnabled(stateMock);
    expect(result).toBe(true);
  });

  it('waitForUserInput should create a pop-up and resolve', async () => {
    const state = {
      plugins: [],
      selection: { from: 1, to: 2 },
      schema: { marks: { 'mark-text-color': 'mark-text-color' } },
      doc: {
        nodeAt: (_x) => {
          return { isAtom: true, isLeaf: true, isText: false };
        },
      },
      tr: {
        doc: {
          nodeAt: (_x) => {
            return { isAtom: true, isLeaf: true, isText: false, marks: [] };
          },
        },
      },
    } as unknown as EditorState;

    const _dispatch = jest.fn();
    const event_ = {
      currentTarget: document.createElement('div'),
    } as unknown as Event;

    const editorview = {} as unknown as EditorView;

    const result = command.waitForUserInput(
      state,
      _dispatch,
      editorview,
      event_
    );

    command._popUp.close('close');

    expect(result).toBeDefined();
  });

  it('executeWithUserInput should call setCellAttribute with the correct arguments', () => {
    const editor = command.getEditor();
    const setCellAttributeMock = editor.commands.setCellAttribute;

    command.executeWithUserInput(stateMock, dispatchMock, viewMock, 'ff0000');

    expect(setCellAttributeMock).toHaveBeenCalledWith(
      'backgroundColor',
      'ff0000'
    );
  });

  it('executeWithUserInput should return false if hex is undefined', () => {
    let result = command.executeWithUserInput(
      stateMock,
      dispatchMock,
      viewMock,
      undefined
    );

    expect(result).toBe(false);
  });

  it('cancel should close the pop-up', () => {
    command._popUp = { close: closeMock };
    command.cancel();
    expect(closeMock).toHaveBeenCalled();
  });

  it('waitForUserInput should resolve with undefined if _popUp is already set', async () => {
    command._popUp = { close: closeMock };
    const result = await command.waitForUserInput(
      stateMock,
      dispatchMock,
      viewMock,
      eventMock
    );
    expect(result).toBeUndefined();
  });

  it('_popup should contain close once it created  ', async () => {
    command._popUp = null;
    const result = command.waitForUserInput(
      stateMock,
      dispatchMock,
      viewMock,
      eventMock
    );
    const onCloseCallback = command._popUp?.close;
    if (onCloseCallback) {
      onCloseCallback('mocked value');
    }

    // Assert that the resolve function was called with the expected value
    await expect(result).resolves.toBe('mocked value');
  });

  it('should handle invalid target in waitForUserInput gracefully', async () => {
    // Making the target null to simulate an invalid event
    eventMock.currentTarget = null;
    const result = await command.waitForUserInput(
      stateMock,
      dispatchMock,
      viewMock,
      eventMock
    );
    expect(result).toBeUndefined();
  });
  it('should return the same transform object it receives', () => {
    const result = command.executeCustom(stateMock, trMock, fromMock, toMock);
    // Assert that the result is the same as the input transform (trMock)
    expect(result).toBe(trMock);
  });

  it('should call the getEditor method', () => {
    // Spy on the getEditor method to ensure it is called
    const getEditorSpy = jest.spyOn(command, 'getEditor');

    // Call the method
    command.getEditor();

    // Verify that getEditor was called
    expect(getEditorSpy).toHaveBeenCalled();
  });
});
