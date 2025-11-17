/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import TextUnderlineMarkSpec from './textUnderlineMarkSpec'; // Adjust the import path as needed
import {Mark} from 'prosemirror-model';

describe('TextUnderlineMarkSpec', () => {
  describe('parseDOM', () => {
    it('should correctly parse overridden="true" attribute', () => {
      const parseRules = TextUnderlineMarkSpec.parseDOM ?? [];
      const rule = parseRules.find((r) => r.tag === 'u');
      expect(rule).toBeTruthy();

      const mockElement = document.createElement('u');
      mockElement.setAttribute('overridden', 'true');

      // Cast to match ParseRule input type
      const attrs = rule?.getAttrs?.(
        mockElement as unknown as HTMLElement & string
      );
      expect(attrs).toEqual({overridden: true});
    });

    it('should correctly parse overridden="false" attribute', () => {
      const parseRules = TextUnderlineMarkSpec.parseDOM ?? [];
      const rule = parseRules.find((r) => r.tag === 'u');
      expect(rule).toBeTruthy();

      const mockElement = document.createElement('u');
      mockElement.setAttribute('overridden', 'false');

      const attrs = rule?.getAttrs?.(
        mockElement as unknown as HTMLElement & string
      );
      expect(attrs).toEqual({overridden: false});
    });

    it('should default to false if overridden attribute is missing', () => {
      const parseRules = TextUnderlineMarkSpec.parseDOM ?? [];
      const rule = parseRules.find((r) => r.tag === 'u');
      expect(rule).toBeTruthy();

      const mockElement = document.createElement('u');
      const attrs = rule?.getAttrs?.(
        mockElement as unknown as HTMLElement & string
      );
      expect(attrs).toEqual({overridden: false});
    });
  });

  describe('toDOM', () => {
    it('should return a <u> element with overridden=true attribute', () => {
      const mockMark = {
        attrs: {overridden: true},
      } as unknown as Mark;

      expect(TextUnderlineMarkSpec.toDOM).toBeDefined();

      const result = TextUnderlineMarkSpec.toDOM(mockMark, false);

      expect(result).toEqual(['u', {overridden: true}, 0]);
    });

    it('should return a <u> element with overridden=false attribute when not set', () => {
      const mockMark = {
        attrs: {overridden: false},
      } as unknown as Mark;

      const result = TextUnderlineMarkSpec.toDOM(mockMark, false);

      expect(result).toEqual(['u', {overridden: false}, 0]);
    });
  });
});
