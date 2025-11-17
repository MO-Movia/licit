/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import toHexColor from './toHexColor';
import Color from 'color';

// Mock Color to control its behavior in the tests
jest.mock('color', () => {
  return jest.fn().mockImplementation((color: string) => {
    if (color === 'invalid') {
      throw new Error('Invalid color');
    }
    return {
      hex: jest.fn().mockReturnValue(`#${color}`), // Mocking hex() method to return a mock hex value
    };
  });
});

describe('toHexColor', () => {
  it('should return an empty string for null or undefined input', () => {
    expect(toHexColor(null)).toBe('');
    expect(toHexColor(undefined)).toBe('');
  });

  it('should return the predefined color mappings', () => {
    expect(toHexColor('transparent')).toBe('');
    expect(toHexColor('inherit')).toBe('');
  });

  it('should return the hex color for valid color input', () => {
    expect(toHexColor('red')).toBe('#red');
    expect(toHexColor('blue')).toBe('#blue');
    expect(toHexColor('green')).toBe('#green');
  });

  it('should handle invalid color inputs gracefully', () => {
    // Invalid color should return an empty string and log a warning
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(toHexColor('invalid')).toBe('');
    expect(consoleWarnSpy).toHaveBeenCalledWith('unable to convert to hex', 'invalid');
    consoleWarnSpy.mockRestore();
  });

  it('should cache hex values for repeated colors', () => {
    // Test caching behavior for a color that is converted
    const colorInput = 'yellow';
    expect(toHexColor(colorInput)).toBe('#yellow'); // First time, conversion happens
    expect(toHexColor(colorInput)).toBe('#yellow'); // Second time, it should return the cached value

    // We can spy on the Color function to ensure it is not called a second time
    const colorMock = Color as unknown as jest.Mock;
    expect(colorMock).toHaveBeenCalledTimes(1);
  });
});
