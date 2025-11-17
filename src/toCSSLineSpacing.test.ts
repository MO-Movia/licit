/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import toCSSLineSpacing, {
    LINE_SPACING_100,
    LINE_SPACING_115,
    LINE_SPACING_150,
    LINE_SPACING_200,
  } from './toCSSLineSpacing';

  describe('toCSSLineSpacing', () => {
    it('should return the normalized line spacing for numeric input', () => {
      expect(toCSSLineSpacing(1.5)).toBe(LINE_SPACING_150);
      expect(toCSSLineSpacing(1.0)).toBe(LINE_SPACING_100);
      expect(toCSSLineSpacing(2.0)).toBe(LINE_SPACING_200);
    });

    it('should return the calibrated value for Google Docs exports', () => {
      expect(toCSSLineSpacing('100%')).toBe(LINE_SPACING_100);
      expect(toCSSLineSpacing('115%')).toBe(LINE_SPACING_115);
      expect(toCSSLineSpacing('150%')).toBe(LINE_SPACING_150);
      expect(toCSSLineSpacing('200%')).toBe(LINE_SPACING_200);
    });

    it('should return the same value if it is not a recognized percentage or number', () => {
      expect(toCSSLineSpacing('125px')).toBe('125px');
      expect(toCSSLineSpacing('15px')).toBe('15px');
      expect(toCSSLineSpacing('abc')).toBe('abc');
    });

    it('should return an empty string for null, undefined, or empty input', () => {
      expect(toCSSLineSpacing(null)).toBe('');
      expect(toCSSLineSpacing(undefined)).toBe('');
      expect(toCSSLineSpacing('')).toBe('');
    });
  });
