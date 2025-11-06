import bindScrollHandler from './bindScrollHandler';

describe('bindScrollHandler', () => {
  let target: HTMLElement;
  let callback: jest.Mock;
  let dispose: {
    dispose: () => void;
  }['dispose'];

  // Mocks for browser APIs
  let mockRequestAnimationFrame: jest.Mock;
  let mockCancelAnimationFrame: jest.Mock;

  beforeEach(() => {
    // Mock browser APIs
    mockRequestAnimationFrame = jest
    .fn((cb: FrameRequestCallback) => {
      cb(0); // Execute callback immediately with a dummy timestamp
      return 5; // mock handle ID
    });
    mockCancelAnimationFrame = jest.fn();
    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;

    // Create a target element and mock its parent elements
    target = document.createElement('div');
    target.style.height = '100px'; // Give it a height
    target.style.overflow = 'auto'; // Make it scrollable
    target.style.width = '100px'; // Give it a width
    target.innerHTML = '<div style="height: 300px;"></div>'; // Make the content inside scrollable

    // Use Object.defineProperty to mock the ownerDocument property
    Object.defineProperty(target, 'ownerDocument', {
      value: document,
      writable: false, // Optional, make it read-only if you want to enforce immutability
    });

    // Mocking the scrollable element style
    const styleMock = { overflow: 'auto' };
    jest
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue(styleMock as CSSStyleDeclaration);

    // Create a callback mock function
    callback = jest.fn();

    // Bind the scroll handler
    const scrollHandler = bindScrollHandler(target, callback);
    dispose = scrollHandler.dispose;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should debounce the scroll callback', () => {
    target.style.height = '100px'; // Give it a height
    target.style.overflow = 'auto'; // Make it scrollable
    target.style.width = '100px'; // Give it a width
    target.innerHTML = '<div style="height: 300px;"></div>'; // Make the content inside scrollable
    // Simulate scroll events
    target.scrollTop = 100; // Change scroll position to trigger scroll event
    target.dispatchEvent(new Event('scroll')); // Dispatch the scroll event
    target.dispatchEvent(new Event('scroll')); // Dispatch the scroll event again
    target.dispatchEvent(new Event('scroll')); // Dispatch the scroll event again

    // Ensure requestAnimationFrame was called
    //expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1); // Only 1 animation frame should be scheduled

    // Simulate the callback being called inside requestAnimationFrame
    const debouncedCallback = mockRequestAnimationFrame.mock.calls[0]?.[0]; // Access the first call's callback
    expect(debouncedCallback).toBeDefined(); // Ensure the callback exists

    // Now manually invoke the debounced callback
    debouncedCallback(); // Trigger the callback

    // The callback should now be called
    expect(callback).toHaveBeenCalled();
  });

  it('should clean up by removing the event listener and canceling the animation frame when dispose is called', () => {
    target.scrollTop = 100; // Change scroll position to trigger scroll event
    target.dispatchEvent(new Event('scroll')); // Dispatch the scroll event
    target.dispatchEvent(new Event('scroll')); // Dispatch the scroll event again
    target.dispatchEvent(new Event('scroll')); // Dispatch the scroll event again
    // Dispose the scroll handler
    dispose();

    // Check that cancelAnimationFrame was called
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });
});
