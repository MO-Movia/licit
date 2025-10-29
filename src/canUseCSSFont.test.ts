import canUseCSSFont from './canUseCSSFont';

describe('canUseCSSFont', () => {
  let originalFonts: FontFaceSet;

  beforeAll(() => {

  });

  beforeEach(() => {
    // Store the original `document.fonts`
    originalFonts = document.fonts;
    jest.resetModules();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    // Restore the original `document.fonts`
    Object.defineProperty(document, 'fonts', { value: originalFonts });
  });

  it('should return false if FontFaceSet API is not supported', async () => {
    Object.defineProperty(document, 'fonts', { value: undefined });
    const result = await canUseCSSFont('NonExistentFont');
    expect(result).toBe(false);
  });

  it('should return true if the font is available', async () => {
    (document.fonts as any).check.mockReturnValue(true);
    (document.fonts as any).values.mockReturnValue([{ family: 'Arial' }]);

    const result = await canUseCSSFont('Arial');
    expect(result).toBe(true);
  });

  it('should return false if the font is not available', async () => {
    (document.fonts as any).check.mockReturnValue(false);
    (document.fonts as any).values.mockReturnValue([]);

    const result = await canUseCSSFont('NonExistentFont');
    expect(result).toBe(false);
  });

  it("should wait for fonts to load if status is initially 'loading'", async () => {
    let status = 'loading';

    Object.defineProperty(document, 'fonts', {
      value: {
        check: jest.fn().mockReturnValue(true),
        ready: Promise.resolve().then(() => {
          status = 'loaded'; // Simulate async status update
        }),
        get status() {
          return status;
        },
        values: jest.fn().mockReturnValue([{ family: 'Arial' }]),
      },
    });

    const result = await canUseCSSFont('Arial');
    expect(result).toBe(true);
  });
it("should use setTimeout and wait for status to change from 'loading' to 'loaded'", async () => {
  jest.useFakeTimers();

  let status = 'loading';
  const FONT_NAME = 'DelayedFont';
  const loadDelay = 350;

  // We'll manually control when ready resolves
  let readyResolve!: () => void;
  const readyPromise = new Promise<void>((resolve) => (readyResolve = resolve));

  const mockFonts = {
    check: jest.fn().mockReturnValue(true),
    ready: readyPromise, // ready will resolve only when we call readyResolve()
    get status() {
      return status;
    },
    values: jest.fn().mockReturnValue([{ family: FONT_NAME }]),
  };

  Object.defineProperty(document, 'fonts', { value: mockFonts, configurable: true });

  // Start the function — this will call doc.fonts.ready.then(check)
  const promise = canUseCSSFont(FONT_NAME);

  // Resolve the .ready promise (so check() runs)
  readyResolve();

  // First run: status = 'loading', so it should schedule a timeout
  await Promise.resolve(); // let the check() run once
  expect(mockFonts.status).toBe('loading');

  // Advance time — this triggers setTimeout(check, 350)
  jest.advanceTimersByTime(loadDelay - 1);

  // Change status just before the final tick
  status = 'loaded';

  // Advance one more ms to reach 350
  jest.advanceTimersByTime(1);

  // Let the async microtasks (like the promise resolve) flush
  await Promise.resolve();
  await Promise.resolve();

  const result = await promise;

  expect(result).toBe(true);
  expect(mockFonts.values).toHaveBeenCalledTimes(1);

  jest.useRealTimers();
});

});
