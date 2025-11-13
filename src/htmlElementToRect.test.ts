/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import htmlElementToRect, { Rect } from './htmlElementToRect';

// Mock HTMLElement and its methods
describe('htmlElementToRect', () => {
  let mockHTMLElement: HTMLElement;

  beforeEach(() => {
    mockHTMLElement = document.createElement('div');
    mockHTMLElement.getBoundingClientRect = jest.fn();
  });

  it('should correctly convert HTML element bounding rect to Rect type', () => {
    // Mocking the return value of getBoundingClientRect
    const mockRect = { left: 100, top: 200, width: 300, height: 400 };
    (mockHTMLElement.getBoundingClientRect as jest.Mock).mockReturnValue(mockRect);

    // Call the function
    const result: Rect = htmlElementToRect(mockHTMLElement);

    // Assertions
    expect(result).toEqual({
      x: mockRect.left,
      y: mockRect.top,
      w: mockRect.width,
      h: mockRect.height,
    });
  });

  it('should handle a div with zero dimensions', () => {
    const mockRect = { left: 0, top: 0, width: 0, height: 0 };
    (mockHTMLElement.getBoundingClientRect as jest.Mock).mockReturnValue(mockRect);

    const result: Rect = htmlElementToRect(mockHTMLElement);

    expect(result).toEqual({
      x: mockRect.left,
      y: mockRect.top,
      w: mockRect.width,
      h: mockRect.height,
    });
  });

  it('should handle a div with negative position values', () => {
    const mockRect = { left: -50, top: -100, width: 200, height: 150 };
    (mockHTMLElement.getBoundingClientRect as jest.Mock).mockReturnValue(mockRect);

    const result: Rect = htmlElementToRect(mockHTMLElement);

    expect(result).toEqual({
      x: mockRect.left,
      y: mockRect.top,
      w: mockRect.width,
      h: mockRect.height,
    });
  });

  it('should handle a div with large position and size values', () => {
    const mockRect = { left: 10000, top: 10000, width: 1000, height: 1000 };
    (mockHTMLElement.getBoundingClientRect as jest.Mock).mockReturnValue(mockRect);

    const result: Rect = htmlElementToRect(mockHTMLElement);

    expect(result).toEqual({
      x: mockRect.left,
      y: mockRect.top,
      w: mockRect.width,
      h: mockRect.height,
    });
  });
});
