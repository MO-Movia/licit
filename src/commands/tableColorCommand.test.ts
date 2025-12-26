/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import * as React from 'react';
import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import {Editor} from '@tiptap/react';
import TableColorCommand from './tableColorCommand';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {createPopUp} from '@modusoperandi/licit-ui-commands';

// Typed popup mock
type MockPopup = {close: jest.Mock<void, [unknown]>};

// Mock licit-ui-commands (typed)
const createPopUpMock = jest
  .fn()
  .mockImplementation(
    (
      _Component: unknown,
      _props: unknown,
      opts: {onClose?: (v: string) => void}
    ): MockPopup => {
      return {
        close: jest.fn((_val: unknown) => opts.onClose?.('mocked value')),
      };
    }
  );

jest.mock('@modusoperandi/licit-ui-commands', () => {
  // define inside the factory → safe from hoisting issues
  const createPopUpMock = jest
    .fn()
    .mockImplementation(
      (
        _Component: unknown,
        _props: unknown,
        opts: {onClose?: (v: string) => void}
      ) => {
        return {
          close: jest.fn((_value: unknown) => opts.onClose?.('mocked value')),
        };
      }
    );

  const actual = jest.requireActual<
    typeof import('@modusoperandi/licit-ui-commands')
  >('@modusoperandi/licit-ui-commands');

  return {
    ...actual,
    createPopUp: createPopUpMock,
    atAnchorRight: jest.fn(),
    RuntimeService: {Runtime: 'mockRuntime'},
  };
});

// Mock color-picker import
jest.mock('@modusoperandi/color-picker', () => ({
  ColorEditor: jest.fn(),
}));

// A typed synthetic mouseenter event
interface FakeReactEvent extends React.SyntheticEvent {
  readonly type: string;
  readonly currentTarget: EventTarget & HTMLElement;
}

describe('TableColorCommand (typed)', () => {
  let command: TableColorCommand;
  let mockState: EditorState;
  let mockTransform: Transform;
  let dispatchMock: jest.Mock;
  let viewMock: EditorView;
  let setCellAttributeMock: jest.Mock;

  beforeEach(() => {
    mockState = {} as EditorState;
    mockTransform = {} as Transform;
    dispatchMock = jest.fn();
    viewMock = {} as EditorView;

    setCellAttributeMock = jest.fn();
    const chainMock = {
      focus: jest.fn().mockReturnThis(),
      updateAttributes: jest.fn().mockReturnThis(),
      run: jest.fn(),
    };
    // Inject a typed mock editor into UICommand
    const mockEditor: Editor = {
      view: {
        focus: jest.fn(),
        dispatch: jest.fn(),
      },
      commands: {
        setCellAttribute: setCellAttributeMock,
      },
      chain: jest.fn(() => chainMock),
    } as unknown as Editor;

    UICommand.prototype.editor = mockEditor;

    command = new TableColorCommand('backgroundColor');

    jest.clearAllMocks();
  });

  it('should initialize attribute', () => {
    expect(command.attribute).toBe('backgroundColor');
  });

  it('executeCustom returns same transform', () => {
    expect(command.executeCustom(mockState, mockTransform, 0, 0)).toBe(
      mockTransform
    );
  });

  it('executeCustomStyleForTable returns same transform', () => {
    expect(command.executeCustomStyleForTable(mockState, mockTransform)).toBe(
      mockTransform
    );
  });

  it('should respond only to mouseenter', () => {
    const evtEnter: FakeReactEvent = {
      type: 'mouseenter',
      currentTarget: document.createElement('div'),
    } as unknown as FakeReactEvent;

    const evtClick: FakeReactEvent = {
      type: 'click',
      currentTarget: document.createElement('div'),
    } as unknown as FakeReactEvent;

    expect(command.shouldRespondToUIEvent(evtEnter)).toBe(true);
    expect(command.shouldRespondToUIEvent(evtClick)).toBe(false);
  });

 it('should return true when selection is inside a table', () => {
  const mockState = {
    selection: {
      $from: {
        depth: 3,
        node: (depth: number) =>
          depth === 1
            ? { type: { name: 'table' } }
            : { type: { name: 'paragraph' } },
      },
    },
  };

  expect(command.isEnabled(mockState as unknown as EditorState)).toBe(true);
});

  it('returns undefined when target invalid', async () => {
    const badEvent = {
      currentTarget: null,
      type: 'mouseenter',
    } as unknown as FakeReactEvent;

    const result = await command.waitForUserInput(
      mockState,
      dispatchMock,
      viewMock,
      badEvent
    );

    expect(result).toBeUndefined();
  });

  it('should not create popup when already open', async () => {
    command._popUp = {close: jest.fn()} as MockPopup;

    const evt: FakeReactEvent = {
      type: 'mouseenter',
      currentTarget: document.createElement('div'),
    } as unknown as FakeReactEvent;

    const result = await command.waitForUserInput(
      mockState,
      dispatchMock,
      viewMock,
      evt
    );

    expect(createPopUpMock).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('returns false when hex undefined', () => {
    expect(
      command.executeWithUserInput(mockState, dispatchMock, viewMock)
    ).toBe(false);
  });

  it('calls setCellAttribute when hex provided', () => {
    const result = command.executeWithUserInput(
      mockState,
      dispatchMock,
      viewMock,
      {color: '#333333'}
    );

    expect(setCellAttributeMock).toHaveBeenCalledWith('backgroundColor', {
      color: '#333333',
    });
    expect(result).toBeFalsy();
  });

it('calls setCellBorders when success is true', () => {
  const setCellBordersSpy = jest.spyOn(command, 'setCellBorders');
  setCellAttributeMock.mockReturnValue(true);

  const hex = { color: '#333333', selectedPosition: ['Top', 'Bottom'] };

  command.executeWithUserInput(mockState, dispatchMock, viewMock, hex);

  expect(setCellBordersSpy).toHaveBeenCalledWith(
    expect.any(Object),
    ['Top', 'Bottom'],
    '#333333'
  );
});


  it('cancel closes popup if exists', () => {
    const close = jest.fn();
    command._popUp = {close} as MockPopup;

    command.cancel();
    expect(close).toHaveBeenCalledWith(undefined);
  });

  it('cancel does nothing when no popup', () => {
    command._popUp = null;
    expect(() => command.cancel()).not.toThrow();
  });

  it('should clear popup and resolve value when onClose is triggered', async () => {
    const div = document.createElement('div');

    // Prepare event
    const event = {
      type: 'mouseenter',
      currentTarget: div,
    } as unknown as React.SyntheticEvent;

    const promise = command.waitForUserInput(
      mockState,
      dispatchMock,
      viewMock,
      event
    );

    // Extract the call arguments for createPopUp
    const call = (createPopUp as jest.Mock).mock.calls[0];
    const options = call[2];

    expect(options).toHaveProperty('onClose');
    const onClose = options.onClose!;
    expect(command._popUp).not.toBeNull();
    onClose('close-value');
    expect(command._popUp).toBeNull();
    await expect(promise).resolves.toBe('close-value');
  });
});
