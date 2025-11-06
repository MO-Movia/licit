import TextSubMarkSpec from './textSubMarkSpec'; // Adjust the import path as needed
import {Mark} from 'prosemirror-model';

describe('TextSubMarkSpec', () => {
  describe('parseDOM', () => {
    it('should return { overridden: true } for <sub overridden="true">', () => {
      const mockElement = document.createElement('sub');
      mockElement.setAttribute('overridden', 'true');

      const parseRules = TextSubMarkSpec.parseDOM ?? [];
      const rule = parseRules.find((r) => 'tag' in r && r.tag === 'sub');
      expect(rule).toBeTruthy();

      const result = rule.getAttrs(
        mockElement as unknown as HTMLElement & string
      );
      expect(result).toEqual({overridden: true});
    });

    it('should return { overridden: false } for <sub overridden="false">', () => {
      const mockElement = document.createElement('sub');
      mockElement.setAttribute('overridden', 'false');

      const parseRules = TextSubMarkSpec.parseDOM ?? [];
      const rule = parseRules.find((r) => 'tag' in r && r.tag === 'sub');
      expect(rule).toBeTruthy();

      const result = rule.getAttrs(
        mockElement as unknown as HTMLElement & string
      );
      expect(result).toEqual({overridden: false});
    });

    it('should return { overridden: false } if overridden attribute is missing', () => {
      const mockElement = document.createElement('sub');

      const parseRules = TextSubMarkSpec.parseDOM ?? [];
      const rule = parseRules.find((r) => 'tag' in r && r.tag === 'sub');
      expect(rule).toBeTruthy();

      const result = rule.getAttrs(
        mockElement as unknown as HTMLElement & string
      );
      expect(result).toEqual({overridden: false});
    });

    it('should return { overridden: true } when style is "vertical-align: sub"', () => {
      const parseRules = TextSubMarkSpec.parseDOM ?? [];
      const rule = parseRules.find(
        (r) => 'style' in r && r.style === 'vertical-align'
      );
      expect(rule).toBeTruthy();

      const result = rule.getAttrs('sub' as unknown as HTMLElement & string);
      expect(result).toEqual({overridden: true});
    });

    it('should return null when style is not "sub"', () => {
      const parseRules = TextSubMarkSpec.parseDOM ?? [];
      const rule = parseRules.find(
        (r) => 'style' in r && r.style === 'vertical-align'
      );
      expect(rule).toBeTruthy();

      const result = rule.getAttrs(
        'baseline' as unknown as HTMLElement & string
      );
      expect(result).toBeNull();
    });
  });

  describe('toDOM', () => {
    it('should return correct DOM structure when overridden is true', () => {
      const mockMark = {
        attrs: {overridden: true},
      } as unknown as Mark;

      if (!TextSubMarkSpec.toDOM) {
        throw new Error('SubMarkSpec.toDOM is not defined');
      }

      const result = TextSubMarkSpec.toDOM(mockMark, false);
      expect(result).toEqual(['sub', {overridden: true}, 0]);
    });

    it('should return correct DOM structure when overridden is false', () => {
      const mockMark = {
        attrs: {overridden: false},
      } as unknown as Mark;

      if (!TextSubMarkSpec.toDOM) {
        throw new Error('SubMarkSpec.toDOM is not defined');
      }

      const result = TextSubMarkSpec.toDOM(mockMark, false);
      expect(result).toEqual(['sub', {overridden: false}, 0]);
    });
  });
});
