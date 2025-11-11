/**
 * @jest-environment jsdom
 */
// Use `require` to import dynamically after module reset
let observe: (
  node: HTMLElement,
  callback: (entry: ResizeObserverEntry) => void
) => void;
let unobserve: (
  node: HTMLElement,
  callback?: (entry: ResizeObserverEntry) => void
) => void;

// --- Mocks and Setup ---
const observeMock = jest.fn();
const unobserveMock = jest.fn();
const disconnectMock = jest.fn();

type MockObserverInstance = {
  observe: jest.Mock;
  unobserve: jest.Mock;
  disconnect: jest.Mock;
  trigger: (entries: ResizeObserverEntry[]) => void;
};

let lastObserverInstance: MockObserverInstance | null = null;
let lastObserverCallback: ((entries: ResizeObserverEntry[]) => void) | null =
  null;

// Mock the polyfill implementation
jest.mock('resize-observer-polyfill', () =>
  jest
    .fn()
    .mockImplementation(
      (callback: (entries: ResizeObserverEntry[]) => void) => {
        lastObserverCallback = callback;

        lastObserverInstance = {
          observe: observeMock,
          unobserve: unobserveMock,
          disconnect: disconnectMock,

          trigger(entries: ResizeObserverEntry[]) {
            if (lastObserverCallback) {
              lastObserverCallback(entries);
            }
          },
        };

        return lastObserverInstance;
      }
    )
);

describe('ResizeObserver utils', () => {
  let div: HTMLElement;
  let mockEntry: ResizeObserverEntry;

  beforeEach(() => {
    jest.resetModules();

    // Re-import the functions after resetting the modules cache
    const module = jest.requireActual('./resizeObserver');
    observe = module.observe;
    unobserve = module.unobserve;

    // --- Reset Mocks ---
    jest.clearAllMocks();
    lastObserverInstance = null;
    lastObserverCallback = null;

    div = document.createElement('div');
    mockEntry = {
      target: div,
      contentRect: {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        top: 0,
        right: 100,
        bottom: 50,
        left: 0,
        toJSON: function () {
          throw new Error('Function not implemented.');
        },
      },
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    };
  });

  test('unobserve() should return immediately if observer instance is null', () => {
    const div2 = document.createElement('div');
    const cb = jest.fn();

    // Call unobserve() before any call to observe(), testing the early exit guard.
    unobserve(div2, cb);

    // Assert that no observer methods were ever called
    expect(observeMock).not.toHaveBeenCalled();
    expect(unobserveMock).not.toHaveBeenCalled();
    expect(disconnectMock).not.toHaveBeenCalled();
  });

  test('observe() should attach first callback and call observer.observe', () => {
    const cb = jest.fn();
    observe(div, cb);

    // Should call the observer's observe method
    expect(observeMock).toHaveBeenCalledWith(div);
  });

  test('observe() should use existing observer instance for second element', () => {
    const div2 = document.createElement('div');
    observe(div, jest.fn());
    observe(div2, jest.fn());

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
  //  Unobserve Tests: Removal Logic (with and without callback)
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

    expect(unobserveMock).toHaveBeenCalledWith(div);
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  test('unobserve() should disconnect the observer when no nodes are left', () => {
    const cb1 = jest.fn();
    observe(div, cb1); // Observer is initialized here

    // Now, unobserve the only node
    unobserve(div);

    expect(unobserveMock).toHaveBeenCalledWith(div);
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });
});
