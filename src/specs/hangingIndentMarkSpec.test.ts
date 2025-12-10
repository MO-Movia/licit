/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {Mark} from 'prosemirror-model';
import HangingIndentMarkSpec from './hangingIndentMarkSpec';

describe('HangingIndentMarkSpec', () => {
  describe('attrs', () => {
    it('should have correct default attributes', () => {
      expect(HangingIndentMarkSpec.attrs).toEqual({
        prefix: {default: null},
        overridden: {default: false},
      });
    });
  });

  describe('basic properties', () => {
    it('should be inline', () => {
      expect(HangingIndentMarkSpec.inline).toBe(true);
    });

    it('should belong to inline group', () => {
      expect(HangingIndentMarkSpec.group).toBe('inline');
    });

    it('should have rank of 5000', () => {
      expect(HangingIndentMarkSpec.rank).toBe(5000);
    });
  });

  describe('parseDOM', () => {
    let mockElement: HTMLElement | string;

    beforeEach(() => {
      mockElement = document.createElement('span');
    });

    it('should parse span with prefix attribute', () => {
      (mockElement as HTMLElement).setAttribute('prefix', 'test-prefix');

      const parser = HangingIndentMarkSpec.parseDOM[0];
      const result = parser.getAttrs(mockElement as HTMLElement & string);

      expect(result).toEqual({
        prefix: 'test-prefix',
        overridden: true,
      });
    });

    it('should parse span with empty prefix attribute', () => {
      (mockElement as HTMLElement).setAttribute('prefix', '');

      const parser = HangingIndentMarkSpec.parseDOM[0];
      const result = parser.getAttrs(mockElement as HTMLElement & string);

      expect(result).toEqual({
        prefix: null,
        overridden: true,
      });
    });

    it('should parse span with numeric prefix', () => {
      (mockElement as HTMLElement).setAttribute('prefix', '123');

      const parser = HangingIndentMarkSpec.parseDOM[0];
      const result = parser.getAttrs(mockElement as HTMLElement & string);

      expect(result).toEqual({
        prefix: '123',
        overridden: true,
      });
    });

    it('should parse span with special characters in prefix', () => {
      (mockElement as HTMLElement).setAttribute('prefix', '>> ');

      const parser = HangingIndentMarkSpec.parseDOM[0];
      const result = parser.getAttrs(mockElement as HTMLElement & string);

      expect(result).toEqual({
        prefix: '>> ',
        overridden: true,
      });
    });

    it('should parse span with bullet point prefix', () => {
      (mockElement as HTMLElement).setAttribute('prefix', '• ');

      const parser = HangingIndentMarkSpec.parseDOM[0];
      const result = parser.getAttrs(mockElement as HTMLElement & string);

      expect(result).toEqual({
        prefix: '• ',
        overridden: true,
      });
    });

    it('should parse span with numbered list prefix', () => {
      (mockElement as HTMLElement).setAttribute('prefix', '1. ');

      const parser = HangingIndentMarkSpec.parseDOM[0];
      const result = parser.getAttrs(mockElement as HTMLElement & string);

      expect(result).toEqual({
        prefix: '1. ',
        overridden: true,
      });
    });

    it('should always set overridden to true', () => {
      (mockElement as HTMLElement).setAttribute('prefix', 'any-value');

      const parser = HangingIndentMarkSpec.parseDOM[0];
      const result = parser.getAttrs(mockElement as HTMLElement & string);

      expect(result).toHaveProperty('overridden', true);
    });
  });

  describe('toDOM', () => {
    it('should render span with prefix attribute', () => {
      const mark = {
        attrs: {
          prefix: 'test-prefix',
          overridden: false,
        },
      } as unknown as Mark;

      const result = HangingIndentMarkSpec.toDOM(mark, true);

      expect(result).toEqual([
        'span',
        {
          prefix: 'test-prefix',
          overridden: true,
        },
        0,
      ]);
    });

    it('should render span with null prefix', () => {
      const mark = {
        attrs: {
          prefix: null,
          overridden: false,
        },
      } as unknown as Mark;

      const result = HangingIndentMarkSpec.toDOM(mark, true);

      expect(result).toEqual([
        'span',
        {
          prefix: null,
          overridden: true,
        },
        0,
      ]);
    });

    it('should render span with numeric prefix', () => {
      const mark = {
        attrs: {
          prefix: '123',
          overridden: false,
        },
      } as unknown as Mark;

      const result = HangingIndentMarkSpec.toDOM(mark, true);

      expect(result).toEqual([
        'span',
        {
          prefix: '123',
          overridden: true,
        },
        0,
      ]);
    });

    it('should render span with bullet point prefix', () => {
      const mark = {
        attrs: {
          prefix: '• ',
          overridden: false,
        },
      } as unknown as Mark;

      const result = HangingIndentMarkSpec.toDOM(mark, true);

      expect(result).toEqual([
        'span',
        {
          prefix: '• ',
          overridden: true,
        },
        0,
      ]);
    });

    it('should always set overridden to true in output', () => {
      const mark = {
        attrs: {
          prefix: 'test',
          overridden: false, // This should be ignored
        },
      } as unknown as Mark;

      const result = HangingIndentMarkSpec.toDOM(mark, true);

      expect(result[1]).toHaveProperty('overridden', true);
    });

    it('should render span with empty string prefix', () => {
      const mark = {
        attrs: {
          prefix: '',
          overridden: false,
        },
      } as unknown as Mark;

      const result = HangingIndentMarkSpec.toDOM(mark, true);

      expect(result).toEqual([
        'span',
        {
          prefix: '',
          overridden: true,
        },
        0,
      ]);
    });
  });

  describe('parseDOM tag selector', () => {
    it('should target span tags with prefix attribute', () => {
      const parser = HangingIndentMarkSpec.parseDOM[0];
      expect(parser.tag).toBe('span[prefix]');
    });
  });

  describe('integration', () => {
    it('should round-trip through parseDOM and toDOM', () => {
      const originalPrefix = 'test-prefix';

      // Create a DOM element
      const element = document.createElement('span');
      element.setAttribute('prefix', originalPrefix);

      // Parse it
      const parser = HangingIndentMarkSpec.parseDOM[0];
      const parsed = parser.getAttrs(element as HTMLElement & string);

      // Convert back to DOM
      const mark = {attrs: parsed} as unknown as Mark;
      const domOutput = HangingIndentMarkSpec.toDOM(mark, true);

      expect(domOutput).toEqual([
        'span',
        {
          prefix: originalPrefix,
          overridden: true,
        },
        0,
      ]);
    });

    it('should handle null prefix round-trip', () => {
      // Create a DOM element with empty prefix
      const element = document.createElement('span');
      element.setAttribute('prefix', '');

      // Parse it
      const parser = HangingIndentMarkSpec.parseDOM[0];
      const parsed = parser.getAttrs(element as HTMLElement & string);

      expect(parsed).toEqual({
        prefix: null,
        overridden: true,
      });

      // Convert back to DOM
      const mark = {attrs: parsed} as unknown as Mark;
      const domOutput = HangingIndentMarkSpec.toDOM(mark, true);

      expect(domOutput).toEqual([
        'span',
        {
          prefix: null,
          overridden: true,
        },
        0,
      ]);
    });
  });
});
