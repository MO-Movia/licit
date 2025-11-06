import TextSuperMarkSpec from './textSuperMarkSpec'; // Adjust the import path as needed
import {Mark} from 'prosemirror-model';

describe('TextSuperMarkSpec', () => {
  describe('parseDOM', () => {
    it('should parse <sup> tag and return correct overridden value', () => {
      const parseRules = TextSuperMarkSpec.parseDOM ?? [];
      const rule = parseRules.find(
        (
          r
        ): r is {
          tag: string;
          getAttrs: (dom: HTMLElement) => {overridden: boolean};
        } => (r as {tag?: string}).tag === 'sup'
      );

      expect(rule).toBeDefined();

      const mockElement = document.createElement('sup');
      mockElement.setAttribute('overridden', 'true');

      const attrsTrue = rule.getAttrs(mockElement);
      expect(attrsTrue).toEqual({overridden: true});

      mockElement.setAttribute('overridden', 'false');
      const attrsFalse = rule.getAttrs(mockElement);
      expect(attrsFalse).toEqual({overridden: false});
    });

    it('should handle vertical-align style rule for sup', () => {
      const parseRules = TextSuperMarkSpec.parseDOM ?? [];
      const rule = parseRules.find(
        (
          r
        ): r is {
          style: string;
          getAttrs: (value: string) => {overridden: boolean} | null;
        } => (r as {style?: string}).style === 'vertical-align'
      );

      expect(rule).toBeDefined();

      const attrsSup = rule.getAttrs('sup');
      expect(attrsSup).toEqual({overridden: true});

      const attrsOther = rule.getAttrs('baseline');
      expect(attrsOther).toBeNull();
    });
  });

  describe('toDOM', () => {
    it('should return correct DOM structure when overridden is true', () => {
      const mockMark = {
        attrs: {overridden: true},
      } as unknown as Mark;

      if (!TextSuperMarkSpec.toDOM) {
        throw new Error('SupMarkSpec.toDOM is not defined');
      }

      const result = TextSuperMarkSpec.toDOM(mockMark, false);
      expect(result).toEqual(['sup', {overridden: true}, 0]);
    });

    it('should return correct DOM structure when overridden is false', () => {
      const mockMark = {
        attrs: {overridden: false},
      } as unknown as Mark;

      if (!TextSuperMarkSpec.toDOM) {
        throw new Error('SupMarkSpec.toDOM is not defined');
      }

      const result = TextSuperMarkSpec.toDOM(mockMark, false);
      expect(result).toEqual(['sup', {overridden: false}, 0]);
    });
  });
});
