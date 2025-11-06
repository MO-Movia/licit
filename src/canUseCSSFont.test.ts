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
  const mockFont = { family: 'Arial' } as unknown as FontFace;
  const mockFonts: Partial<FontFaceSet> = {
    check: jest.fn(() => true),
    values: jest.fn(() => new Set([mockFont]).values()),
  };

  Object.defineProperty(document, 'fonts', {
    value: mockFonts as FontFaceSet,
  });

  const result = await canUseCSSFont('Arial');
  expect(result).toBe(false);
});

it('should return false if the font is not available', async () => {
  const mockFonts: Partial<FontFaceSet> = {
    check: jest.fn(() => false),
    values: jest.fn(() => new Set<FontFace>().values()),
  };

  Object.defineProperty(document, 'fonts', {
    value: mockFonts as FontFaceSet,
  });

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

  const promise = canUseCSSFont(FONT_NAME);
  readyResolve();

  await Promise.resolve(); // let the check() run once
  expect(mockFonts.status).toBe('loading');

  jest.advanceTimersByTime(loadDelay - 1);
  status = 'loaded';
  jest.advanceTimersByTime(1);

  await Promise.resolve();
  await Promise.resolve();

  const result = await promise;

  expect(result).toBe(true);
  expect(mockFonts.values).toHaveBeenCalledTimes(1);

  jest.useRealTimers();
});

it('should return cached result on subsequent calls for the same font', async () => {
  const FONT_NAME = 'CachedFont';
  const mockFont = { family: FONT_NAME } as unknown as FontFace;
  
  const mockFonts: Partial<FontFaceSet> = {
    check: jest.fn(() => true),
    status: 'loaded',
    ready: Promise.resolve({} as FontFaceSet),
    values: jest.fn(() => [mockFont].values()),
  };

  Object.defineProperty(document, 'fonts', {
    value: mockFonts as FontFaceSet,
    configurable: true,
  });

  // First call - should check fonts and cache the result
  const result1 = await canUseCSSFont(FONT_NAME);
  expect(result1).toBe(true);
  expect(mockFonts.values).toHaveBeenCalledTimes(1);

  // Second call - should return cached result without checking fonts again
  const result2 = await canUseCSSFont(FONT_NAME);
  expect(result2).toBe(true);
  expect(mockFonts.values).toHaveBeenCalledTimes(1); // Still 1, not called again

  // Third call - verify cache is still being used
  const result3 = await canUseCSSFont(FONT_NAME);
  expect(result3).toBe(true);
  expect(mockFonts.values).toHaveBeenCalledTimes(1); // Still 1
});

});
