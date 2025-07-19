import TextSuperMarkSpec from './textSuperMarkSpec'; // Adjust the import path as needed
import { Mark } from 'prosemirror-model';

describe('TextSuperMarkSpec', () => {

  describe('parseDOM', () => {

    it('should parse vertical-align: super style correctly', () => {
      const mockElement = {
        style: {
          verticalAlign: 'super',
        },
      } as any;

      const result = TextSuperMarkSpec.parseDOM[1].getAttrs(mockElement.style.verticalAlign);

      // Since the style is 'super', it should return null
      expect(result).toBeNull();
    });

    it('should not parse if vertical-align is not super', () => {
      const mockElement = {
        style: {
          verticalAlign: 'normal',
        },
      } as any;

      const result = TextSuperMarkSpec.parseDOM[1].getAttrs(mockElement.style.verticalAlign);

      // Since the style is not 'super', it should return false
      expect(result).toBe(false);
    });
  });

  describe('toDOM', () => {
    it('should generate a <sup> element', () => {
      const mockMark = {
        attrs: {}, // No specific attributes in this case
      } as Mark;

      const result = TextSuperMarkSpec.toDOM(mockMark,false);

      // The expected result is a <sup> element with no attributes or content
      expect(result).toEqual(['sup', 0]);
    });
  });

});
