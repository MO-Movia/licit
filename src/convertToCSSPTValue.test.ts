import convertToCSSPTValue, { PX_TO_PT_RATIO } from "./convertToCSSPTValue";

describe('convertToCSSPTValue', () => {

  it('should convert px to pt correctly', () => {
    const pxValue = '10px';
    const expectedPtValue = 10 * PX_TO_PT_RATIO; // 10px should convert to pt using the PX_TO_PT_RATIO
    const result = convertToCSSPTValue(pxValue);
    expect(result).toBeCloseTo(expectedPtValue, 5); // Use toBeCloseTo for floating point precision
  });

  it('should return 0 for an invalid value (non-matching string)', () => {
    const invalidValue = 'invalid';
    const result = convertToCSSPTValue(invalidValue);
    expect(result).toBe(0);
  });

  it('should convert pt to pt correctly', () => {
    const ptValue = '10pt';
    const result = convertToCSSPTValue(ptValue);
    expect(result).toBe(10); // PT values should remain unchanged
  });

  it('should return 0 for an empty string', () => {
    const emptyValue = '';
    const result = convertToCSSPTValue(emptyValue);
    expect(result).toBe(0);
  });

  it('should return 0 for an invalid format (e.g., "10p")', () => {
    const invalidFormat = '10p';
    const result = convertToCSSPTValue(invalidFormat);
    expect(result).toBe(0);
  });

  it('should handle edge case of 0px correctly', () => {
    const zeroPxValue = '0px';
    const result = convertToCSSPTValue(zeroPxValue);
    expect(result).toBe(0); // 0px should be 0pt
  });

  it('should handle edge case of 0pt correctly', () => {
    const zeroPtValue = '0pt';
    const result = convertToCSSPTValue(zeroPtValue);
    expect(result).toBe(0); // 0pt should be 0pt
  });

  it('should return 0 for values without units', () => {
    const noUnitValue = '10';
    const result = convertToCSSPTValue(noUnitValue);
    expect(result).toBe(0); // Should return 0 as there’s no unit
  });

});
