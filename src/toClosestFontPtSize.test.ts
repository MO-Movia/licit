import { toClosestFontPtSize } from './toClosestFontPtSize';
import convertToCSSPTValue from './convertToCSSPTValue';

// Mock the convertToCSSPTValue function
jest.mock('./convertToCSSPTValue', () => jest.fn());

describe('toClosestFontPtSize', () => {
  it('should return the same value if the input is already in FONT_PT_SIZES', () => {
    // Mock the return value of convertToCSSPTValue to be 12
    (convertToCSSPTValue as jest.Mock).mockReturnValue(12);

    const result = toClosestFontPtSize('12px');
    expect(result).toBe(12);
  });

  it('should return the closest font size if the input is not in FONT_PT_SIZES', () => {
    // Mock convertToCSSPTValue to return 15 (closest size should be 14)
    (convertToCSSPTValue as jest.Mock).mockReturnValue(15);

    const result = toClosestFontPtSize('15px');
    expect(result).toBe(14);
  });

  it('should return the closest font size for values below the smallest available size', () => {
    // Mock convertToCSSPTValue to return 7 (closest size should be 8)
    (convertToCSSPTValue as jest.Mock).mockReturnValue(7);

    const result = toClosestFontPtSize('7px');
    expect(result).toBe(8);
  });

  it('should return the closest font size for values above the largest available size', () => {
    // Mock convertToCSSPTValue to return 100 (closest size should be 90)
    (convertToCSSPTValue as jest.Mock).mockReturnValue(100);

    const result = toClosestFontPtSize('100px');
    expect(result).toBe(90);
  });

  it('should handle invalid input gracefully', () => {
    // Mock convertToCSSPTValue to return NaN or handle invalid values
    (convertToCSSPTValue as jest.Mock).mockReturnValue(NaN);

    const result = toClosestFontPtSize('invalid-value');
    expect(result).toBe(Number.NEGATIVE_INFINITY);
  });
});
