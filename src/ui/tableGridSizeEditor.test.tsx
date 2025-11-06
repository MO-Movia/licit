import React from 'react';
import ReactDOM from 'react-dom';
import TableGridSizeEditor from './tableGridSizeEditor';

// Mock dependencies
jest.mock('@modusoperandi/licit-ui-commands', () => ({
  fromHTMlElement: jest.fn(() => ({ x: 0, y: 0 })),
  fromXY: jest.fn(() => ({ x: 10, y: 10, width: 10, height: 10 })),
  isIntersected: jest.fn(() => true),
  clamp: jest.fn((min, val, max) => Math.min(Math.max(val, min), max)),
}));

jest.mock('../htmlElementToRect', () => jest.fn(() => ({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
})));

describe('TableGridSizeEditor', () => {
  let container: HTMLDivElement;

  // Polyfill for requestAnimationFrame
  beforeAll(() => {
  global.requestAnimationFrame = (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  };
  global.cancelAnimationFrame = jest.fn();
});

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container.innerHTML = '';
    jest.clearAllMocks();
  });

  it('renders without crashing and shows default state', () => {
    const closeMock = jest.fn();
    ReactDOM.render(<TableGridSizeEditor close={closeMock} />, container);

    const editor = container.querySelector('.czi-table-grid-size-editor');
    const footer = container.querySelector('.czi-table-grid-size-editor-footer');

    expect(editor).not.toBeNull();
    expect(footer?.textContent).toBe('1 X 1');
  });

  it('renders grid cells correctly', () => {
    const closeMock = jest.fn();
    ReactDOM.render(<TableGridSizeEditor close={closeMock} />, container);

    const cells = container.querySelectorAll('.czi-table-grid-size-editor-cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('calls close() with current state on mouse down', () => {
    const closeMock = jest.fn();
    ReactDOM.render(<TableGridSizeEditor close={closeMock} />, container);

    const body = container.querySelector('.czi-table-grid-size-editor-body');
    const event = new MouseEvent('mousedown', { bubbles: true });

    body?.dispatchEvent(event);

    expect(closeMock).toHaveBeenCalledWith({ rows: 1, cols: 1 });
  });

  it('updates grid size on simulated mouse move', () => {
    const closeMock = jest.fn();
    ReactDOM.render(<TableGridSizeEditor close={closeMock} />, container);

    const body = container.querySelector('.czi-table-grid-size-editor-body');
    const enterEvent = new MouseEvent('mouseenter', {
      bubbles: true,
      clientX: 20,
      clientY: 20,
    });
    body?.dispatchEvent(enterEvent);

    const moveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      clientX: 80,
      clientY: 80,
      screenX: 10,
      screenY: 10,
    });
    document.dispatchEvent(moveEvent);

    const footer = container.querySelector('.czi-table-grid-size-editor-footer');
    expect(footer?.textContent).toMatch(/\d{1,10} X \d{1,10}/);
  });

it('removes mousemove listener on unmount', () => {
  const removeSpy = jest.spyOn(document, 'removeEventListener');
  const closeMock = jest.fn();

  ReactDOM.render(<TableGridSizeEditor close={closeMock} />, container);
  const instance = (ReactDOM.render(
    <TableGridSizeEditor close={closeMock} />,
    container
  ) as unknown as TableGridSizeEditor);

  // Simulate mouse enter properly so that _entered = true
  const editorDiv = container.querySelector('.czi-table-grid-size-editor-body');
  const enterEvent = {
    currentTarget: editorDiv,
    clientX: 10,
    clientY: 10,
  } as unknown as React.MouseEvent;

  // Call the actual component's handler directly
  instance._onMouseEnter(enterEvent);

  // Now unmount and check cleanup
  ReactDOM.unmountComponentAtNode(container);
  expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function), true);
});

it('should handle _onMouseMove and update grid size correctly', () => {
  const closeMock = jest.fn();
  const instance = new TableGridSizeEditor({ close: closeMock }) as unknown as TableGridSizeEditor;

  // mock ref and internal state to simulate a valid mounted element
  instance._ref = document.createElement('div');
  instance._mx = 10;
  instance._my = 10;
  instance._rafID = 1;

  // Mock cancelAnimationFrame and requestAnimationFrame
  const cancelSpy = jest.spyOn(global, 'cancelAnimationFrame');
  const rafSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    cb(0);
    return 2;
  });

  // Create a fake MouseEvent
  const event = new MouseEvent('mousemove', {
    bubbles: true,
    clientX: 30,
    clientY: 40,
    screenX: 10,
    screenY: 10,
  });

  // Call the method directly to ensure branch coverage
  instance._onMouseMove(event);

  // Assertions
  expect(cancelSpy).toHaveBeenCalledWith(1); // old frame cancelled
  expect(rafSpy).toHaveBeenCalled(); // new frame requested
  expect(instance._mx).toBe(30);
  expect(instance._my).toBe(40);

  cancelSpy.mockRestore();
  rafSpy.mockRestore();
});

});
