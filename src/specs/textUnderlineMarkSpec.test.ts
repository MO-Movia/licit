import TextUnderlineMarkSpec from './textUnderlineMarkSpec'; // Adjust the import path as needed
import { Mark } from 'prosemirror-model';

describe('TextUnderlineMarkSpec', () => {

  describe('parseDOM', () => {

    it('should parse text-decoration-line: underline style correctly', () => {
      const mockElement = {
        style: {
          textDecorationLine: 'underline',
        },
      } as any;

      const result = TextUnderlineMarkSpec.parseDOM[1].getAttrs(mockElement.style.textDecorationLine);

      // Since the style is 'underline', it should return null
      expect(result).toBeNull();
    });

    it('should parse text-decoration: underline style correctly', () => {
      const mockElement = {
        style: {
          textDecoration: 'underline',
        },
      } as any;

      const result = TextUnderlineMarkSpec.parseDOM[2].getAttrs(mockElement.style.textDecoration);

      // Since the style is 'underline', it should return null
      expect(result).toBeNull();
    });

    it('should not parse if text-decoration-line is not underline', () => {
      const mockElement = {
        style: {
          textDecorationLine: 'none',
        },
      } as any;

      const result = TextUnderlineMarkSpec.parseDOM[1].getAttrs(mockElement.style.textDecorationLine);

      // Since the style is not 'underline', it should return false
      expect(result).toBe(false);
    });

    it('should not parse if text-decoration is not underline', () => {
      const mockElement = {
        style: {
          textDecoration: 'none',
        },
      } as any;

      const result = TextUnderlineMarkSpec.parseDOM[2].getAttrs(mockElement.style.textDecoration);

      // Since the style is not 'underline', it should return false
      expect(result).toBe(false);
    });
  });

  describe('toDOM', () => {
    it('should generate a <u> element', () => {
      const mockMark = {
        attrs: {}, // No specific attributes in this case
      } as Mark;

      const result = TextUnderlineMarkSpec.toDOM(mockMark,false);

      // The expected result is a <u> element with no attributes or content
      expect(result).toEqual(['u', 0]);
    });
  });

});
