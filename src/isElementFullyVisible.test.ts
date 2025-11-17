/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import isElementFullyVisible from './isElementFullyVisible';
import { fromHTMlElement } from '@modusoperandi/licit-ui-commands';

// Mock `fromHTMlElement`
jest.mock('@modusoperandi/licit-ui-commands', () => ({
    fromHTMlElement: jest.fn(),
}));

describe('isElementFullyVisible', () => {
    let el;

    beforeEach(() => {
        // Create a mock HTML element
        el = document.createElement('div');

        // Mock `document.elementFromPoint` by directly replacing it
        document.elementFromPoint = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('returns false if `fromHTMlElement` returns zero dimensions', () => {
        (fromHTMlElement as jest.Mock).mockReturnValue({ x: 0, y: 0, w: 0, h: 0 });

        expect(isElementFullyVisible(el)).toBe(false);
    });

    test('returns false if `elementFromPoint` returns null', () => {
        (fromHTMlElement as jest.Mock).mockReturnValue({ x: 50, y: 50, w: 100, h: 100 });
        (document.elementFromPoint as jest.Mock).mockReturnValue(null);

        expect(isElementFullyVisible(el)).toBe(false);
    });

    test('returns true if `elementFromPoint` directly matches `el`', () => {
        (fromHTMlElement as jest.Mock).mockReturnValue({ x: 50, y: 50, w: 100, h: 100 });
        (document.elementFromPoint as jest.Mock).mockReturnValue(el);

        expect(isElementFullyVisible(el)).toBe(true);
    });

    test('returns true if `elementFromPoint` is a `TABLE` and `el` is a `TD`', () => {
        const table = document.createElement('table');
        el = document.createElement('td');

        (fromHTMlElement as jest.Mock).mockReturnValue({ x: 50, y: 50, w: 100, h: 100 });
        (document.elementFromPoint as jest.Mock).mockReturnValue(table);

        expect(isElementFullyVisible(el)).toBe(true);
    });

    test('returns true if `el` contains the element returned by `elementFromPoint`', () => {
        const child = document.createElement('span');
        el.appendChild(child);

        (fromHTMlElement as jest.Mock).mockReturnValue({ x: 50, y: 50, w: 100, h: 100 });
        (document.elementFromPoint as jest.Mock).mockReturnValue(child);

        expect(isElementFullyVisible(el)).toBe(true);
    });

    test('returns false if `elementFromPoint` does not match `el` and is not contained', () => {
        const anotherEl = document.createElement('div');

        (fromHTMlElement as jest.Mock).mockReturnValue({ x: 50, y: 50, w: 100, h: 100 });
        (document.elementFromPoint as jest.Mock).mockReturnValue(anotherEl);

        expect(isElementFullyVisible(el)).toBe(false);
    });
});
