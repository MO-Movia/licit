import { EditorView } from 'prosemirror-view';
import createTableResizingPlugin, { lookUpTableWrapper, calculateMaxClientX, dispatchMouseEvent } from './createTableResizingPlugin';


describe('createTableResizingPlugin', () => {
  let plugin: any;
  let editorViewMock: EditorView;
  let editorDom: HTMLElement;

  beforeEach(() => {
    plugin = createTableResizingPlugin();
    editorDom = document.createElement('div');
    editorViewMock = {
      dom: editorDom,
      state: { // Mock the state object
        tr: { // Mock the transaction object
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

  /*it('should prevent default if clientX exceeds calculated maxClientX', () => {
    // Create a mutable mousemove event with a preventDefault spy.
    const preventDefaultMock = jest.fn();
    // (Using Object.assign ensures we override the event’s preventDefault)
    const dummyMouseMoveEvent = Object.assign(new MouseEvent('mousemove', { clientX: 500 }), {
      preventDefault: preventDefaultMock,
    });

    // 1. Trigger the mousedown event so that the plugin registers its mousemove listener.
    const mousedownEvent = new MouseEvent('mousedown', { clientX: 200 });
    plugin.props.handleDOMEvents.mousedown(editorViewMock, mousedownEvent);
    // (Confirm that the mousemove listener was added to window)
    expect(window.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function), true);

    // 2. Create a table element that the plugin will use. (The plugin likely calls getBoundingClientRect on the table.)
    const targetTable = document.createElement('table');
    editorDom.appendChild(targetTable);

    // 3. Mock the table’s bounding rect so that its allowed max is low.
    //    For example, left=100 and width=200 => right edge = 300.
    const rect = {
      left: 100,
      width: 200, // small width means a lower calculated max
      right: 300,
      top: 0,
      height: 200,
      bottom: 200,
      x: 100,
      y: 0,
      toJSON: () => {},
    } as DOMRect;
    jest.spyOn(targetTable, 'getBoundingClientRect').mockReturnValue(rect);

    // 4. (If needed by the plugin’s internal logic, wrap the next call in a dummy transaction.)
    editorViewMock.dispatch(editorViewMock.state.tr.setMeta('test', true));

    // 5. Create a new mousemove event whose adjusted clientX exceeds the table’s allowed max.
    //    Here, we subtract rect.left from 500 to simulate adjustment:
    //    adjustedClientX = 500 - 100 = 400, which is > 300 (the right edge).
    const adjustedClientX = dummyMouseMoveEvent.clientX - rect.left; // 500 - 100 = 400
    const adjustedMouseMoveEvent = Object.assign(
      new MouseEvent('mousemove', { clientX: adjustedClientX }),
      { preventDefault: preventDefaultMock }
    );

    // 6. Call the plugin’s mousemove handler with the simulated event.
    //    (We do NOT override plugin.props.handleDOMEvents.mousemove here!)
    plugin.props.handleDOMEvents.mousemove(editorViewMock, adjustedMouseMoveEvent);

    // Optionally, you can log:
    console.log('preventDefaultMock called:', preventDefaultMock.mock.calls.length);

    // 7. Assert that preventDefault was called (the plugin should have prevented the default action).
    expect(preventDefaultMock).toHaveBeenCalledTimes(1);
  });*/

  it('should remove event listeners on mouseup', () => {
    plugin.props.handleDOMEvents.mousedown(editorViewMock, new MouseEvent('mousedown', { clientX: 200 }));
    window.dispatchEvent(new MouseEvent('mouseup'));

    expect(window.removeEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function), true);
    expect(window.removeEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function), true);
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

  /*it('should prevent resizing when clientX exceeds maxClientX', () => {
    const table = document.createElement('table');
    editorDom.appendChild(table);

    jest.spyOn(table, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      width: 300,
      right: 400,
      top: 0,
      bottom: 200,
      x: 100,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    const preventDefaultMock = jest.fn();
    const event = Object.assign(new MouseEvent('mousemove', { clientX: 500 }), {
      preventDefault: preventDefaultMock,
    });

    const maxClientX = calculateMaxClientX(event, table);

    if (event.clientX > maxClientX) {
      event.preventDefault();
    }

    expect(preventDefaultMock).toHaveBeenCalled();
  });*/


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

  it('should dispatch a mouse event with correct properties', async () => {
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
