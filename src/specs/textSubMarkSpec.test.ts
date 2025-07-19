import TextSubMarkSpec from './textSubMarkSpec'; // Adjust the import path as needed
import { Mark } from 'prosemirror-model';

describe('TextSubMarkSpec', () => {

  describe('parseDOM', () => {

    it('should parse vertical-align: sub style correctly', () => {
      const mockElement = {
        style: {
          verticalAlign: 'sub',
        },
      } as any;

      const result = TextSubMarkSpec.parseDOM[1].getAttrs(mockElement.style.verticalAlign);

      // Since the style is 'sub', it should return null
      expect(result).toBeNull();
    });

    it('should not parse if vertical-align is not sub', () => {
      const mockElement = {
        style: {
          verticalAlign: 'normal',
        },
      } as any;

      const result = TextSubMarkSpec.parseDOM[1].getAttrs(mockElement.style.verticalAlign);

      // Since the style is not 'sub', it should return false
      expect(result).toBe(false);
    });
  });

  describe('toDOM', () => {
    it('should generate a <sub> element', () => {
      const mockMark = {
        attrs: {}, // No specific attributes in this case
      } as Mark;

      const result = TextSubMarkSpec.toDOM(mockMark,false);

      // The expected result is a <sub> element with no attributes or content
      expect(result).toEqual(['sub', 0]);
    });
  });

});
