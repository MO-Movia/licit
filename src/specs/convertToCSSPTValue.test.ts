import convertToCSSPTValue, { PX_TO_PT_RATIO } from './convertToCSSPTValue';

describe('convertToCSSPTValue', () => {
  it('should convert px to pt correctly', () => {
    const styleValue = '16px';
    const result = convertToCSSPTValue(styleValue);
    expect(result).toBeCloseTo(16 * PX_TO_PT_RATIO);
  });

  it('should return the value as is for pt', () => {
    const styleValue = '12pt';
    const result = convertToCSSPTValue(styleValue);
    expect(result).toBe(12);
  });

  it('should return 0 for invalid unit', () => {
    const styleValue = '20em';
    const result = convertToCSSPTValue(styleValue);
    expect(result).toBe(0);
  });

  it('should return 0 for non-numeric values', () => {
    const styleValue = 'abcpx';
    const result = convertToCSSPTValue(styleValue);
    expect(result).toBe(0);
  });

  it('should return 0 for empty string', () => {
    const styleValue = '';
    const result = convertToCSSPTValue(styleValue);
    expect(result).toBe(0);
  });

  it('should handle decimal px values correctly', () => {
    const styleValue = '1.5px';
    const result = convertToCSSPTValue(styleValue);
    expect(result).toBeCloseTo(1.5 * PX_TO_PT_RATIO);
  });
});