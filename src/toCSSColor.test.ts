/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import toCSSColor, {isTransparent} from './toCSSColor';

// Mocking the Color library to test if our code interacts correctly
jest.mock('color', () => {
  return jest.fn().mockImplementation((input: string) => {
    return {
      alpha: () => {
        if (input === 'rgba(0,0,0,0)') {
          return 0;
        }
        return 1;
      },
      toString: () => input,
      hex: () => {
        if (input === 'invalid') {
          throw new Error('Invalid color');
        }
        return input.toLowerCase();
      }, // Just return the lowercased value for hex conversion
    };
  });
});

describe('colorUtils', () => {
  describe('toCSSColor', () => {
    it('should return an empty string for falsy input', () => {
      expect(toCSSColor('')).toBe('');
      expect(toCSSColor(null as unknown as string)).toBe('');
      expect(toCSSColor(undefined as unknown as string)).toBe('');
    });

    it('should return transparent rgba for the "transparent" keyword', () => {
      expect(toCSSColor('transparent')).toBe('rgba(0,0,0,0)');
    });

    it('should return an empty string for the "inherit" keyword', () => {
      expect(toCSSColor('inherit')).toBe('');
    });

    it('should return rgba(0,0,0,0) when given an rgba with alpha 0', () => {
      const result = toCSSColor('rgba(0,0,0,0)');
      expect(result).toBe('rgba(0,0,0,0)');
    });

    it('should return the same rgba string if alpha is not 0', () => {
      const result = toCSSColor('rgba(255,0,0,1)');
      expect(result).toBe('rgba(255,0,0,1)');
    });

    it('should return a hex color string for valid hex input', () => {
      const result = toCSSColor('#FF5733');
      expect(result).toBe('#ff5733');
    });

    it('should return an empty string for invalid input', () => {
      const result = toCSSColor('invalid');
      expect(result).toBe('');
    });

    it('should cache results', () => {
      const firstCall = toCSSColor('rgba(255,0,0,1)');
      const secondCall = toCSSColor('rgba(255,0,0,1)');
      expect(firstCall).toBe(secondCall); // Same result should be returned
    });
  });

  describe('isTransparent', () => {
    it('should return true for empty or falsy input', () => {
      expect(isTransparent('')).toBe(true);
      expect(isTransparent(null  as unknown as string)).toBe(true);
      expect(isTransparent(undefined  as unknown as string)).toBe(true);
    });

    it('should return true for rgba(0,0,0,0)', () => {
      expect(isTransparent('rgba(0,0,0,0)')).toBe(true);
    });

    it('should return false for any non-transparent rgba or hex input', () => {
      expect(isTransparent('rgba(255,0,0,1)')).toBe(false);
      expect(isTransparent('#FF5733')).toBe(false);
    });
  });
});
