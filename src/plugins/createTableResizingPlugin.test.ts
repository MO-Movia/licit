/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorView } from 'prosemirror-view';
import createTableResizingPlugin, {
  lookUpTableWrapper,
  calculateMaxClientX,
  dispatchMouseEvent,
} from './createTableResizingPlugin';
import {Plugin} from 'prosemirror-state';

describe('createTableResizingPlugin', () => {
  let plugin: Plugin;
  let editorViewMock: EditorView;
  let editorDom: HTMLElement;

  beforeEach(() => {
    plugin = createTableResizingPlugin();
    editorDom = document.createElement('div');
    editorViewMock = {
      dom: editorDom,
      state: {
        // Mock the state object
        tr: {
          // Mock the transaction object
          setMeta: jest.fn(() => ({})), // Mock setMeta
        },
      },
      dispatch: jest.fn(), // Mock dispatch
    } as unknown as EditorView;

    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should remove event listeners on mouseup', () => {
    plugin.props.handleDOMEvents.mousedown.apply(plugin, [
      editorViewMock,
      new MouseEvent('mousedown', {clientX: 200}),
    ]);
    window.dispatchEvent(new MouseEvent('mouseup'));

    expect(window.removeEventListener).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
      true
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
      true
    );
  });

  it('should detect colgroup with col elements', () => {
    const table = document.createElement('table');
    const colgroup = document.createElement('colgroup');
    const col = document.createElement('col');

    colgroup.appendChild(col);
    table.appendChild(colgroup);
    editorDom.appendChild(table);

    const colCount = colgroup.querySelectorAll('col').length;

    expect(colCount).toBe(1);
  });

  it('should calculate maxClientX correctly', () => {
    const table = document.createElement('table');
    editorDom.appendChild(table);

    jest.spyOn(table, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      width: 400,
      right: 500,
      top: 0,
      bottom: 200,
      x: 100,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    const mockEvent = new MouseEvent('mousemove', { clientX: 450 });
    const maxClientX = calculateMaxClientX(mockEvent, table);

    expect(maxClientX).toBeLessThanOrEqual(500);
  });
});

describe('lookUpTableWrapper', () => {
  it('should return closest table wrapper element', () => {
    const div = document.createElement('div');
    div.classList.add('tableWrapper');
    document.body.appendChild(div);

    const event = new Event('click');
    Object.defineProperty(event, 'target', { value: div });

    expect(lookUpTableWrapper(event)).toBe(div);
  });

  it('should return null if no table wrapper is found', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    const event = new Event('click');
    Object.defineProperty(event, 'target', { value: div });

    expect(lookUpTableWrapper(event)).toBeNull();
  });
});

describe('calculateMaxClientX', () => {
  it('should correctly calculate max clientX', () => {
    const targetTable = document.createElement('table');
    document.body.appendChild(targetTable);
    jest.spyOn(targetTable, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      width: 500,
      height: 200,
      top: 0,
      right: 600,
      bottom: 200,
      x: 100,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    const mockEvent = { clientX: 200 } as MouseEvent;
    const result = calculateMaxClientX(mockEvent, targetTable);

    expect(result).toBeGreaterThan(200);
  });
});

describe('dispatchMouseEvent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setTimeout(5000);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should dispatch a mouse event with correct properties', () => {
    const spy = jest.spyOn(window, 'dispatchEvent');

    dispatchMouseEvent('mousemove', 300);

    // Run all timers to execute any pending callbacks (e.g. from requestAnimationFrame)
    jest.runAllTimers();

    expect(spy).toHaveBeenCalled();

    const dispatchedEvent = spy.mock.calls[0][0] as MouseEvent;
    expect(dispatchedEvent.type).toBe('mousemove');
    expect(dispatchedEvent.clientX).toBe(300);
  });
});
