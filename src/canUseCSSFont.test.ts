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
});
