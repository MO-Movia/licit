/**
 * @jest-environment jsdom
 */

// Use `require` to import dynamically after module reset
let observe: (node: HTMLElement, callback: (entry: any) => void) => void;
let unobserve: (node: HTMLElement, callback?: (entry: any) => void) => void;

// --- Mocks and Setup ---
const observeMock = jest.fn();
const unobserveMock = jest.fn();
const disconnectMock = jest.fn();

let lastObserverInstance: any = null;
let lastObserverCallback: ((entries: any) => void) | null = null;

// Mock the polyfill implementation
jest.mock('resize-observer-polyfill', () => {
  return jest.fn().mockImplementation((callback) => {
    // Store the callback that will be called when resize happens
    lastObserverCallback = callback;
    lastObserverInstance = {
      observe: observeMock,
      unobserve: unobserveMock,
      disconnect: disconnectMock,
      trigger(entries: Array<any>) {
        if (lastObserverCallback) {
          callback(entries);
        }
      },
    };
    return lastObserverInstance;
  });
});

describe('ResizeObserver utils', () => {
  let div: HTMLElement;
  const mockEntry = {
    target: null as unknown as Element,
    contentRect: {
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      top: 0,
      right: 100,
      bottom: 50,
      left: 0,
    },
  };

  beforeEach(() => {
    // --- CRITICAL FIX: Resetting Module Cache ---
    // Resetting modules ensures the internal 'instance' variable in resizeObserver.ts is null
    jest.resetModules();

    // Re-import the functions after resetting the modules cache
    const module = require('./resizeObserver');
    observe = module.observe;
    unobserve = module.unobserve;

    // --- Reset Mocks ---
    jest.clearAllMocks();
    lastObserverInstance = null;
    lastObserverCallback = null;

    div = document.createElement('div');
    mockEntry.target = div;
  });

  // -----------------------------------------------------------------------
  // 🎯 Targeted Test for Uncovered Branch: if (!observer) { return; }
  // -----------------------------------------------------------------------
  test('unobserve() should return immediately if observer instance is null', () => {
    const div2 = document.createElement('div');
    const cb = jest.fn();

    // Call unobserve() before any call to observe(), testing the early exit guard.
    unobserve(div2, cb);

    // Assert that no observer methods were ever called
    expect(observeMock).not.toHaveBeenCalled();
    expect(unobserveMock).not.toHaveBeenCalled();
    expect(disconnectMock).not.toHaveBeenCalled();
    // Ensure the ResizeObserver constructor was not called
    expect(require('resize-observer-polyfill')).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // ✅ Observation & Callback Execution Tests
  // -----------------------------------------------------------------------
  test('observe() should attach first callback and call observer.observe', () => {
    const cb = jest.fn();
    observe(div, cb);

    // Should create a new ResizeObserver instance
    expect(require('resize-observer-polyfill')).toHaveBeenCalledTimes(1);
    // Should call the observer's observe method
    expect(observeMock).toHaveBeenCalledWith(div);
  });

  test('observe() should use existing observer instance for second element', () => {
    const div2 = document.createElement('div');
    observe(div, jest.fn());
    observe(div2, jest.fn());

    // Should only create one ResizeObserver instance (singleton logic)
    expect(require('resize-observer-polyfill')).toHaveBeenCalledTimes(1);
    // Should call observe twice (once for div, once for div2)
    expect(observeMock).toHaveBeenCalledTimes(2);
    expect(observeMock).toHaveBeenNthCalledWith(2, div2);
  });

  test('observe() should append callback if already observing the node', () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();

    observe(div, cb1);
    observe(div, cb2);

    // Still only one call to the underlying observer.observe(div)
    expect(observeMock).toHaveBeenCalledTimes(1);
  });

  test('resize should execute all callbacks for the target node', () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();

    observe(div, cb1);
    observe(div, cb2);

    // Manually trigger the internal observer callback
    lastObserverInstance.trigger([mockEntry]);

    // Both callbacks should have been called once with the correct entry
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb1).toHaveBeenCalledWith(mockEntry);
    expect(cb2).toHaveBeenCalledWith(mockEntry);
  });

  // -----------------------------------------------------------------------
  // ✅ Unobserve Tests: Removal Logic (with and without callback)
  // -----------------------------------------------------------------------
  test('unobserve() with callback should remove only that specific callback', () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();

    observe(div, cb1);
    observe(div, cb2);

    unobserve(div, cb1); // Unobserve only cb1

    // Trigger resize
    lastObserverInstance.trigger([mockEntry]);

    // cb1 should NOT be called, cb2 SHOULD be called
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(unobserveMock).toHaveBeenCalledWith(div);
    expect(disconnectMock).not.toHaveBeenCalled();
  });

// Inside the 'ResizeObserver utils' describe block:

  test('unobserve() without callback should delete all callbacks and disconnect', () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();

    observe(div, cb1);
    observe(div, cb2); // Only 'div' is observed

    // Unobserve ALL callbacks on div
    unobserve(div);

    // Trigger resize (should do nothing)
    lastObserverInstance.trigger([mockEntry]);

    // Neither callback should be called
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled();

    // The underlying observer.unobserve(div) is called
    expect(unobserveMock).toHaveBeenCalledWith(div);

    // 💥 FIX: Expect disconnect, as 'div' was the last observed node.
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });
  // -----------------------------------------------------------------------
  // ✅ Unobserve Tests: Cleanup/Disconnect Logic
  // -----------------------------------------------------------------------
  test('unobserve() should disconnect the observer when no nodes are left', () => {
    const cb1 = jest.fn();
    observe(div, cb1); // Observer is initialized here

    // Now, unobserve the only node
    unobserve(div);

    // The underlying observer.unobserve(div) is called
    expect(unobserveMock).toHaveBeenCalledWith(div);
    // Disconnect should be called because nodesObserving.size is now 0
    expect(disconnectMock).toHaveBeenCalledTimes(1);
    // The next test will confirm the observer is successfully un-initialized
  });
});